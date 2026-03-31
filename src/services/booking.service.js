/**
 * booking.service.js
 * ──────────────────
 * Core business logic for slot generation, booking creation,
 * and cancellation. Delegates email/calendar to CalendarService.
 */

const { v4: uuidv4 }      = require('uuid');
const BookingModel        = require('../models/booking.model');
const EventTypeModel      = require('../models/eventType.model');
const UserModel           = require('../models/user.model');
const EventTypeService    = require('./eventType.service');
const AvailabilityService = require('./availability.service');
const CalendarService     = require('./calendar.service');
const { generateSlots }   = require('../utils/slotGenerator');
const AppError            = require('../utils/AppError');

const BookingService = {
  /**
   * Returns available time slots for a given event type and date.
   * Slots are expressed in both host and guest timezones.
   *
   * @param {string} eventTypeId
   * @param {string} date          - YYYY-MM-DD
   * @param {string} guestTimezone - IANA tz string e.g. "America/New_York"
   */
  async getAvailableSlots(eventTypeId, date, guestTimezone = 'UTC') {
    const eventType = await EventTypeService.getById(eventTypeId);
    const host      = await UserModel.findById(eventType.user_id);
    const hostTz    = host?.timezone || 'UTC';

    // Find which weekday this date is in the HOST's timezone
    const hostDayOfWeek = getDayOfWeekInTimezone(date, hostTz);
    const availability  = await AvailabilityService.getForDay(eventType.user_id, hostDayOfWeek);
    if (!availability) return [];

    const bookedSlots = await BookingModel.findBookedSlotsByDate(eventTypeId, date);

    const rawSlots = generateSlots(
      date,
      availability.start_time,
      availability.end_time,
      eventType.duration,
      bookedSlots,
      hostTz
    );

    // Return slots with display strings for both timezones
    return rawSlots.map((slotISO) => ({
      utc:       slotISO,
      guestTime: toTimezoneDisplay(slotISO, guestTimezone),
      hostTime:  toTimezoneDisplay(slotISO, hostTz),
    }));
  },

  /**
   * Creates a confirmed booking and sends email + .ics to both parties.
   */
  async create({ eventTypeId, guestName, guestEmail, guestTimezone = 'UTC', startTime, notes }) {
    const eventType = await EventTypeService.getById(eventTypeId);
    const host      = await UserModel.findById(eventType.user_id);
    const hostTz    = host?.timezone || 'UTC';

    const start = new Date(startTime);
    const end   = new Date(start.getTime() + eventType.duration * 60_000);
    const date  = start.toISOString().slice(0, 10);

    // Guard 1 — application-level conflict check
    const conflict = await BookingModel.findConflict(eventTypeId, start);
    if (conflict) throw new AppError('This slot has already been booked', 409);

    // Verify the requested slot is within host's availability
    const dayOfWeek    = getDayOfWeekInTimezone(date, hostTz);
    const availability = await AvailabilityService.getForDay(eventType.user_id, dayOfWeek);
    if (!availability) throw new AppError('Host is not available on this day', 400);

    const id = uuidv4();

    try {
      await BookingModel.create({
        id, eventTypeId, guestName, guestEmail, guestTimezone,
        startTime: start, endTime: end, notes,
      });
    } catch (err) {
      // Guard 2 — DB unique key catches race conditions
      if (err.code === 'ER_DUP_ENTRY') throw new AppError('This slot has already been booked', 409);
      throw err;
    }

    const hostTime  = toTimezoneDisplay(start.toISOString(), hostTz);
    const guestTime = toTimezoneDisplay(start.toISOString(), guestTimezone);

    // Send confirmation emails with .ics attachments (non-blocking on failure)
    await CalendarService.syncBookingToCalendars(eventType.user_id, {
      bookingId:    id,
      title:        eventType.title,
      description:  `Booking via Schedulr\n\nGuest: ${guestName} (${guestEmail})\nNotes: ${notes || 'N/A'}`,
      location:     eventType.location,
      startTime:    start,
      endTime:      end,
      guestEmail,
      guestName,
      hostTimezone: hostTz,
      guestTimezone,
      hostTime,
      guestTime,
      duration:     eventType.duration,
      notes,
    });

    return {
      id, eventTypeId, guestName, guestEmail, guestTimezone,
      startTime: start, endTime: end,
      hostTime,
      guestTime,
      emailSent: true,
    };
  },

  async getByUser(userId) {
    return BookingModel.findByUserId(userId);
  },

  /**
   * Cancel a booking and notify the guest by email.
   */
  async cancel(bookingId, userId, reason) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    // Verify this booking belongs to one of the user's event types
    const eventType = await EventTypeModel.findById(booking.event_type_id);
    if (!eventType || eventType.user_id !== userId) {
      throw new AppError('Not authorised to cancel this booking', 403);
    }

    if (booking.status === 'cancelled') throw new AppError('Booking is already cancelled', 400);

    await BookingModel.cancel(bookingId, reason);

    // Send cancellation email to the guest
    await CalendarService.removeBookingFromCalendars(userId, booking, reason);

    return { id: bookingId, status: 'cancelled' };
  },
};

// ── Timezone helpers ───────────────────────────────────────────────────────

/**
 * Returns 0-6 (Sun–Sat) for a date string interpreted in a given timezone.
 */
function getDayOfWeekInTimezone(dateStr, timezone) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday:  'short',
    });
    const date    = new Date(`${dateStr}T12:00:00Z`);
    const dayName = formatter.format(date);
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(dayName);
  } catch {
    return new Date(dateStr).getDay();
  }
}

/**
 * Returns a human-readable local time string e.g. "Jun 10, 2025, 02:30 PM IST"
 */
function toTimezoneDisplay(isoString, timezone) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone:     timezone,
      year:         'numeric',
      month:        'short',
      day:          'numeric',
      hour:         '2-digit',
      minute:       '2-digit',
      timeZoneName: 'short',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

module.exports = BookingService;
