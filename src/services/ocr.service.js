const { createWorker } = require('tesseract.js');

// Singleton worker to avoid re-initializing on every request (major performance win)
let worker = null;
let initializing = null;

// Controlled error class for OCR errors
class OCRError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'OCRError';
    this.code = code;
  }
}

async function getWorker() {
  if (worker) return worker;
  if (initializing) return initializing;

  initializing = (async () => {
    try {
      const w = await createWorker({
        logger: () => {}, // silence verbose logs
      });
      await w.loadLanguage('eng');
      await w.initialize('eng');

      // You can tune OCR params here if needed.
      // await w.setParameters({ tessedit_pageseg_mode: 6 });

      worker = w;
      return worker;
    } catch (initError) {
      // Worker initialization failed - throw controlled error
      const error = new OCRError('OCR service not properly configured', 'OCR_NOT_CONFIGURED');
      error.originalError = initError;
      throw error;
    }
  })();

  return initializing;
}

/**
 * Run OCR on a Buffer and return extracted text.
 * Throws controlled errors with codes instead of raw errors.
 */
module.exports = async function extractTextFromImage(imageBuffer) {
  if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
    throw new OCRError('Invalid image buffer', 'OCR_INVALID_INPUT');
  }

  try {
    const w = await getWorker();
    const { data: { text } } = await w.recognize(imageBuffer);
    return (text || '').trim();
  } catch (error) {
    // If it's already a controlled error, rethrow it
    if (error instanceof OCRError) {
      throw error;
    }
    
    // Check for common fetch/axios/network errors
    if (error.message && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ECONNREFUSED')
    )) {
      const controlledError = new OCRError('OCR service unavailable due to network issue', 'OCR_FAILED');
      controlledError.originalError = error;
      throw controlledError;
    }
    
    // For any other unexpected errors, throw a controlled error
    const controlledError = new OCRError('OCR processing failed', 'OCR_FAILED');
    controlledError.originalError = error;
    throw controlledError;
  }
};

// Best-effort graceful shutdown
process.on('SIGINT', async () => {
  if (worker) {
    try { await worker.terminate(); } catch (_) {}
  }
  process.exit(0);
});
