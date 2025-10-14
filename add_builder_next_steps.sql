-- Add next_steps column to builders table
-- Run this file with: psql sales_tracker -f add_builder_next_steps.sql

-- Add next_steps column
ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS next_steps TEXT;

-- Add notes column if it doesn't exist (for update history)
ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index on next_steps for faster queries
CREATE INDEX IF NOT EXISTS idx_builders_next_steps ON builders(next_steps);

-- Add comment explaining the columns
COMMENT ON COLUMN builders.next_steps IS 'Action items or follow-up tasks for this builder';
COMMENT ON COLUMN builders.notes IS 'Update history and general notes about the builder';

