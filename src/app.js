const express      = require('express');
const cors         = require('cors');
const routes       = require('./routes');
const notFound     = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ── Global middleware ─────────────────────────────────────────

// Allowed origins — reads CLIENT_URL from environment variable set on Render
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean); // removes undefined if CLIENT_URL is not set

console.log('✅ Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
