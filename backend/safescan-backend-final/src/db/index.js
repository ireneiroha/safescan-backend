const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Detect if running on Render OR if DATABASE_URL is provided
const isOnRender = !!process.env.RENDER;
const hasDatabaseUrl = !!process.env.DATABASE_URL;

// Build PostgreSQL config
// 1) Use DATABASE_URL if provided
// 2) Otherwise fall back to individual env vars
const poolConfig = hasDatabaseUrl
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    };

// Enable SSL when on Render OR when DATABASE_URL exists (Render Postgres typically requires SSL)
const sslEnabled = isOnRender || hasDatabaseUrl;
if (sslEnabled) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

// Helpful startup log (no password)
try {
  if (poolConfig.connectionString) {
    const url = new URL(poolConfig.connectionString);
    console.log('DB target:', {
      host: url.hostname,
      port: url.port || 5432,
      database: url.pathname?.replace('/', '') || 'unknown',
      user: url.username,
      ssl: sslEnabled,
      source: 'DATABASE_URL',
    });
  } else {
    console.log('DB target:', {
      host: poolConfig.host,
      port: poolConfig.port,
      database: poolConfig.database,
      user: poolConfig.user,
      ssl: sslEnabled,
      source: 'PG* env vars',
    });
  }
} catch (e) {
  console.log('DB target: (unable to parse connection details)', { ssl: sslEnabled });
}

const pool = new Pool(poolConfig);

// Test and verify DB connection
const connect = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection OK');
    return true;
  } catch (err) {
    console.error('❌ Database connection failed');
    console.error('Message:', err.message);
    console.error('Code:', err.code || 'N/A');
    if (process.env.NODE_ENV !== 'production') {
      console.error('Stack:', err.stack);
    }
    return false;
  }
};

// Initialize schema (idempotent). Safe to run repeatedly because it uses IF NOT EXISTS.
const initSchema = async () => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  try {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sql);
    console.log('✅ Database schema ensured (schema.sql applied)');
    return true;
  } catch (err) {
    console.error('❌ Database schema initialization failed');
    console.error('Message:', err.message);
    console.error('Code:', err.code || 'N/A');
    if (process.env.NODE_ENV !== 'production') {
      console.error('Stack:', err.stack);
    }
    return false;
  }
};

module.exports = {
  pool,
  connect,
  initSchema,
  query: (text, params) => pool.query(text, params),
};
