const bcrypt          = require('bcryptjs');
const { v4: uuidv4 }  = require('uuid');
const UserModel       = require('../models/user.model');
const { generateToken } = require('../utils/jwt');
const AppError        = require('../utils/AppError');
const { bcryptSalt }  = require('../config/env');

const AuthService = {
  async register({ name, email, password, timezone = 'UTC' }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) throw new AppError('Email already in use', 409);

    const id           = uuidv4();
    const passwordHash = await bcrypt.hash(password, bcryptSalt);

    await UserModel.create({ id, name, email, passwordHash, timezone });
    return { id, name, email, timezone };
  },

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) throw new AppError('Invalid email or password', 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new AppError('Invalid email or password', 401);

    const token = generateToken({ id: user.id, email: user.email });
    return { token, user: { id: user.id, name: user.name, email: user.email, timezone: user.timezone } };
  },

  async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  async updateTimezone(userId, timezone) {
    await UserModel.updateTimezone(userId, timezone);
    return { timezone };
  },
};

module.exports = AuthService;
