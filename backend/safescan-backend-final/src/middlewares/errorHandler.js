module.exports = function errorHandler(err, req, res, next) {
  // Handle Multer errors specifically
  if (err.name === 'MulterError') {
    // File too large
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Image too large. Please upload an image under 5MB.',
        requestId: req.id,
      });
    }

    // Invalid file type
    if (err.message && err.message.includes('Only')) {
      return res.status(400).json({
        error: err.message,
        requestId: req.id,
      });
    }

    // Other Multer errors
    return res.status(400).json({
      error: 'File upload failed. Please try again with a valid image.',
      requestId: req.id,
    });
  }

  // Handle syntax errors (JSON parse errors)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      requestId: req.id,
    });
  }

  const status = err.statusCode || err.status || 500;

  // Friendly, plain-language errors for MVP usability
  const message =
    status === 400
      ? err.message || 'Bad request.'
      : status === 413
        ? 'Image too large. Please upload an image under 5MB.'
        : err.message || 'Something went wrong. Please try again.';

  res.status(status).json({
    error: message,
    requestId: req.id,
  });
};
