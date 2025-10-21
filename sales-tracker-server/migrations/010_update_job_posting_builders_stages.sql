-- Migration: Update job_posting_builders to support application tracking stages
-- This enhances the status field to track the application process

-- Update the status column to use a more comprehensive set of stages
-- Old default was 'shared', now we support the full application lifecycle
ALTER TABLE job_posting_builders
  ALTER COLUMN status SET DEFAULT 'Shared';

-- Add a comment to document the valid status values
COMMENT ON COLUMN job_posting_builders.status IS
  'Application status stages: Shared, Applied, Phone Screen, Technical Interview, Final Interview, Offer, Rejected, Accepted, Declined, Withdrawn';

-- Add an applied_date column to track when the builder actually applied
ALTER TABLE job_posting_builders
  ADD COLUMN IF NOT EXISTS applied_date DATE;

-- Add a last_updated_by column to track who made the last update
ALTER TABLE job_posting_builders
  ADD COLUMN IF NOT EXISTS last_updated_by VARCHAR(255);

-- Update existing records with 'shared' to 'Shared' (capitalize)
UPDATE job_posting_builders
SET status = 'Shared'
WHERE status = 'shared';

-- Add index for applied_date for faster querying
CREATE INDEX IF NOT EXISTS idx_jpb_applied_date ON job_posting_builders(applied_date);

COMMENT ON TABLE job_posting_builders IS 'Tracks which builders have been shared job postings and their application status';
