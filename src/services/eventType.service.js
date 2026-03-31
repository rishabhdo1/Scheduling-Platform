const { v4: uuidv4 }  = require('uuid');
const EventTypeModel  = require('../models/eventType.model');
const AppError        = require('../utils/AppError');

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80);
}

const EventTypeService = {
  async create({ userId, title, description, duration, color, location }) {
    const id   = uuidv4();
    let   slug = slugify(title);

    // Ensure unique slug for this user
    const existing = await EventTypeModel.findByUserAndSlug(userId, slug);
    if (existing) slug = `${slug}-${Date.now()}`;

    await EventTypeModel.create({ id, userId, title, description, duration: parseInt(duration, 10), color, location, slug });
    return { id, userId, title, description, duration, color, location, slug };
  },

  async listByUser(userId) {
    return EventTypeModel.findAllByUser(userId);
  },

  async getById(id) {
    const eventType = await EventTypeModel.findById(id);
    if (!eventType) throw new AppError('Event type not found', 404);
    return eventType;
  },

  async update(id, userId, data) {
    const eventType = await EventTypeModel.findById(id);
    if (!eventType) throw new AppError('Event type not found', 404);
    if (eventType.user_id !== userId) throw new AppError('Not authorised', 403);

    await EventTypeModel.update(id, {
      title:       data.title       ?? eventType.title,
      description: data.description ?? eventType.description,
      duration:    data.duration    ? parseInt(data.duration, 10) : eventType.duration,
      color:       data.color       ?? eventType.color,
      location:    data.location    ?? eventType.location,
      is_active:   data.is_active   !== undefined ? data.is_active : eventType.is_active,
    });

    return EventTypeModel.findById(id);
  },

  async delete(id, userId) {
    const eventType = await EventTypeModel.findById(id);
    if (!eventType) throw new AppError('Event type not found', 404);
    if (eventType.user_id !== userId) throw new AppError('Not authorised', 403);
    await EventTypeModel.delete(id);
  },
};

module.exports = EventTypeService;
