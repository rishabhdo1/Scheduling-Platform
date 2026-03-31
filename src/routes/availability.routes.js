const { Router }              = require('express');
const AvailabilityController   = require('../controllers/availability.controller');
const authenticate             = require('../middlewares/authenticate');
const asyncHandler             = require('../middlewares/asyncHandler');

const router = Router();

router.post('/',          authenticate, asyncHandler(AvailabilityController.set));
router.get('/:userId',                  asyncHandler(AvailabilityController.getByUser));

module.exports = router;
