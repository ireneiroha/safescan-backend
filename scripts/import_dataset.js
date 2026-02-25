/**
 * Script to import ingredient dataset from CSV or JSON into the database.
 * 
 * Usage:
 *   node scripts/import_dataset.js --file path/to/dataset.csv
 *   node scripts/import_dataset.js --json path/to/dataset.json
 *   node scripts/import_dataset.js --sample  (loads from src/data/ingredients.json)
 * 
 * CSV format expected:
 *   ingredient_name,risk_level,reason,aliases
 * 
 * JSON format expected:
 *   [
 *     {
 *       "ingredient_name": "paraben",
 *       "risk_level": "HIGH",
 *       "reason": "Paraben preservatives can raise sensitivity concerns...",
 *       "aliases": "methylparaben,propylparaben"
 *     }
 *   ]
 */

// Load environment variables (skip in production where env vars are already set)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Check environment configuration
console.log('\n=== Environment Configuration ===');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set (development)'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Build PostgreSQL config
// 1) Use DATABASE_URL if provided
// 2) Otherwise fall back to individual env vars
const hasDatabaseUrl = !!process.env.DATABASE_URL;

const poolConfig = hasDatabaseUrl
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    };

// Enable SSL when DATABASE_URL exists
if (hasDatabaseUrl) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

// Log connection source
console.log(`Connection source: ${hasDatabaseUrl ? 'DATABASE_URL' : 'PG* env vars'}`);
if (!hasDatabaseUrl) {
  console.log(`Host: ${poolConfig.host || 'undefined'}`);
  console.log(`Database: ${poolConfig.database || 'undefined'}`);
  console.log(`User: ${poolConfig.user || 'undefined'}`);
}
console.log('================================\n');

const pool = new Pool(poolConfig);

// Test database connection
const connect = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection OK');
    return true;
  } catch (err) {
    console.error('❌ Database connection failed');
    console.error('Message:', err.message);
    return false;
  }
};

// Initialize schema
const initSchema = async () => {
  const schemaPath = path.join(__dirname, '..', 'src', 'db', 'schema.sql');
  try {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sql);
    console.log('✅ Database schema ensured (schema.sql applied)');
    return true;
  } catch (err) {
    console.error('❌ Database schema initialization failed');
    console.error('Message:', err.message);
    return false;
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--file' && args[i + 1]) {
    options.file = args[i + 1];
    i++;
  } else if (args[i] === '--json' && args[i + 1]) {
    options.json = args[i + 1];
    i++;
  } else if (args[i] === '--sample') {
    options.sample = true;
  }
}

/**
 * Parse CSV line handling quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

/**
 * Load data from CSV file
 */
async function loadFromCSV(filePath) {
  console.log(`Loading data from CSV: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must have header row and at least one data row');
  }
  
  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
  console.log('Headers:', headers);
  
  // Validate required headers
  const requiredHeaders = ['ingredient_name', 'risk_level'];
  for (const req of requiredHeaders) {
    if (!headers.includes(req)) {
      throw new Error(`Missing required header: ${req}`);
    }
  }
  
  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    if (row.ingredient_name) {
      data.push(row);
    }
  }
  
  return data;
}

/**
 * Load data from JSON file
 */
async function loadFromJSON(filePath) {
  console.log(`Loading data from JSON: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of ingredients');
  }
  
  return data;
}

/**
 * Load sample data from src/data/ingredients.json
 */
async function loadSampleData() {
  console.log('Loading sample data from src/data/ingredients.json');
  
  const filePath = path.join(__dirname, '..', 'src', 'data', 'ingredients.json');
  const content = fs.readFileSync(filePath, 'utf8');
  const ingredients = JSON.parse(content);
  
  // Convert from ingredients.json format to dataset_rows format
  const data = Object.entries(ingredients).map(([name, info]) => ({
    ingredient_name: name,
    risk_level: mapStatusToRiskLevel(info.status),
    reason: info.explanation,
    aliases: ''
  }));
  
  return data;
}

/**
 * Map old status format to new risk_level format
 */
function mapStatusToRiskLevel(status) {
  switch ((status || '').toLowerCase()) {
    case 'safe':
      return 'LOW';
    case 'risky':
      return 'MEDIUM';
    case 'restricted':
      return 'HIGH';
    default:
      return 'LOW';
  }
}

/**
 * Import data into database
 */
async function importData(data) {
  console.log(`Importing ${data.length} ingredients...`);
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const row of data) {
      const ingredientName = row.ingredient_name?.trim();
      const riskLevel = row.risk_level?.toUpperCase();
      const reason = row.reason || '';
      const aliases = row.aliases || '';
      
      if (!ingredientName || !riskLevel) {
        console.warn(`Skipping row with missing data: ${JSON.stringify(row)}`);
        skipped++;
        continue;
      }
      
      // Validate risk_level
      if (!['LOW', 'MEDIUM', 'HIGH'].includes(riskLevel)) {
        console.warn(`Invalid risk_level "${riskLevel}" for "${ingredientName}", defaulting to LOW`);
      }
      
      // Upsert: update if exists, insert if not
      const result = await client.query(
        `INSERT INTO dataset_rows (ingredient_name, risk_level, reason, aliases, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (ingredient_name) 
         DO UPDATE SET 
           risk_level = EXCLUDED.risk_level,
           reason = EXCLUDED.reason,
           aliases = EXCLUDED.aliases,
           updated_at = NOW()
         RETURNING (xmax = 0) AS inserted`,
        [ingredientName, riskLevel, reason, aliases]
      );
      
      if (result.rows[0].inserted) {
        inserted++;
      } else {
        updated++;
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ Import complete!');
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Display current dataset statistics
 */
async function showStats() {
  const result = await pool.query(`
    SELECT 
      risk_level,
      COUNT(*) as count
    FROM dataset_rows
    GROUP BY risk_level
    ORDER BY risk_level
  `);
  
  console.log('\n📊 Dataset Statistics:');
  console.log('---------------------');
  
  let total = 0;
  result.rows.forEach(row => {
    console.log(`   ${row.risk_level}: ${row.count}`);
    total += parseInt(row.count);
  });
  console.log(`   Total: ${total}`);
}

/**
 * Main function
 */
async function main() {
  try {
    // Connect to database
    const dbConnected = await connect();
    if (!dbConnected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }
    
    // Initialize schema
    await initSchema();
    
    // Load data based on options
    let data;
    
    if (options.sample) {
      data = await loadSampleData();
    } else if (options.file) {
      data = await loadFromCSV(options.file);
    } else if (options.json) {
      data = await loadFromJSON(options.json);
    } else {
      console.error('Please specify --file, --json, or --sample');
      console.log('Usage:');
      console.log('  node scripts/import_dataset.js --sample');
      console.log('  node scripts/import_dataset.js --file path/to/data.csv');
      console.log('  node scripts/import_dataset.js --json path/to/data.json');
      process.exit(1);
    }
    
    // Import data
    await importData(data);
    
    // Show stats
    await showStats();
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
