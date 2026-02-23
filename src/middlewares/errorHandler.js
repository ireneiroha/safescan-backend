module.exports = function errorHandler(err, req, res, next) {
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
