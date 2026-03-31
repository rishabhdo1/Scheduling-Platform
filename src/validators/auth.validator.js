const AppError = require('../utils/AppError');

function validateRegister({ name, email, password, timezone }) {
  if (!name || !email || !password)
    throw new AppError('name, email, and password are required', 400);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new AppError('Invalid email format', 400);

  if (password.length < 8)
    throw new AppError('Password must be at least 8 characters', 400);

  if (timezone && !isValidTimezone(timezone))
    throw new AppError('Invalid timezone', 400);
}

function validateLogin({ email, password }) {
  if (!email || !password)
    throw new AppError('email and password are required', 400);
}

function validateTimezone({ timezone }) {
  if (!timezone)
    throw new AppError('timezone is required', 400);
  if (!isValidTimezone(timezone))
    throw new AppError('Invalid IANA timezone string', 400);
}

function isValidTimezone(tz) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

module.exports = { validateRegister, validateLogin, validateTimezone };
