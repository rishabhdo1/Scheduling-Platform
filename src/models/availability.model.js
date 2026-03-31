const { pool } = require('../config/db');

const AvailabilityModel = {
  async upsert({ id, userId, day_of_week, start_time, end_time }) {
    await pool.query(
      `INSERT INTO availability (id, user_id, day_of_week, start_time, end_time)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), end_time = VALUES(end_time)`,
      [id, userId, day_of_week, start_time, end_time]
    );
  },

  async findAllByUser(userId) {
    const [rows] = await pool.query(
      'SELECT day_of_week, start_time, end_time FROM availability WHERE user_id = ? ORDER BY day_of_week',
      [userId]
    );
    return rows;
  },

  async findByUserAndDay(userId, dayOfWeek) {
    const [rows] = await pool.query(
      'SELECT start_time, end_time FROM availability WHERE user_id = ? AND day_of_week = ?',
      [userId, dayOfWeek]
    );
    return rows[0] || null;
  },
};

module.exports = AvailabilityModel;
