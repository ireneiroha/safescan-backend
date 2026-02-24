// Load dotenv only in development (not in production on Render)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
console.log('Environment variables loaded:', { 
  JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set', 
  CORS_ORIGIN: process.env.CORS_ORIGIN ? 'set' : 'not set',
  NODE_ENV: process.env.NODE_ENV || 'development'
});

const app = require('./app');
const db = require('./db');
const PORT = process.env.PORT || 5000;

// Connect to database on startup
const startServer = async () => {
  try {
    const dbConnected = await db.connect();
    if (!dbConnected) {
      console.error('Warning: Database connection failed on startup. The API may not function correctly.');
    }
    
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
