// Load dotenv only in development (not in production on Render)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

console.log('Environment variables loaded:', {
  JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set',
  CORS_ORIGIN: process.env.CORS_ORIGIN ? 'set' : 'not set',
  NODE_ENV: process.env.NODE_ENV || 'development',
});

const app = require('./app');
const db = require('./db');

// 1) Render-safe port binding
const PORT = process.env.PORT || 4000;

// Connect to database on startup (but don't crash if it fails)
const startServer = async () => {
  try {
    const dbConnected = await db.connect();
    if (!dbConnected) {
      console.warn(
        '⚠️ Warning: Database connection failed on startup. The API may not function correctly.'
      );
    }
  } catch (err) {
    console.warn(
      '⚠️ Warning: Database connection threw an error on startup:',
      err?.message || err
    );
    // Do NOT exit — let server start so Render health checks pass.
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();