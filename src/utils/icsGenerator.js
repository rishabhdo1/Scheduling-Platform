/**
 * icsGenerator.js
 * ───────────────
 * Generates a .ics (iCalendar) file string for a booking.
 * Works with ALL calendar apps: Google Calendar, Outlook,
 * Apple Calendar, Thunderbird — no OAuth needed.
 *
 * The guest clicks the attached .ics file in their email
 * and it opens directly in their default calendar app.
 */

const ics = require('ics');

/**
 * @param {object} opts
 * @param {string} opts.title        - Event title
 * @param {string} opts.description  - Event description
 * @param {string} opts.location     - Location or meeting link
 * @param {Date}   opts.startTime    - Start time (UTC Date object)
 * @param {Date}   opts.endTime      - End time (UTC Date object)
 * @param {string} opts.guestEmail   - Guest's email (attendee)
 * @param {string} opts.guestName    - Guest's display name
 * @param {string} opts.hostEmail    - Host's email (organiser)
 * @param {string} opts.hostName     - Host's display name
 * @param {string} opts.bookingId    - Unique booking ID (for UID field)
 * @returns {Promise<string>}        - ICS file content as a string
 */
function generateICS({
  title, description, location,
  startTime, endTime,
  guestEmail, guestName,
  hostEmail, hostName,
  bookingId,
}) {
  const start = new Date(startTime);
  const end   = new Date(endTime);

  // ics library expects [year, month, day, hour, minute] in UTC
  const toArray = (d) => [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
  ];

  const event = {
    uid:         `${bookingId}@schedulr`,
    start:       toArray(start),
    startInputType: 'utc',
    end:         toArray(end),
    endInputType: 'utc',
    title,
    description: description || '',
    location:    location    || '',
    status:      'CONFIRMED',
    busyStatus:  'BUSY',
    // Organiser = host
    organizer:   { name: hostName,  email: hostEmail  },
    // Attendees = guest + host
    attendees: [
      { name: guestName, email: guestEmail, rsvp: true,  partstat: 'NEEDS-ACTION', role: 'REQ-PARTICIPANT' },
      { name: hostName,  email: hostEmail,  rsvp: false, partstat: 'ACCEPTED',     role: 'REQ-PARTICIPANT' },
    ],
    // Reminders: 1 day before and 30 min before
    alarms: [
      { action: 'display', description: `Reminder: ${title}`, trigger: { hours: 24,     before: true } },
      { action: 'display', description: `Reminder: ${title}`, trigger: { minutes: 30,   before: true } },
    ],
  };

  return new Promise((resolve, reject) => {
    ics.createEvent(event, (err, value) => {
      if (err) reject(new Error(`ICS generation failed: ${err.message}`));
      else     resolve(value);
    });
  });
}

module.exports = { generateICS };
