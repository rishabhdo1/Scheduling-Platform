/**
 * calendar.controller.js
 * ──────────────────────
 * Simplified controller — no OAuth, no redirects.
 * Calendar sync happens automatically via email + .ics on every booking.
 * This controller just exposes a status endpoint for the frontend.
 */

const { success } = require('../utils/response');

const CalendarController = {
  // GET /api/calendar/status
  // Returns whether email-based calendar is configured
  async status(req, res) {
    const configured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    return success(res, {
      method:      'ics_email',
      configured,
      description: configured
        ? 'Calendar invites will be sent as .ics attachments via email'
        : 'Set EMAIL_USER and EMAIL_PASS in .env to enable calendar invites',
    });
  },
};

module.exports = CalendarController;
