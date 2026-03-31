const AppError = require('../utils/AppError');

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function validateCreateEventType({ title, duration, color }) {
  if (!title || !duration)
    throw new AppError('title and duration are required', 400);

  const mins = parseInt(duration, 10);
  if (isNaN(mins) || mins <= 0)
    throw new AppError('duration must be a positive integer (minutes)', 400);

  if (color && !HEX_COLOR.test(color))
    throw new AppError('color must be a valid hex color (e.g. #4f46e5)', 400);
}

function validateUpdateEventType({ title, duration, color }) {
  if (duration !== undefined) {
    const mins = parseInt(duration, 10);
    if (isNaN(mins) || mins <= 0)
      throw new AppError('duration must be a positive integer (minutes)', 400);
  }
  if (color !== undefined && !HEX_COLOR.test(color))
    throw new AppError('color must be a valid hex color (e.g. #4f46e5)', 400);
}

module.exports = { validateCreateEventType, validateUpdateEventType };
