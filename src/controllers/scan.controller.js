const ocr = require('../services/ocr.service');
const analyzeRuleBased = require('../services/ingredientAnalysis.service');
const { analyzeWithAI } = require('../services/aiModel.service');
const { analyzeTextWithDataset, isDatasetAvailable } = require('../services/datasetAnalysis.service');
const db = require('../db');

/**
 * POST /api/scan
 * multipart/form-data: image=<file>
 * Optional: productCategory (string)
 * Returns extractedText + analysis.
 */
exports.scanImage = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    // Check if image file is present
    if (!req.file) {
      return res.status(400).json({
        error: "Image file is required. Use multipart/form-data with key 'image'.",
        requestId: req.id,
      });
    }

    let extractedText;
    try {
      extractedText = await ocr(req.file.buffer);
    } catch (ocrError) {
      console.error('OCR processing error:', ocrError.message);
      
      // Handle specific OCR error codes
      if (ocrError.code === 'OCR_DISABLED') {
        return res.status(503).json({
          error: 'OCR unavailable on this deployment',
          details: 'Image OCR is disabled on Render free tier. Use /api/scan/analyze (text) or run locally for image OCR.'
        });
      }
      
      if (ocrError.code === 'OCR_NOT_CONFIGURED') {
        return res.status(503).json({
          error: 'OCR service unavailable',
          requestId: req.id,
        });
      }
      
      if (ocrError.code === 'OCR_FAILED') {
        return res.status(503).json({
          error: 'OCR service unavailable',
          requestId: req.id,
        });
      }
      
      // Generic OCR failure
      return res.status(500).json({
        error: 'Scan processing failed',
        details: 'OCR extraction failed',
        requestId: req.id,
      });
    }

    // If OCR returns empty/garbage, return a friendly message
    if (!extractedText || extractedText.length < 3) {
      return res.status(422).json({
        error: 'Unable to read the label text. Try better lighting, move closer, or hold the camera steady.',
        requestId: req.id,
      });
    }

    const analysis = analyzeRuleBased(extractedText);

    // Get user ID if authenticated (optional)
    const userId = req.user ? req.user.id : null;
    const productCategory = req.body.productCategory || null;

    // Save scan to database within a transaction
    await client.query('BEGIN');

    // Insert scan record
    const scanResult = await client.query(
      'INSERT INTO scans (user_id, image_path, ocr_text, product_category) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, req.file ? req.file.originalname : null, extractedText, productCategory]
    );
    const scanId = scanResult.rows[0].id;

    // Insert scan_ingredients for each analyzed ingredient
    if (analysis.results && analysis.results.length > 0) {
      for (const result of analysis.results) {
        // Try to find existing ingredient or insert new
        let ingredientResult = await client.query(
          'SELECT id FROM ingredients WHERE LOWER(name) = LOWER($1)',
          [result.ingredient]
        );

        let ingredientId;
        if (ingredientResult.rows.length === 0) {
          const newIngredient = await client.query(
            'INSERT INTO ingredients (name, normalized_name, risk) VALUES ($1, $2, $3) RETURNING id',
            [result.ingredient, result.matchedKey, result.status]
          );
          ingredientId = newIngredient.rows[0].id;
        } else {
          ingredientId = ingredientResult.rows[0].id;
        }

        // Insert scan_ingredient relationship
        await client.query(
          'INSERT INTO scan_ingredients (scan_id, ingredient_id, raw_text, risk) VALUES ($1, $2, $3, $4)',
          [scanId, ingredientId, result.ingredient, result.status]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      scanId,
      extractedText,
      productCategory,
      ...analysis,
      disclaimer:
        'SafeScan provides informational guidance only and is not medical advice. If you have a reaction or concern, consult a healthcare professional.',
    });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Scan image error:', e.message);
    
    // Return 500 with safe message - never crash the server
    return res.status(500).json({
      error: 'Scan processing failed',
      details: 'An unexpected error occurred',
      requestId: req.id,
    });
  } finally {
    client.release();
  }
};

/**
 * POST /api/scan/analyze
 * JSON: { text: "..." }
 * Use this after the user edits OCR text on the frontend.
 * Tries dataset first, then AI, then falls back to rule-based analysis.
 * NOTE: Do NOT change /api/scan/analyze logic
 */
exports.analyzeText = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { text } = req.body || {};
    
    // Validate text is required
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Text is required',
      });
    }

    let analysis;
    let source = 'rules';
    let scanId = null;

    // Try dataset first if available
    const datasetAvailable = await isDatasetAvailable();
    if (datasetAvailable) {
      try {
        analysis = await analyzeTextWithDataset(text);
        source = 'dataset';
      } catch (datasetError) {
        // Dataset query failed, fall back to next option
        console.warn(`Dataset analysis failed, falling back: ${datasetError.message}`);
        
        // Try AI if configured, otherwise use rules
        if (process.env.AI_SERVICE_URL) {
          try {
            const aiResult = await analyzeWithAI(text);
            analysis = convertAIRuleToFormat(aiResult);
            source = 'ai';
          } catch (aiError) {
            console.warn(`AI analysis failed, falling back to rules: ${aiError.message}`);
            analysis = analyzeRuleBased(text);
            source = 'rules';
          }
        } else {
          analysis = analyzeRuleBased(text);
          source = 'rules';
        }
      }
    } else {
      // Dataset not available, try AI if configured, otherwise use rules
      if (process.env.AI_SERVICE_URL) {
        try {
          const aiResult = await analyzeWithAI(text);
          analysis = convertAIRuleToFormat(aiResult);
          source = 'ai';
        } catch (aiError) {
          console.warn(`AI analysis failed, falling back to rules: ${aiError.message}`);
          analysis = analyzeRuleBased(text);
          source = 'rules';
        }
      } else {
        analysis = analyzeRuleBased(text);
        source = 'rules';
      }
    }

    // Save scan to database if user is authenticated
    const userId = req.user ? req.user.id : null;
    if (userId) {
      try {
        await client.query('BEGIN');
        
        // Insert scan record
        const scanResult = await client.query(
          'INSERT INTO scans (user_id, ocr_text, product_category) VALUES ($1, $2, $3) RETURNING id',
          [userId, text, null]
        );
        scanId = scanResult.rows[0].id;

        // Insert scan_ingredients for each analyzed ingredient
        if (analysis.results && analysis.results.length > 0) {
          for (const result of analysis.results) {
            // Try to find existing ingredient or insert new
            let ingredientResult = await client.query(
              'SELECT id FROM ingredients WHERE LOWER(name) = LOWER($1)',
              [result.ingredient]
            );

            let ingredientId;
            if (ingredientResult.rows.length === 0) {
              const newIngredient = await client.query(
                'INSERT INTO ingredients (name, normalized_name, risk) VALUES ($1, $2, $3) RETURNING id',
                [result.ingredient, result.matchedKey, result.status]
              );
              ingredientId = newIngredient.rows[0].id;
            } else {
              ingredientId = ingredientResult.rows[0].id;
            }

            // Insert scan_ingredient relationship
            await client.query(
              'INSERT INTO scan_ingredients (scan_id, ingredient_id, raw_text, risk) VALUES ($1, $2, $3, $4)',
              [scanId, ingredientId, result.ingredient, result.status]
            );
          }
        }

        await client.query('COMMIT');
      } catch (dbError) {
        await client.query('ROLLBACK').catch(() => {});
        // Don't fail the request if DB save fails, just log it
        console.warn(`Failed to save scan to database: ${dbError.message}`);
      }
    }

    // Build response based on source
    let response;
    if (source === 'dataset') {
      // Dataset response format
      response = {
        scanId,
        extractedText: text,
        risk_level: analysis.risk_level,
        matched_ingredients: analysis.matched_ingredients,
        explanations: analysis.explanations,
        source: 'dataset',
        disclaimer:
          'SafeScan provides informational guidance only and is not medical advice. If you have a reaction or concern, consult a healthcare professional.',
      };
    } else if (source === 'ai') {
      // AI response format
      response = {
        scanId,
        extractedText: text,
        risk_level: analysis.risk_level,
        matched_ingredients: analysis.matched_ingredients,
        explanations: analysis.explanations,
        recommendations: analysis.recommendations,
        model_version: analysis.model_version,
        source: 'ai',
        disclaimer:
          'SafeScan provides informational guidance only and is not medical advice. If you have a reaction or concern, consult a healthcare professional.',
      };
    } else {
      // Rule-based response format
      response = {
        scanId,
        extractedText: text,
        ...analysis,
        source: 'rules',
        disclaimer:
          'SafeScan provides informational guidance only and is not medical advice. If you have a reaction or concern, consult a healthcare professional.',
      };
    }

    res.json(response);
  } catch (e) {
    // Ensure we always return JSON and never crash
    console.error(`Analyze text error: ${e.message}`);
    res.status(500).json({
      error: 'An error occurred while analyzing the text. Please try again.',
    });
  } finally {
    client.release();
  }
};

/**
 * Convert AI result format to match rule-based format for unified response
 * @param {Object} aiResult - Result from AI service
 * @returns {Object} - Converted result in rule-based format
 */
function convertAIRuleToFormat(aiResult) {
  // Convert AI format to rule-based format
  const results = aiResult.matched_ingredients.map((ing) => ({
    ingredient: ing.name,
    status: ing.risk === 'HIGH' ? 'Risky' : ing.risk === 'LOW' ? 'Safe' : 'Unknown',
    explanation: ing.reason || '',
    matchedKey: ing.name.toLowerCase(),
  }));

  const summary = results.reduce(
    (acc, r) => {
      acc.total += 1;
      const status = (r.status || 'Unknown').toLowerCase();
      if (status === 'safe') acc.safe += 1;
      else if (status === 'risky') acc.risky += 1;
      else if (status === 'restricted') acc.restricted += 1;
      else acc.unknown += 1;
      return acc;
    },
    { total: 0, safe: 0, risky: 0, restricted: 0, unknown: 0 }
  );

  return {
    ingredients: aiResult.matched_ingredients.map((ing) => ing.name),
    results,
    summary,
    risk_level: aiResult.risk_level,
    matched_ingredients: aiResult.matched_ingredients,
    explanations: aiResult.explanations,
    recommendations: aiResult.recommendations,
    model_version: aiResult.model_version,
  };
}
