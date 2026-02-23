const ocr = require('../services/ocr.service');
const analyzeText = require('../services/ingredientAnalysis.service');
const db = require('../db');

/**
 * POST /api/scan
 * multipart/form-data: image=<file>
 * Optional: productCategory (string)
 * Returns extractedText + analysis.
 */
exports.scanImage = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    if (!req.file) {
      const err = new Error('Image is required. Please take a photo or upload a JPG/PNG.');
      err.statusCode = 400;
      throw err;
    }

    const extractedText = await ocr(req.file.buffer);

    // If OCR returns empty/garbage, return a friendly message
    if (!extractedText || extractedText.length < 3) {
      return res.status(422).json({
        error: 'Unable to read the label text. Try better lighting, move closer, or hold the camera steady.',
        requestId: req.id,
      });
    }

    const analysis = analyzeText(extractedText);

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
    next(e);
  } finally {
    client.release();
  }
};

/**
 * POST /api/scan/analyze
 * JSON: { text: "..." }
 * Use this after the user edits OCR text on the frontend.
 */
exports.analyzeText = async (req, res, next) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
      const err = new Error('Text is required. Send JSON: { "text": "ingredients list..." }');
      err.statusCode = 400;
      throw err;
    }

    const analysis = analyzeText(text);

    res.json({
      extractedText: text,
      ...analysis,
      disclaimer:
        'SafeScan provides informational guidance only and is not medical advice. If you have a reaction or concern, consult a healthcare professional.',
    });
  } catch (e) {
    next(e);
  }
};
