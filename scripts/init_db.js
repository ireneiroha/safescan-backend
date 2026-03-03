const { Pool } = require('pg');
require('dotenv').config();

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Build PostgreSQL config - use DATABASE_URL if provided, otherwise use individual vars
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE || 'safescan',
    };

// Add SSL support in production
if (isProduction) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

async function initDatabase() {
  console.log('Initializing database...');
  console.log('Environment:', isProduction ? 'production' : 'development');

  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Users table created/verified');

    // Create scans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        extracted_text TEXT NOT NULL,
        product_category VARCHAR(100),
        scan_results JSONB,
        summary JSONB,
        disclaimer TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Scans table created/verified');

    // Create scan_history table (if not exists from previous schema)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scan_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        extracted_text TEXT NOT NULL,
        product_category VARCHAR(100),
        summary JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `).catch(() => {
      // Table might already exist, ignore error
    });
    console.log('✓ Scan history table created/verified');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
    `).catch(() => {
      // Index might already exist
    });
    console.log('✓ Indexes created/verified');

    console.log('\nDatabase initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Database initialization failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
