-- Migration: Add salary and shared status fields to outreach table
-- This migration adds:
-- 1. salary_range: VARCHAR to store salary information
-- 2. is_shared: BOOLEAN to track if job has been shared with builders
-- 3. shared_date: DATE to track when job was marked as shared

ALTER TABLE outreach
ADD COLUMN IF NOT EXISTS salary_range VARCHAR(255);

ALTER TABLE outreach
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;

ALTER TABLE outreach
ADD COLUMN IF NOT EXISTS shared_date DATE;

-- Add index for is_shared for faster filtering
CREATE INDEX IF NOT EXISTS idx_outreach_is_shared ON outreach(is_shared);

-- Add comments to explain the columns
COMMENT ON COLUMN outreach.salary_range IS 'Salary range or compensation info from job posting';
COMMENT ON COLUMN outreach.is_shared IS 'Whether this job posting has been shared with builders';
COMMENT ON COLUMN outreach.shared_date IS 'Date when job posting was marked as shared';
