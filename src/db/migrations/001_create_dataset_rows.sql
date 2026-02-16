-- Migration: Create dataset_rows table
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS dataset_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    row_hash TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL,
    source_sheet_id TEXT NOT NULL,
    source_range TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dataset_rows_row_hash ON dataset_rows (row_hash);
CREATE INDEX IF NOT EXISTS idx_dataset_rows_data_gin ON dataset_rows USING GIN (data);
CREATE INDEX IF NOT EXISTS idx_dataset_rows_created_at ON dataset_rows (created_at);
CREATE INDEX IF NOT EXISTS idx_dataset_rows_updated_at ON dataset_rows (updated_at);
