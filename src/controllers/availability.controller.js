const AvailabilityService            = require('../services/availability.service');
const { validateSetAvailability }    = require('../validators/availability.validator');
const { success, created }           = require('../utils/response');

const AvailabilityController = {
  async set(req, res) {
    validateSetAvailability(req.body);
    const availability = await AvailabilityService.set({
      userId: req.user.id,
      ...req.body,
    });
    return created(res, { message: 'Availability saved', availability });
  },

  async getByUser(req, res) {
    const availability = await AvailabilityService.getByUser(req.params.userId);
    return success(res, { availability });
  },
};

module.exports = AvailabilityController;
