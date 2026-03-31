const EventTypeService               = require('../services/eventType.service');
const { validateCreateEventType,
        validateUpdateEventType }     = require('../validators/eventType.validator');
const { success, created }           = require('../utils/response');

const EventTypeController = {
  async create(req, res) {
    validateCreateEventType(req.body);
    const eventType = await EventTypeService.create({
      userId:      req.user.id,
      title:       req.body.title,
      description: req.body.description,
      duration:    req.body.duration,
      color:       req.body.color,
      location:    req.body.location,
    });
    return created(res, { message: 'Event type created', eventType });
  },

  async list(req, res) {
    const eventTypes = await EventTypeService.listByUser(req.user.id);
    return success(res, { eventTypes });
  },

  async getById(req, res) {
    const eventType = await EventTypeService.getById(req.params.id);
    return success(res, { eventType });
  },

  async update(req, res) {
    validateUpdateEventType(req.body);
    const eventType = await EventTypeService.update(req.params.id, req.user.id, req.body);
    return success(res, { message: 'Event type updated', eventType });
  },

  async delete(req, res) {
    await EventTypeService.delete(req.params.id, req.user.id);
    return success(res, { message: 'Event type deleted' });
  },
};

module.exports = EventTypeController;
