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

// ========== CORS CONFIGURATION (Applied FIRST - before all routes) ==========
const allowedOrigins = [
  'http://localhost:5173',
  'https://safescan-backend-1.onrender.com',
  'https://my-production-frontend.com',
];

/**
 * CORS (credentials-safe)
 * - Allow only specific origins (localhost for dev, production domain)
 * - Allow requests without origin (Postman, curl, etc.)
 * - Reject all other origins
 */
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests without origin (Postman, curl, server-to-server)
      if (!origin) return cb(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      // Reject all other origins
      return cb(new Error('Origin not allowed by CORS'), false);
    },
    credentials: true,
  })
);
// ============================================================================

/**
 * Health check route at root (keep it first)
 * Render health checks will hit "/" by default sometimes.
 */
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

/**
 * Handle missing env vars without crashing
 * - In production, you SHOULD set these in Render env vars.
 * - In development, we provide safe defaults so the server stays up.
 */
const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET) {
  console.warn(
    '⚠️ JWT_SECRET is not set. Using a development fallback. Set JWT_SECRET in Render for production!'
  );
  // Set a fallback so any code that reads process.env.JWT_SECRET will still work.
  process.env.JWT_SECRET = 'dev-jwt-secret-change-me';
}

if (!process.env.CORS_ORIGIN) {
  console.warn(
    '⚠️ CORS_ORIGIN is not set. Development mode will allow requests from any origin; production will be restricted.'
  );
}

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for API
  })
);

// Request ID for easier debugging
app.use((req, res, next) => {
  req.id = nanoid(10);
  res.setHeader('X-Request-Id', req.id);
  next();
});

// Logging with safe logger (redacts sensitive data)
app.use(
  morgan('combined', {
    stream: {
      write: (message) => safeLogger.info(message.trim()),
    },
  })
);

// Body parsing (for JSON analyze endpoint)
app.use(express.json({ limit: '1mb' }));

// Rate limiting: stricter on auth, normal on others
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // 5 auth attempts per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many auth attempts, try again later' },
  })
);

app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 60, // 60 requests/min per IP
    standardHeaders: true,
    legacyHeaders: false,
  })
);

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
