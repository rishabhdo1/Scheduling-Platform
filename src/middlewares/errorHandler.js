function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err.isOperational) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }
  console.error('💥 Unexpected error:', err);
  return res.status(500).json({ success: false, error: 'Internal server error' });
}

module.exports = errorHandler;
