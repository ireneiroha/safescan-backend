const ocr = require('../services/ocr.service');
const analyzeText = require('../services/ingredientAnalysis.service');
const db = require('../db');

/**
 * Persist a completed scan + its ingredients to the database.
 * Returns the new scan id (or null on failure — non-fatal).
 */
async function persistScan(userId, ocrText, analysis) {
  try {
    const { summary } = analysis;
    const dbSummary = {
      safeCount: summary.safe,
      riskyCount: summary.risky,
      restrictedCount: summary.restricted,
      unknownCount: summary.unknown,
    };

    const { rows } = await db.query(
      `INSERT INTO scans (user_id, ocr_text, summary) VALUES ($1, $2, $3) RETURNING id`,
      [userId, ocrText, JSON.stringify(dbSummary)]
    );
    const scanId = rows[0].id;

    // Save each ingredient result (fire-and-forget sub-inserts)
    const inserts = analysis.results.map((r) =>
      db.query(
        `INSERT INTO scan_ingredients (scan_id, raw_text, risk) VALUES ($1, $2, $3)`,
        [scanId, r.ingredient, r.status]
      )
    );
    await Promise.all(inserts);

    return scanId;
  } catch (err) {
    // Non-fatal: log but don't crash the response
    console.error('[scan] Failed to persist scan to DB:', err.message);
    return null;
  }
}

/**
 * POST /api/scan
 * multipart/form-data: image=<file>
 * Returns extractedText + analysis.
 */
exports.scanImage = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('Image is required. Please take a photo or upload a JPG/PNG.');
      err.statusCode = 400;
      throw err;
    }

    const extractedText = await ocr(req.file.buffer);

    if (!extractedText || extractedText.length < 3) {
      return res.status(422).json({
        error: 'Unable to read the label text. Try better lighting, move closer, or hold the camera steady.',
        requestId: req.id,
      });
    }

    const analysis = analyzeText(extractedText);

    const scanId = await persistScan(req.user.id, extractedText, analysis);

    res.json({
      scanId,
      extractedText,
      ...analysis,
      disclaimer:
        'SafeScan provides informational guidance only and is not medical advice. If you have a reaction or concern, consult a healthcare professional.',
    });
  } catch (e) {
    next(e);
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

    const scanId = await persistScan(req.user.id, text, analysis);

    res.json({
      scanId,
      extractedText: text,
      ...analysis,
      disclaimer:
        'SafeScan provides informational guidance only and is not medical advice. If you have a reaction or concern, consult a healthcare professional.',
    });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/scan
 * Returns the authenticated user's scan history (newest first).
 */
exports.getHistory = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, summary, created_at AS "createdAt"
       FROM scans
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    const data = rows.map((row) => ({
      id: row.id,
      productCategory: 'Scanned Product',
      createdAt: row.createdAt,
      summary: row.summary ?? { safeCount: 0, riskyCount: 0, restrictedCount: 0, unknownCount: 0 },
    }));

    res.json({ data });
  } catch (e) {
    next(e);
  }
};
