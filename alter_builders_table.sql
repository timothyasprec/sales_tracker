-- Add new columns to builders table for enhanced builder information
-- Run this file with: psql sales_tracker -f alter_builders_table.sql

-- Add years_of_experience if not exists
ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;

-- Add education level if not exists
ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS education VARCHAR(255);

-- Add university name
ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS university VARCHAR(255);

-- Add major/field of study
ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS major VARCHAR(255);

-- Add education completion status
ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS education_completed BOOLEAN DEFAULT false;

-- Add date of birth for demographic information
ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add aligned sectors as JSON array (supports multiple sectors)
ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS aligned_sector JSONB DEFAULT '[]'::jsonb;

-- Add sector alignment notes for context
ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS sector_alignment_notes TEXT;

-- Add index on aligned_sector for faster queries
CREATE INDEX IF NOT EXISTS idx_builders_aligned_sector ON builders USING GIN(aligned_sector);

-- Update the aligned_sector column if it was previously a VARCHAR
-- This will convert any existing single sector values to JSON arrays
-- Uncomment the lines below if you need to migrate existing data
-- UPDATE builders 
-- SET aligned_sector = jsonb_build_array(aligned_sector::text)
-- WHERE aligned_sector IS NOT NULL AND jsonb_typeof(aligned_sector) != 'array';

COMMENT ON COLUMN builders.university IS 'Name of the university or institution';
COMMENT ON COLUMN builders.major IS 'Major or field of study';
COMMENT ON COLUMN builders.education_completed IS 'Whether the education program was completed';
COMMENT ON COLUMN builders.date_of_birth IS 'Builder date of birth for demographic information';
COMMENT ON COLUMN builders.aligned_sector IS 'JSON array of sectors where builder would be a good fit';
COMMENT ON COLUMN builders.sector_alignment_notes IS 'Staff notes explaining why builder fits selected sectors';

