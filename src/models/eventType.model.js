const { pool } = require('../config/db');

const EventTypeModel = {
  async create({ id, userId, title, description, duration, color, location, slug }) {
    await pool.query(
      `INSERT INTO event_types (id, user_id, title, description, duration, color, location, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, title, description || null, duration, color || '#4f46e5', location || null, slug]
    );
  },

  async findAllByUser(userId) {
    const [rows] = await pool.query(
      'SELECT id, title, description, duration, color, location, slug, is_active, created_at FROM event_types WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM event_types WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findByUserAndSlug(userId, slug) {
    const [rows] = await pool.query(
      'SELECT * FROM event_types WHERE user_id = ? AND slug = ?',
      [userId, slug]
    );
    return rows[0] || null;
  },

  async update(id, { title, description, duration, color, location, is_active }) {
    await pool.query(
      `UPDATE event_types SET title=?, description=?, duration=?, color=?, location=?, is_active=? WHERE id=?`,
      [title, description || null, duration, color, location || null, is_active, id]
    );
  },

  async delete(id) {
    await pool.query('DELETE FROM event_types WHERE id = ?', [id]);
  },
};

module.exports = EventTypeModel;
