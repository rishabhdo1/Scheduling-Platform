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
  'https://scheduling-platform-xi.vercel.app/'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
