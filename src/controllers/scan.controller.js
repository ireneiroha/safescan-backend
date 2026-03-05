const ocr = require('../services/ocr.service');
const analyzeRuleBased = require('../services/ingredientAnalysis.service');
const { analyzeWithAI } = require('../services/aiModel.service');
const { 
  analyzeTextWithDataset, 
  isDatasetAvailable, 
  mapRiskLevelToScanRisk, 
  matchIngredientsWithDataset
} = require('../services/datasetAnalysis.service');
const { extractIngredientsSection, parseIngredientTokens } = require('../utils/extractIngredientsSection');
const { explainIngredients, explainIngredientsBatched, isApiKeyConfigured } = require('../services/aiExplain.service');
const db = require('../db');

// Maximum number of ingredients to send to AI at once
const MAX_AI_INGREDIENTS = parseInt(process.env.MAX_AI_INGREDIENTS || '25', 10);

/**
 * POST /api/scan
 * multipart/form-data: image=<file>
 * Optional: productCategory (string)
 * Returns extractedText + analysis.
 * 
 * Public endpoint - works for guests and authenticated users
 * If authenticated: saves scan to history
 * If guest: returns results without saving
 */
exports.scanImage = async (req, res) => {
  const client = await db.pool.connect();
  
  // Determine if user is authenticated
  const isAuthenticated = req.user && req.user.id;
  const mode = isAuthenticated ? 'user' : 'guest';
  
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
        if (ocrError.response?.data) {
          console.error('OCR API error response:', JSON.stringify(ocrError.response.data));
        }
        return res.status(500).json({
          error: 'OCR processing failed',
          details: ocrError.message || 'Failed to extract text from image',
          requestId: req.id,
        });
      }
      
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

    // Get user ID if authenticated
    const userId = isAuthenticated ? req.user.id : null;
    const productCategory = req.body.productCategory || null;

    // Perform full analysis: dataset + AI for unmatched
    const analysis = await performFullAnalysis(ingredientsText);

    let scanId = null;
    let saved = false;

    // Only save to database if user is authenticated
    if (isAuthenticated) {
      try {
        // Save scan to database within a transaction
        await client.query('BEGIN');

        // Determine overall risk level
        const overallRisk = analysis.risk_level;

        // Insert scan record
        const scanResult = await client.query(
          'INSERT INTO scans (user_id, image_path, ocr_text, product_category, overall_risk) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [userId, req.file ? req.file.originalname : null, extractedText, productCategory, overallRisk]
        );
        scanId = scanResult.rows[0].id;

        // Insert scan_ingredients for each analyzed ingredient
        const allIngredients = analysis.ingredients || [];
        if (allIngredients.length > 0) {
          for (const result of allIngredients) {
            // Determine risk value for database
            const riskValue = mapStatusToDbValue(result.status);
            
            // Try to find existing ingredient or insert new
            let ingredientResult = await client.query(
              'SELECT id FROM ingredients WHERE LOWER(name) = LOWER($1)',
              [result.name]
            );

            let ingredientId;
            if (ingredientResult.rows.length === 0) {
              const newIngredient = await client.query(
                'INSERT INTO ingredients (name, normalized_name, risk) VALUES ($1, $2, $3) RETURNING id',
                [result.name, result.name.toLowerCase(), riskValue]
              );
              ingredientId = newIngredient.rows[0].id;
            } else {
              ingredientId = ingredientResult.rows[0].id;
            }

            // Insert scan_ingredient relationship
            await client.query(
              'INSERT INTO scan_ingredients (scan_id, ingredient_id, raw_text, risk) VALUES ($1, $2, $3, $4)',
              [scanId, ingredientId, result.name, riskValue]
            );
          }
        }

        await client.query('COMMIT');
        saved = true;
      } catch (dbError) {
        await client.query('ROLLBACK').catch(() => {});
        console.warn(`Failed to save scan to database: ${dbError.message}`);
        saved = false;
      }
    }

    res.json({
      scanId,
      saved,
      mode,
      extractedText,
      ingredientsText,
      productCategory,
      risk_level: analysis.risk_level,
      overallRisk: analysis.risk_level,
      ingredients: analysis.ingredients,
      summary: analysis.summary,
      source: analysis.source,
      disclaimer:
        'SafeScan provides informational guidance only and is not medical advice. If you have a reaction or concern, consult a healthcare professional.',
    });
  } catch (e) {
    console.error('Scan image error:', e.message);
    
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
 * 
 * Public endpoint - works for guests and authenticated users
 * If authenticated: saves scan to history
 * If guest: returns results without saving
 */
exports.analyzeText = async (req, res, next) => {
  const client = await db.pool.connect();
  
  // Determine if user is authenticated
  const isAuthenticated = req.user && req.user.id;
  const mode = isAuthenticated ? 'user' : 'guest';
  
  try {
    const { text, productCategory } = req.body || {};
    
    // Validate text is required
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Text is required',
      });
    }

    // Extract ingredients section from text
    const ingredientsText = extractIngredientsSection(text);

    // Perform full analysis with dataset + AI
    const analysis = await performFullAnalysis(ingredientsText);

    // Get user ID if authenticated
    const userId = isAuthenticated ? req.user.id : null;
    let scanId = null;
    let saved = false;
    
    // Only save to database if user is authenticated
    if (isAuthenticated) {
      try {
        await client.query('BEGIN');
        
        // Determine overall risk level
        const overallRisk = analysis.risk_level;

        // Insert scan record with productCategory
        const scanResult = await client.query(
          'INSERT INTO scans (user_id, ocr_text, product_category, overall_risk) VALUES ($1, $2, $3, $4) RETURNING id',
          [userId, text, productCategory || null, overallRisk]
        );
        scanId = scanResult.rows[0].id;

        // Insert scan_ingredients for each analyzed ingredient
        const allIngredients = analysis.ingredients || [];
        
        if (allIngredients.length > 0) {
          for (const ing of allIngredients) {
            // Map risk to database value
            const scanRisk = mapStatusToDbValue(ing.status);
            
            // Try to find existing ingredient or insert new
            let ingredientResult = await client.query(
              'SELECT id FROM ingredients WHERE LOWER(name) = LOWER($1)',
              [ing.name]
            );

            let ingredientId;
            if (ingredientResult.rows.length === 0) {
              const newIngredient = await client.query(
                'INSERT INTO ingredients (name, normalized_name, risk) VALUES ($1, $2, $3) RETURNING id',
                [ing.name, ing.name.toLowerCase(), scanRisk]
              );
              ingredientId = newIngredient.rows[0].id;
            } else {
              ingredientId = ingredientResult.rows[0].id;
            }

            // Insert scan_ingredient relationship
            await client.query(
              'INSERT INTO scan_ingredients (scan_id, ingredient_id, raw_text, risk) VALUES ($1, $2, $3, $4)',
              [scanId, ingredientId, ing.name, scanRisk]
            );
          }
        }

        await client.query('COMMIT');
        saved = true;
      } catch (dbError) {
        await client.query('ROLLBACK').catch(() => {});
        console.warn(`Failed to save scan to database: ${dbError.message}`);
        saved = false;
      }
    }

    // Build response with all ingredients in order
    const response = {
      scanId,
      saved,
      mode,
      extractedText: text,
      ingredientsText,
      productCategory: productCategory || null,
      risk_level: analysis.risk_level,
      overallRisk: analysis.risk_level,
      ingredients: analysis.ingredients,
      summary: analysis.summary,
      source: analysis.source,
      disclaimer:
        'SafeScan provides informational guidance only and is not medical advice. If you have a reaction or concern, consult a healthcare professional.',
    };

    res.json(response);
  } catch (e) {
    console.error(`Analyze text error: ${e.message}`);
    res.status(500).json({
      error: 'An error occurred while analyzing the text. Please try again.',
    });
  } finally {
    client.release();
  }
};

/**
 * Perform full analysis: dataset + AI for unmatched ingredients
 * Returns ingredients in the SAME order as parsed tokens
 * @param {string} text - Ingredient text to analyze
 * @returns {Promise<Object>} - Analysis result with all ingredients classified
 */
async function performFullAnalysis(text) {
  // Step 1: Parse ingredients into tokens (preserves order) and clean them
  let tokens = parseIngredientTokens(text)
    .map(t => t.trim())
    .filter(t => t.length > 1);
  
  if (!tokens || tokens.length === 0) {
    return createEmptyAnalysisResult();
  }

  // Step 2: Try dataset analysis to get known and unknown
  let knownResults = [];
  let unknownNames = [];
  let datasetAvailable = false;
  
  try {
    datasetAvailable = await isDatasetAvailable();
    if (datasetAvailable) {
      const result = await matchIngredientsWithDataset(tokens);
      knownResults = result.knownResults || [];
      unknownNames = result.unknownNames || [];
    } else {
      // Dataset not available - all are unknown
      unknownNames = [...tokens];
    }
  } catch (datasetError) {
    console.warn(`Dataset match failed: ${datasetError.message}`);
    // If dataset fails, treat all as unknown
    unknownNames = [...tokens];
  }

  // Step 3: AI classify unknown ingredients (if any and AI is configured)
  // Use explainIngredientsBatched for automatic deduplication and batching
  let aiResults = [];
  
  if (unknownNames.length > 0 && isApiKeyConfigured()) {
    try {
      // Use the batched function which handles deduplication and batching automatically
      const aiResponse = await explainIngredientsBatched(unknownNames, MAX_AI_INGREDIENTS);
      
      if (aiResponse && Array.isArray(aiResponse)) {
        aiResults = aiResponse.map(aiResult => ({
          name: aiResult.name,
          status: mapAIStatusToStatus(aiResult.status),
          reason: aiResult.explanation || '',
          source: 'ai'
        }));
      }
    } catch (aiError) {
      console.warn(`AI classification failed: ${aiError.message}`);
      // Don't crash - those ingredients will be marked as Unknown
    }
  }

  // Step 4: Build final ingredients array in SAME order as tokens
  const finalIngredients = [];
  
  for (const token of tokens) {
    const tokenLower = token.toLowerCase().trim();
    
    // Check if this token was matched in dataset - strict matching only
    const datasetMatch = knownResults.find(k =>
      k.name.toLowerCase().trim() === tokenLower
    );
    
    if (datasetMatch) {
      finalIngredients.push({
        name: datasetMatch.name,
        status: datasetMatch.status,
        reason: datasetMatch.reason,
        source: 'dataset'
      });
      continue;
    }
    
    // Check if this token was classified by AI - normalized comparison
    const aiMatch = aiResults.find(a =>
      a.name.toLowerCase().trim() === tokenLower
    );
    
    if (aiMatch) {
      finalIngredients.push({
        name: aiMatch.name,
        status: aiMatch.status,
        reason: aiMatch.reason,
        source: 'ai'
      });
      continue;
    }
    
    // Not found anywhere - mark as Unknown
    finalIngredients.push({
      name: token,
      status: 'Unknown',
      reason: 'Not found in dataset and AI classification unavailable or failed',
      source: 'unknown'
    });
  }

  // Step 5: Calculate summary counts
  const summary = {
    safeCount: finalIngredients.filter(ing => ing.status === 'Safe').length,
    riskyCount: finalIngredients.filter(ing => ing.status === 'Risky').length,
    restrictedCount: finalIngredients.filter(ing => ing.status === 'Restricted').length,
    unknownCount: finalIngredients.filter(ing => ing.status === 'Unknown').length
  };

  // Step 6: Determine overall risk level (highest severity)
  let risk_level = 'LOW';
  if (finalIngredients.some(ing => ing.status === 'Restricted')) {
    risk_level = 'HIGH';
  } else if (finalIngredients.some(ing => ing.status === 'Risky')) {
    risk_level = 'MEDIUM';
  } else if (finalIngredients.some(ing => ing.status === 'Unknown')) {
    risk_level = 'MEDIUM'; // Unknowns are treated as potentially risky
  }

  // Step 7: Determine source
  let source = 'rules';
  if (datasetAvailable && knownResults.length > 0) {
    source = aiResults.length > 0 ? 'dataset+ai' : 'dataset';
  } else if (aiResults.length > 0) {
    source = 'ai';
  }

  return {
    risk_level,
    overallRisk: risk_level,
    ingredients: finalIngredients,
    summary,
    source
  };
}

/**
 * Create empty analysis result when no ingredients found
 */
function createEmptyAnalysisResult() {
  return {
    risk_level: 'LOW',
    overallRisk: 'LOW',
    ingredients: [],
    summary: {
      safeCount: 0,
      riskyCount: 0,
      restrictedCount: 0,
      unknownCount: 0
    },
    source: 'rules'
  };
}

/**
 * Map status to database risk value
 */
function mapStatusToDbValue(status) {
  switch (status) {
    case 'Safe':
      return 'safe';
    case 'Risky':
      return 'risky';
    case 'Restricted':
      return 'restricted';
    default:
      return 'unknown';
  }
}

/**
 * Map AI status to standard status (Safe|Risky|Restricted|Unknown)
 */
function mapAIStatusToStatus(status) {
  if (!status) return 'Unknown';
  
  const normalized = String(status).toLowerCase().trim();
  
  if (normalized === 'safe') return 'Safe';
  if (normalized === 'risky') return 'Risky';
  if (normalized === 'restricted') return 'Restricted';
  
  return 'Unknown';
}

/**
 * Calculate summary counts from analysis results
 */
function calculateSummary(analysis) {
  if (!analysis.ingredients || analysis.ingredients.length === 0) {
    return {
      safeCount: 0,
      riskyCount: 0,
      restrictedCount: 0,
      unknownCount: 0
    };
  }
  
  return {
    safeCount: analysis.ingredients.filter(ing => ing.status === 'Safe').length,
    riskyCount: analysis.ingredients.filter(ing => ing.status === 'Risky').length,
    restrictedCount: analysis.ingredients.filter(ing => ing.status === 'Restricted').length,
    unknownCount: analysis.ingredients.filter(ing => ing.status === 'Unknown').length
  };
}

/**
 * Convert AI result format to rule-based format for unified response
 */
function convertAIRuleToFormat(aiResult) {
  const matchedIngredients = aiResult.matched_ingredients.map((ing) => ({
    name: ing.name,
    risk_level: ing.risk === 'HIGH' ? 'HIGH' : ing.risk === 'LOW' ? 'LOW' : 'MEDIUM',
    reason: ing.reason || ''
  }));

  const summary = {
    safeCount: matchedIngredients.filter(m => m.risk_level === 'LOW').length,
    riskyCount: matchedIngredients.filter(m => m.risk_level === 'MEDIUM').length,
    restrictedCount: matchedIngredients.filter(m => m.risk_level === 'HIGH').length
  };

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

