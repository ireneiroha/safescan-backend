-- Schema for SafeScan

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  image_path TEXT,
  ocr_text TEXT,
  product_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  normalized_name TEXT,
  risk TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS scan_ingredients (
  id SERIAL PRIMARY KEY,
  scan_id INTEGER REFERENCES scans(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE SET NULL,
  raw_text TEXT,
  risk TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingredients_normalized ON ingredients(normalized_name);


-- Ensure required columns exist for evolving schema
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password TEXT;

-- Consent fields for POPIA/GDPR compliance (migration-safe)
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS consent_given BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE NULL;

-- Dataset table for ingredient risk analysis
CREATE TABLE IF NOT EXISTS dataset_rows (
    id SERIAL PRIMARY KEY,
    ingredient_name TEXT UNIQUE NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    reason TEXT,
    aliases TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_dataset_rows_ingredient_name ON dataset_rows (ingredient_name);
CREATE INDEX IF NOT EXISTS idx_dataset_rows_risk_level ON dataset_rows (risk_level);
