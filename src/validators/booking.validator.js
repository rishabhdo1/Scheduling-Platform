const AppError = require('../utils/AppError');

function validateGetSlots({ date }) {
  if (!date)
    throw new AppError('Query param "date" is required (YYYY-MM-DD)', 400);
  if (isNaN(new Date(date).getTime()))
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
}

function validateCreateBooking({ eventTypeId, guestName, guestEmail, startTime }) {
  if (!eventTypeId || !guestName || !guestEmail || !startTime)
    throw new AppError('eventTypeId, guestName, guestEmail, and startTime are required', 400);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail))
    throw new AppError('Invalid guest email format', 400);

  if (isNaN(new Date(startTime).getTime()))
    throw new AppError('Invalid startTime — use ISO 8601 format', 400);
}

function validateCancelBooking(body) {
  // reason is optional — no required fields
}

module.exports = { validateGetSlots, validateCreateBooking, validateCancelBooking };
