const ocr = require('../services/ocr.service');
const analyzeText = require('../services/ingredientAnalysis.service');

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

    // If OCR returns empty/garbage, return a friendly message
    if (!extractedText || extractedText.length < 3) {
      return res.status(422).json({
        error: 'Unable to read the label text. Try better lighting, move closer, or hold the camera steady.',
        requestId: req.id,
      });
    }

    const analysis = analyzeText(extractedText);

    res.json({
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
