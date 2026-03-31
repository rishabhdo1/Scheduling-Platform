const { Router }       = require('express');
const BookingController = require('../controllers/booking.controller');
const authenticate      = require('../middlewares/authenticate');
const asyncHandler      = require('../middlewares/asyncHandler');

const router = Router();

// Public — guests book without an account
router.get('/slots/:eventTypeId', asyncHandler(BookingController.getSlots));
router.post('/',                  asyncHandler(BookingController.create));

// Protected — host manages their bookings
router.get('/',         authenticate, asyncHandler(BookingController.listForHost));
router.delete('/:id',   authenticate, asyncHandler(BookingController.cancel));

module.exports = router;
