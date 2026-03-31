const { v4: uuidv4 }    = require('uuid');
const AvailabilityModel = require('../models/availability.model');

const AvailabilityService = {
  async set({ userId, day_of_week, start_time, end_time }) {
    const id = uuidv4();
    await AvailabilityModel.upsert({ id, userId, day_of_week: parseInt(day_of_week, 10), start_time, end_time });
    return { userId, day_of_week, start_time, end_time };
  },

  async getByUser(userId) {
    return AvailabilityModel.findAllByUser(userId);
  },

  async getForDay(userId, dayOfWeek) {
    return AvailabilityModel.findByUserAndDay(userId, dayOfWeek);
  },
};

module.exports = AvailabilityService;
