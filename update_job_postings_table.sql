-- Add missing columns to job_postings table
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS experience_level VARCHAR(100);
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS lead_temperature VARCHAR(50) DEFAULT 'cold';
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS aligned_sector TEXT;
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS ownership VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_postings_ownership ON job_postings(ownership);

-- Add comments
COMMENT ON COLUMN job_postings.experience_level IS 'Required experience level (e.g., Entry Level, Mid-Level)';
COMMENT ON COLUMN job_postings.lead_temperature IS 'How promising this job posting is';
COMMENT ON COLUMN job_postings.aligned_sector IS 'JSON array of aligned sectors for this job';
COMMENT ON COLUMN job_postings.ownership IS 'Staff member who owns this job posting';

