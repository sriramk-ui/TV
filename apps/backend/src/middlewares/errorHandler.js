function errorHandler(err, req, res, next) {
  console.error(`[API ERROR] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const errorCode = err.code || (err.name === 'ValidationError' ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected error occurred processing your request.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details: err.details || null
    }
  });
}

module.exports = {
  errorHandler
};
