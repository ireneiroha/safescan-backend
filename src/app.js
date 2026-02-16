const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { nanoid } = require('nanoid');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./docs/openapi.json');

const errorHandler = require('./middlewares/errorHandler');
const safeLogger = require('./utils/safeLogger');

const app = express();

// Check required env vars
const requiredEnv = ['JWT_SECRET', 'CORS_ORIGIN'];
requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
}));

// CORS for specific origin
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// Request ID for easier debugging
app.use((req, res, next) => {
  req.id = nanoid(10);
  res.setHeader('X-Request-Id', req.id);
  next();
});

// Logging with safe logger (redacts sensitive data)
app.use(morgan('combined', {
  stream: {
    write: (message) => safeLogger.info(message.trim()),
  },
}));

// Body parsing (for JSON analyze endpoint)
app.use(express.json({ limit: '1mb' }));

// Rate limiting: stricter on auth, normal on others
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // 5 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, try again later' },
}));

app.use(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 60, // 60 requests/min per IP
  standardHeaders: true,
  legacyHeaders: false,
}));

// API Docs (Swagger)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { explorer: true }));

// Routes
const routes = require('./routes');
app.use('/api', routes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', requestId: req.id });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
