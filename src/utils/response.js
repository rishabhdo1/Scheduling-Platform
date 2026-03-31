const success = (res, data = {}, statusCode = 200) =>
  res.status(statusCode).json({ success: true, ...data });

const created = (res, data = {}) =>
  success(res, data, 201);

const error = (res, message = 'Something went wrong', statusCode = 500) =>
  res.status(statusCode).json({ success: false, error: message });

module.exports = { success, created, error };
