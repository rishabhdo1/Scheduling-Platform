const BookingService                              = require('../services/booking.service');
const { validateGetSlots, validateCreateBooking,
        validateCancelBooking }                   = require('../validators/booking.validator');
const { success, created }                        = require('../utils/response');

const BookingController = {
  async getSlots(req, res) {
    validateGetSlots(req.query);
    const slots = await BookingService.getAvailableSlots(
      req.params.eventTypeId,
      req.query.date,
      req.query.timezone || 'UTC'
    );
    return success(res, {
      date:           req.query.date,
      eventTypeId:    req.params.eventTypeId,
      guestTimezone:  req.query.timezone || 'UTC',
      availableSlots: slots,
    });
  },

  async create(req, res) {
    validateCreateBooking(req.body);
    const booking = await BookingService.create(req.body);
    return created(res, { message: 'Booking confirmed', booking });
  },

  // GET /api/bookings — host sees their own bookings (auth required)
  async listForHost(req, res) {
    const bookings = await BookingService.getByUser(req.user.id);
    return success(res, { bookings });
  },

  // DELETE /api/bookings/:id — host cancels a booking
  async cancel(req, res) {
    validateCancelBooking(req.body);
    const result = await BookingService.cancel(req.params.id, req.user.id, req.body.reason);
    return success(res, { message: 'Booking cancelled', ...result });
  },
};

module.exports = BookingController;
