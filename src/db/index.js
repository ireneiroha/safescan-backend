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
// Also runs migrations to ensure all required columns exist.
const initSchema = async () => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const migrationsDir = path.join(__dirname, 'migrations');
  
  try {
    // Step 1: Apply main schema
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sql);
    console.log('✅ Database schema ensured (schema.sql applied)');
    
    // Step 2: Apply migrations (if migrations directory exists)
    try {
      if (fs.existsSync(migrationsDir)) {
        const migrationFiles = fs.readdirSync(migrationsDir)
          .filter(f => f.endsWith('.sql'))
          .sort(); // Apply in alphabetical order (001_, 002_, etc.)
        
        for (const migrationFile of migrationFiles) {
          const migrationPath = path.join(migrationsDir, migrationFile);
          const migrationSql = fs.readFileSync(migrationPath, 'utf8');
          
          // Run each migration (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS for safety)
          await pool.query(migrationSql);
          console.log(`✅ Applied migration: ${migrationFile}`);
        }
        
        if (migrationFiles.length > 0) {
          console.log(`✅ All ${migrationFiles.length} migration(s) applied successfully`);
        }
      }
    } catch (migrationErr) {
      // Log migration errors but don't fail - schema might already be applied
      console.warn('⚠️ Some migrations may have failed (possibly already applied):', migrationErr.message);
    }
    
    // Step 3: Ensure critical columns exist directly (fallback protection)
    // This ensures scans.overall_risk exists regardless of migration state
    try {
      await pool.query(
        'ALTER TABLE IF EXISTS scans ADD COLUMN IF NOT EXISTS overall_risk TEXT'
      );
      console.log('Schema migration applied: scans.overall_risk ensured');
    } catch (colErr) {
      // Ignore if column already exists
      if (colErr.code !== '42701') { // 42701 = duplicate_column
        console.warn('⚠️ Error ensuring overall_risk column:', colErr.message);
      }
    }
    
    console.log('✅ Database schema fully initialized');
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
