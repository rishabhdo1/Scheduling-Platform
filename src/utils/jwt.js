const jwt  = require('jsonwebtoken');
const { jwtSecret, jwtExpiry } = require('../config/env');

const generateToken = (payload) =>
  jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });

const verifyToken = (token) =>
  jwt.verify(token, jwtSecret);

module.exports = { generateToken, verifyToken };
