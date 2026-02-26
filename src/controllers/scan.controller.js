const ocr = require('../services/ocr.service');
const analyzeRuleBased = require('../services/ingredientAnalysis.service');
const { analyzeWithAI } = require('../services/aiModel.service');
const { analyzeTextWithDataset, isDatasetAvailable, mapRiskLevelToScanRisk } = require('../services/datasetAnalysis.service');
const extractIngredientsSection = require('../utils/extractIngredientsSection');
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
      
      // Handle specific OCR error codes from OCR.Space
      if (ocrError.code === 'OCR_NOT_CONFIGURED') {
        return res.status(503).json({
          error: 'OCR service not configured',
          details: 'Please set OCR_SPACE_API_KEY in environment variables',
          requestId: req.id,
        });
      }
      
      if (ocrError.code === 'OCR_DAILY_LIMIT') {
        return res.status(503).json({
          error: 'OCR daily limit exceeded',
          details: 'OCR.Space free API daily limit reached. Try again tomorrow.',
          requestId: req.id,
        });
      }
      
      if (ocrError.code === 'OCR_AUTH_FAILED') {
        return res.status(503).json({
          error: 'OCR API key invalid',
          details: 'Please check your OCR_SPACE_API_KEY',
          requestId: req.id,
        });
      }
      
      if (ocrError.code === 'OCR_NETWORK_ERROR') {
        return res.status(503).json({
          error: 'OCR service unavailable',
          details: 'Network error connecting to OCR service',
          requestId: req.id,
        });
      }
      
      if (ocrError.code === 'OCR_TIMEOUT') {
        return res.status(503).json({
          error: 'OCR service timed out',
          details: 'The image took too long to process. Try a smaller image.',
          requestId: req.id,
        });
      }
      
      if (ocrError.code === 'OCR_FAILED') {
        // Log detailed error response if available
        if (ocrError.response?.data) {
          console.error('OCR API error response:', JSON.stringify(ocrError.response.data));
        }
        return res.status(500).json({
          error: 'OCR processing failed',
          details: ocrError.message || 'Failed to extract text from image',
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

    // Extract ingredients section from OCR text
    const ingredientsText = extractIngredientsSection(extractedText);

    // Analyze the extracted ingredients section (or fallback to full text if extraction failed)
    const analysis = analyzeRuleBased(ingredientsText);

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
      ingredientsText,
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
 * JSON: { text: "...", productCategory: "..." }
 * Use this after the user edits OCR text on the frontend.
 * Tries dataset first, then AI, then falls back to rule-based analysis.
 * Returns matched_ingredients, risk_level, explanations, source, and summary counts.
 */
exports.analyzeText = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { text, productCategory } = req.body || {};
    
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

    // Calculate summary counts from the analysis results
    const summary = calculateSummary(analysis, source);

    // Save scan to database if user is authenticated
    const userId = req.user ? req.user.id : null;
    if (userId) {
      try {
        await client.query('BEGIN');
        
        // Insert scan record with productCategory
        const scanResult = await client.query(
          'INSERT INTO scans (user_id, ocr_text, product_category) VALUES ($1, $2, $3) RETURNING id',
          [userId, text, productCategory || null]
        );
        scanId = scanResult.rows[0].id;

        // Insert scan_ingredients for each matched ingredient
        // Use matched_ingredients from dataset/AI analysis
        const ingredientsToSave = analysis.matched_ingredients || [];
        
        if (ingredientsToSave.length > 0) {
          for (const ing of ingredientsToSave) {
            // Try to find existing ingredient or insert new
            let ingredientResult = await client.query(
              'SELECT id FROM ingredients WHERE LOWER(name) = LOWER($1)',
              [ing.name]
            );

            let ingredientId;
            if (ingredientResult.rows.length === 0) {
              // Map risk level to scan_ingredients risk value
              const scanRisk = mapRiskLevelToScanRisk(ing.risk_level);
              const newIngredient = await client.query(
                'INSERT INTO ingredients (name, normalized_name, risk) VALUES ($1, $2, $3) RETURNING id',
                [ing.name, ing.name.toLowerCase(), scanRisk]
              );
              ingredientId = newIngredient.rows[0].id;
            } else {
              ingredientId = ingredientResult.rows[0].id;
            }

            // Insert scan_ingredient relationship with proper risk mapping
            const scanRisk = mapRiskLevelToScanRisk(ing.risk_level);
            await client.query(
              'INSERT INTO scan_ingredients (scan_id, ingredient_id, raw_text, risk) VALUES ($1, $2, $3, $4)',
              [scanId, ingredientId, ing.name, scanRisk]
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
        productCategory: productCategory || null,
        risk_level: analysis.risk_level,
        matched_ingredients: analysis.matched_ingredients,
        explanations: analysis.explanations,
        source: 'dataset',
        summary,
        disclaimer:
          'SafeScan provides informational guidance only and is not medical advice. If you have a reaction or concern, consult a healthcare professional.',
      };
    } else if (source === 'ai') {
      // AI response format
      response = {
        scanId,
        extractedText: text,
        productCategory: productCategory || null,
        risk_level: analysis.risk_level,
        matched_ingredients: analysis.matched_ingredients,
        explanations: analysis.explanations,
        recommendations: analysis.recommendations,
        model_version: analysis.model_version,
        source: 'ai',
        summary,
        disclaimer:
          'SafeScan provides informational guidance only and is not medical advice. If you have a reaction or concern, consult a healthcare professional.',
      };
    } else {
      // Rule-based response format
      response = {
        scanId,
        extractedText: text,
        productCategory: productCategory || null,
        ...analysis,
        source: 'rules',
        summary,
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
 * Calculate summary counts from analysis results
 * safeCount = number of matched ingredients with risk_level == "LOW"
 * riskyCount = number of matched ingredients with risk_level == "MEDIUM"
 * restrictedCount = number of matched ingredients with risk_level == "HIGH"
 */
function calculateSummary(analysis, source) {
  // If dataset or AI analysis, use the summary from the analysis
  if (source === 'dataset' && analysis.summary) {
    return {
      safeCount: analysis.summary.safeCount || 0,
      riskyCount: analysis.summary.riskyCount || 0,
      restrictedCount: analysis.summary.restrictedCount || 0
    };
  }
  
  // For AI analysis, calculate from matched_ingredients
  if (source === 'ai' && analysis.matched_ingredients) {
    return {
      safeCount: analysis.matched_ingredients.filter(m => m.risk_level === 'LOW').length,
      riskyCount: analysis.matched_ingredients.filter(m => m.risk_level === 'MEDIUM').length,
      restrictedCount: analysis.matched_ingredients.filter(m => m.risk_level === 'HIGH').length
    };
  }
  
  // For rule-based analysis, use the summary from the analysis
  if (analysis.summary) {
    return {
      safeCount: analysis.summary.safe || 0,
      riskyCount: analysis.summary.risky || 0,
      restrictedCount: analysis.summary.restricted || 0
    };
  }
  
  // Default: calculate from results
  const matched = analysis.results || analysis.matched_ingredients || [];
  return {
    safeCount: matched.filter(m => (m.risk_level === 'LOW' || m.status === 'Safe')).length,
    riskyCount: matched.filter(m => (m.risk_level === 'MEDIUM' || m.status === 'Risky')).length,
    restrictedCount: matched.filter(m => (m.risk_level === 'HIGH' || m.status === 'Restricted')).length
  };
}

/**
 * Convert AI result format to match rule-based format for unified response
 * @param {Object} aiResult - Result from AI service
 * @returns {Object} - Converted result in unified format with summary
 */
function convertAIRuleToFormat(aiResult) {
  // Convert AI format to unified format
  const matchedIngredients = aiResult.matched_ingredients.map((ing) => ({
    name: ing.name,
    risk_level: ing.risk === 'HIGH' ? 'HIGH' : ing.risk === 'LOW' ? 'LOW' : 'MEDIUM',
    reason: ing.reason || ''
  }));

  // Calculate summary
  const summary = {
    safeCount: matchedIngredients.filter(m => m.risk_level === 'LOW').length,
    riskyCount: matchedIngredients.filter(m => m.risk_level === 'MEDIUM').length,
    restrictedCount: matchedIngredients.filter(m => m.risk_level === 'HIGH').length
  };

  // Determine overall risk level
  let risk_level = 'LOW';
  if (matchedIngredients.some(m => m.risk_level === 'HIGH')) {
    risk_level = 'HIGH';
  } else if (matchedIngredients.some(m => m.risk_level === 'MEDIUM')) {
    risk_level = 'MEDIUM';
  }

  const results = aiResult.matched_ingredients.map((ing) => ({
    ingredient: ing.name,
    status: ing.risk === 'HIGH' ? 'Restricted' : ing.risk === 'LOW' ? 'Safe' : 'Risky',
    explanation: ing.reason || '',
    matchedKey: ing.name.toLowerCase(),
  }));

  return {
    ingredients: aiResult.matched_ingredients.map((ing) => ing.name),
    results,
    summary,
    risk_level,
    matched_ingredients: matchedIngredients,
    explanations: aiResult.explanations || [],
    recommendations: aiResult.recommendations,
    model_version: aiResult.model_version,
  };
}
