const AppError = require('../utils/AppError');

function validateSetAvailability({ day_of_week, start_time, end_time }) {
  if (day_of_week === undefined || !start_time || !end_time)
    throw new AppError('day_of_week, start_time, and end_time are required', 400);

  const day = parseInt(day_of_week, 10);
  if (isNaN(day) || day < 0 || day > 6)
    throw new AppError('day_of_week must be 0 (Sun) – 6 (Sat)', 400);

  if (start_time >= end_time)
    throw new AppError('start_time must be before end_time', 400);
}

module.exports = { validateSetAvailability };
