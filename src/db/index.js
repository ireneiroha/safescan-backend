const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fallback to individual vars if DATABASE_URL not set
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || undefined,
  database: process.env.PGDATABASE || 'safescan',
});

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
