/**
 * calendar.service.js
 * ───────────────────
 * Calendar integration using ICS files + email.
 *
 * Why this approach instead of Google/Outlook OAuth?
 * ─────────────────────────────────────────────────
 * • No Google Cloud or Azure account needed
 * • Works with EVERY calendar app (Google Calendar, Outlook,
 *   Apple Calendar, Thunderbird, Proton Calendar, etc.)
 * • The .ics (iCalendar) format is an open RFC 5545 standard
 * • Guest receives a calendar invite directly in their email
 * • Zero token management, zero OAuth redirects
 *
 * What the guest/host experiences:
 * ─────────────────────────────────
 * 1. Booking confirmed → both get an email
 * 2. Email has a .ics file attached
 * 3. Click the attachment → calendar app opens and asks "Add event?"
 * 4. Works on mobile and desktop identically
 */

const { generateICS }             = require('../utils/icsGenerator');
const {
  sendGuestConfirmation,
  sendHostNotification,
  sendCancellationEmail,
}                                  = require('../utils/mailer');
const UserModel                    = require('../models/user.model');

const CalendarService = {
  /**
   * Called after a booking is confirmed.
   * Generates one .ics file and emails it to both guest and host.
   *
   * @param {string} hostUserId
   * @param {object} bookingData
   */
  async syncBookingToCalendars(hostUserId, bookingData) {
    const host = await UserModel.findById(hostUserId);
    if (!host) return {};

    const {
      title, description, location,
      startTime, endTime,
      guestEmail, guestName,
      hostTimezone, guestTimezone,
      guestTime, hostTime,
      duration, notes,
      bookingId,
    } = bookingData;

    try {
      // 1. Generate the .ics file content
      const icsContent = await generateICS({
        title,
        description,
        location,
        startTime,
        endTime,
        guestEmail,
        guestName,
        hostEmail: host.email,
        hostName:  host.name,
        bookingId,
      });

      // 2. Email the guest with the .ics attachment
      await sendGuestConfirmation({
        guestEmail,
        guestName,
        hostName:  host.name,
        title,
        guestTime,
        hostTime,
        location,
        notes,
        duration,
        icsContent,
      });

      // 3. Email the host with the same .ics attachment
      await sendHostNotification({
        hostEmail: host.email,
        hostName:  host.name,
        guestName,
        guestEmail,
        title,
        hostTime,
        guestTime,
        location,
        notes,
        duration,
        icsContent,
      });

      console.log(`✅ Calendar invites sent for booking ${bookingId}`);
      return { email: true };

    } catch (err) {
      // Email failure must never break a booking confirmation
      console.error('⚠️  Failed to send calendar emails:', err.message);
      return {};
    }
  },

  /**
   * Called when a booking is cancelled.
   * Sends a cancellation notice to the guest.
   */
  async removeBookingFromCalendars(hostUserId, booking, reason) {
    try {
      const guestTime = new Intl.DateTimeFormat('en-US', {
        timeZone: booking.guest_timezone || 'UTC',
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
      }).format(new Date(booking.start_time));

      // Fetch event type title for the email subject
      const { pool } = require('../config/db');
      const [rows] = await pool.query(
        'SELECT title FROM event_types WHERE id = ?',
        [booking.event_type_id]
      );
      const title = rows[0]?.title || 'Appointment';

      await sendCancellationEmail({
        guestEmail: booking.guest_email,
        guestName:  booking.guest_name,
        title,
        guestTime,
        reason,
      });
    } catch (err) {
      console.error('⚠️  Failed to send cancellation email:', err.message);
    }
  },
};

module.exports = CalendarService;
