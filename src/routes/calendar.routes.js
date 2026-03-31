const { Router }        = require('express');
const CalendarController = require('../controllers/calendar.controller');
const authenticate       = require('../middlewares/authenticate');
const asyncHandler       = require('../middlewares/asyncHandler');

const router = Router();

// GET /api/calendar/status — shows whether email/ICS is configured
router.get('/status', authenticate, asyncHandler(CalendarController.status));

module.exports = router;
