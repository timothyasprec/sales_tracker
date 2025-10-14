-- Migration to add aligned_sector and job posting fields to outreach table
-- Run this with: psql sales_tracker -f alter_outreach_table.sql

-- Add new columns for job postings and sector alignment
ALTER TABLE outreach ADD COLUMN aligned_sector JSONB DEFAULT '[]'::jsonb;
ALTER TABLE outreach ADD COLUMN job_title VARCHAR(255);
ALTER TABLE outreach ADD COLUMN job_posting_url TEXT;
ALTER TABLE outreach ADD COLUMN experience_level VARCHAR(50);

-- Create GIN index for aligned_sector for fast JSON queries
CREATE INDEX idx_outreach_aligned_sector ON outreach USING GIN(aligned_sector);

-- Add comments for documentation
COMMENT ON COLUMN outreach.aligned_sector IS 'JSON array of sectors this lead is aligned with for builder matching';
COMMENT ON COLUMN outreach.job_title IS 'Job title for job posting leads';
COMMENT ON COLUMN outreach.job_posting_url IS 'URL to the job posting';
COMMENT ON COLUMN outreach.experience_level IS 'Experience level required: Entry-Level, Mid-Level, or Senior';

