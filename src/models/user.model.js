const { pool } = require('../config/db');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, timezone FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, timezone FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ id, name, email, passwordHash, timezone = 'UTC' }) {
    await pool.query(
      'INSERT INTO users (id, name, email, password, timezone) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, passwordHash, timezone]
    );
  },

  async updateTimezone(id, timezone) {
    await pool.query('UPDATE users SET timezone = ? WHERE id = ?', [timezone, id]);
  },
};

module.exports = UserModel;
