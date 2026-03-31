module.exports = {
  port:       process.env.PORT || 3000,
  jwtSecret:  process.env.JWT_SECRET,
  jwtExpiry:  process.env.JWT_EXPIRES_IN || '7d',
  bcryptSalt: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  clientUrl:  process.env.CLIENT_URL ||  'http://localhost:5173',

  email: {
    user:   process.env.EMAIL_USER,
    pass:   process.env.EMAIL_PASS,
    host:   process.env.EMAIL_HOST,   // optional — for non-Gmail SMTP
    port:   process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
  },
};
