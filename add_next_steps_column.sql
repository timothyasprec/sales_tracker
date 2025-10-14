-- Add next_steps column to outreach table
-- Run this with: psql sales_tracker -f add_next_steps_column.sql

DO $$ 
BEGIN
    BEGIN
        ALTER TABLE outreach ADD COLUMN next_steps TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column next_steps already exists';
    END;
END $$;

-- Add index
CREATE INDEX IF NOT EXISTS idx_outreach_next_steps ON outreach(next_steps);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'outreach' AND column_name = 'next_steps';

