const AppError = require('../utils/AppError');

function authenticate(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authorization token required', 401));
  }
  const token = header.split(' ')[1];
  try {
    const { verifyToken } = require('../utils/jwt');
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

module.exports = authenticate;
