-- Migration to add all missing columns to outreach table
-- Run this with: psql sales_tracker -f fix_outreach_table.sql

-- Add missing columns one by one (some may already exist)
-- We'll ignore errors if they already exist

-- Add lead_temperature column
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE outreach ADD COLUMN lead_temperature VARCHAR(50) DEFAULT 'cold';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column lead_temperature already exists';
    END;
END $$;

-- Add stage column
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE outreach ADD COLUMN stage VARCHAR(100) DEFAULT 'Initial Outreach';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column stage already exists';
    END;
END $$;

-- Add ownership column
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE outreach ADD COLUMN ownership VARCHAR(255);
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column ownership already exists';
    END;
END $$;

-- Add contact_email column
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE outreach ADD COLUMN contact_email VARCHAR(255);
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column contact_email already exists';
    END;
END $$;

-- Add contact_phone column
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE outreach ADD COLUMN contact_phone VARCHAR(50);
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column contact_phone already exists';
    END;
END $$;

-- Add role_consideration column
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE outreach ADD COLUMN role_consideration TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column role_consideration already exists';
    END;
END $$;

-- Add job_description_url column
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE outreach ADD COLUMN job_description_url TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column job_description_url already exists';
    END;
END $$;

-- Add aligned_sector column (JSONB)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE outreach ADD COLUMN aligned_sector JSONB DEFAULT '[]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column aligned_sector already exists';
    END;
END $$;

-- Add job_title column
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE outreach ADD COLUMN job_title VARCHAR(255);
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column job_title already exists';
    END;
END $$;

-- Add job_posting_url column
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE outreach ADD COLUMN job_posting_url TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column job_posting_url already exists';
    END;
END $$;

-- Add experience_level column
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE outreach ADD COLUMN experience_level VARCHAR(50);
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column experience_level already exists';
    END;
END $$;

-- Create GIN index for aligned_sector if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_outreach_aligned_sector ON outreach USING GIN(aligned_sector);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_outreach_stage ON outreach(stage);
CREATE INDEX IF NOT EXISTS idx_outreach_temperature ON outreach(lead_temperature);
CREATE INDEX IF NOT EXISTS idx_outreach_ownership ON outreach(ownership);

-- Verify all columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'outreach' 
ORDER BY ordinal_position;

