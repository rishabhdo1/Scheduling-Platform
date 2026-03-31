const { pool } = require('../config/db');

const BookingModel = {
  /** Check if a slot is already taken for a given event type. */
  async findConflict(eventTypeId, startTime) {
    const [rows] = await pool.query(
      "SELECT id FROM bookings WHERE event_type_id = ? AND start_time = ? AND status = 'confirmed'",
      [eventTypeId, startTime]
    );
    return rows[0] || null;
  },

  /** Return confirmed booking start times for a specific date (used by slot generator). */
  async findBookedSlotsByDate(eventTypeId, date) {
    const [rows] = await pool.query(
      `SELECT start_time FROM bookings
       WHERE event_type_id = ? AND DATE(start_time) = ? AND status = 'confirmed'`,
      [eventTypeId, date]
    );
    return rows.map((r) => r.start_time);
  },

  async create({ id, eventTypeId, guestName, guestEmail, guestTimezone, startTime, endTime, notes }) {
    await pool.query(
      `INSERT INTO bookings
         (id, event_type_id, guest_name, guest_email, guest_timezone, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, eventTypeId, guestName, guestEmail, guestTimezone || 'UTC', startTime, endTime, notes || null]
    );
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    return rows[0] || null;
  },

  /** Host fetches all bookings across their event types. */
  async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT b.*, et.title AS event_title, et.duration, et.color
       FROM bookings b
       JOIN event_types et ON et.id = b.event_type_id
       WHERE et.user_id = ?
       ORDER BY b.start_time DESC`,
      [userId]
    );
    return rows;
  },

  async cancel(id, reason) {
    await pool.query(
      "UPDATE bookings SET status = 'cancelled', cancellation_reason = ? WHERE id = ?",
      [reason || null, id]
    );
  },
};

module.exports = BookingModel;
