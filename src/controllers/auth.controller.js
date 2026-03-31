const AuthService                    = require('../services/auth.service');
const { validateRegister,
        validateLogin,
        validateTimezone }           = require('../validators/auth.validator');
const { success, created }           = require('../utils/response');

const AuthController = {
  async register(req, res) {
    validateRegister(req.body);
    const user = await AuthService.register(req.body);
    return created(res, { message: 'User registered successfully', user });
  },

  async login(req, res) {
    validateLogin(req.body);
    const result = await AuthService.login(req.body);
    return success(res, result);
  },

  async me(req, res) {
    const user = await AuthService.getProfile(req.user.id);
    return success(res, { user });
  },

  async updateTimezone(req, res) {
    validateTimezone(req.body);
    const result = await AuthService.updateTimezone(req.user.id, req.body.timezone);
    return success(res, { message: 'Timezone updated', ...result });
  },
};

module.exports = AuthController;
