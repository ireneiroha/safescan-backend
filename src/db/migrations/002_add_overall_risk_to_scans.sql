-- Add overall_risk column to scans table if it doesn't exist
ALTER TABLE IF EXISTS scans ADD COLUMN IF NOT EXISTS overall_risk TEXT;

