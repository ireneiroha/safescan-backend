const fs = require('fs');
const path = require('path');
const db = require('./index');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Initializing database...');
    await db.pool.query(sql);
    console.log('Database initialized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) run();
