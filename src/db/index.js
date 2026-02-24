const { Pool } = require('pg');

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Build PostgreSQL config - use DATABASE_URL if provided, otherwise use individual vars
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    };

// Add SSL support in production
if (isProduction) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

// Track connection status
let isConnected = false;

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
  isConnected = false;
});

// Handle successful connections
pool.on('connect', () => {
  isConnected = true;
  console.log('Database connected successfully');
});

// Test and verify DB connection
const connect = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    isConnected = true;
    console.log('Database connection verified:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    console.error('Database error code:', err.code);
    isConnected = false;
    return false;
  }
};

// Health check function
const healthCheck = async () => {
  try {
    const result = await pool.query('SELECT 1 as health');
    return result.rows[0].health === 1;
  } catch (err) {
    return false;
  }
};

// Check if connected
const isDatabaseConnected = () => isConnected;

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  connect,
  healthCheck,
  isDatabaseConnected,
};
