const express      = require('express');
const cors         = require('cors');
const routes       = require('./routes');
const notFound     = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { clientUrl } = require('./config/env');

const app = express();

// ── Global middleware ─────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked'));
    }
  }
}));
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }));

// ── API routes ────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 + error handlers (must come last) ────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
