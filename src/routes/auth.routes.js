const { Router }    = require('express');
const AuthController = require('../controllers/auth.controller');
const asyncHandler   = require('../middlewares/asyncHandler');
const authenticate   = require('../middlewares/authenticate');

const router = Router();

router.post('/register', asyncHandler(AuthController.register));
router.post('/login',    asyncHandler(AuthController.login));
router.get('/me',        authenticate, asyncHandler(AuthController.me));
router.patch('/timezone', authenticate, asyncHandler(AuthController.updateTimezone));

module.exports = router;
