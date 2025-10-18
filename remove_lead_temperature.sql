-- Migration to remove lead_temperature column from outreach and job_postings tables
-- Run this with: psql sales_tracker -f remove_lead_temperature.sql

-- Drop the index for outreach
DROP INDEX IF EXISTS idx_outreach_temperature;

-- Remove the lead_temperature column from outreach
ALTER TABLE outreach DROP COLUMN IF EXISTS lead_temperature;

-- Remove the lead_temperature column from job_postings
ALTER TABLE job_postings DROP COLUMN IF EXISTS lead_temperature;
