// Load dotenv only in development (not in production on Render)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

console.log('========================================');
console.log('SafeScan Backend Starting...');
console.log('========================================');

console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  RENDER: process.env.RENDER ? 'yes' : 'no',
  DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
  PGHOST: process.env.PGHOST ? 'set' : 'not set',
  JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set',
  PORT: process.env.PORT || 4000,
});

const app = require('./app');
const db = require('./db');

// Render-safe port binding
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  console.log('Attempting to connect to database...');

  let dbConnected = false;
  try {
    dbConnected = await db.connect();
    if (!dbConnected) {
      console.warn('⚠️ WARNING: Database connection failed on startup.');
      console.warn('⚠️ The API will start, but database-dependent endpoints may return 503.');
    } else {
      console.log('✓ Database connected successfully');
    }
  } catch (err) {
    console.warn('⚠️ WARNING: Database connection threw an error on startup:', err?.message || err);
    console.warn('⚠️ The API will start for health checks, but database operations may fail.');
  }

  // If we can reach the DB, ensure schema exists (idempotent)
  if (dbConnected) {
    console.log('Ensuring database schema...');
    try {
      const ok = await db.initSchema();
      if (!ok) {
        console.warn('⚠️ Schema init failed. Some endpoints may still fail until schema is applied.');
      }
    } catch (err) {
      console.warn('⚠️ Schema init threw an error:', err?.message || err);
    }
  }

  // Start the Express server
  app.listen(PORT, () => {
    console.log('========================================');
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Root health: http://localhost:${PORT}/`);
    console.log(`✓ API health: http://localhost:${PORT}/api/health`);
    console.log(`✓ API Docs: http://localhost:${PORT}/api/docs`);
    console.log('========================================');
  });
};

startServer();
