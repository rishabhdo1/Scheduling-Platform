const { Router }          = require('express');
const EventTypeController  = require('../controllers/eventType.controller');
const authenticate         = require('../middlewares/authenticate');
const asyncHandler         = require('../middlewares/asyncHandler');

const router = Router();

router.use(authenticate);

router.post('/',     asyncHandler(EventTypeController.create));
router.get('/',      asyncHandler(EventTypeController.list));
router.get('/:id',   asyncHandler(EventTypeController.getById));
router.patch('/:id', asyncHandler(EventTypeController.update));
router.delete('/:id',asyncHandler(EventTypeController.delete));

module.exports = router;
