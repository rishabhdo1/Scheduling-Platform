const { Router }       = require('express');
const authRoutes        = require('./auth.routes');
const calendarRoutes    = require('./calendar.routes');
const eventTypeRoutes   = require('./eventType.routes');
const availabilityRoutes = require('./availability.routes');
const bookingRoutes     = require('./booking.routes');

const router = Router();

router.use('/auth',         authRoutes);
router.use('/calendar',     calendarRoutes);
router.use('/event-types',  eventTypeRoutes);
router.use('/availability', availabilityRoutes);
router.use('/bookings',     bookingRoutes);

module.exports = router;
