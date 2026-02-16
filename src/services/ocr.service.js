const { createWorker } = require('tesseract.js');

// Singleton worker to avoid re-initializing on every request (major performance win)
let worker = null;
let initializing = null;

async function getWorker() {
  if (worker) return worker;
  if (initializing) return initializing;

  initializing = (async () => {
    const w = await createWorker({
      logger: () => {}, // silence verbose logs
    });
    await w.loadLanguage('eng');
    await w.initialize('eng');

    // You can tune OCR params here if needed.
    // await w.setParameters({ tessedit_pageseg_mode: 6 });

    worker = w;
    return worker;
  })();

  return initializing;
}

/**
 * Run OCR on a Buffer and return extracted text.
 */
module.exports = async function extractTextFromImage(imageBuffer) {
  if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
    throw new Error('Invalid image buffer');
  }

  const w = await getWorker();
  const { data: { text } } = await w.recognize(imageBuffer);
  return (text || '').trim();
};

// Best-effort graceful shutdown
process.on('SIGINT', async () => {
  if (worker) {
    try { await worker.terminate(); } catch (_) {}
  }
  process.exit(0);
});
