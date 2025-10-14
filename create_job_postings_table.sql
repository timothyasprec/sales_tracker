-- Create job_postings table separate from outreach/leads
CREATE TABLE IF NOT EXISTS job_postings (
  id SERIAL PRIMARY KEY,
  job_title VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  job_posting_url TEXT,
  experience_level VARCHAR(100),
  source VARCHAR(100),
  lead_temperature VARCHAR(50) DEFAULT 'cold',
  ownership VARCHAR(255),
  aligned_sector TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings(company_name);
CREATE INDEX IF NOT EXISTS idx_job_postings_ownership ON job_postings(ownership);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE job_postings IS 'Stores job postings tracked by the sales team';
COMMENT ON COLUMN job_postings.job_title IS 'Title of the job posting';
COMMENT ON COLUMN job_postings.company_name IS 'Company offering the job';
COMMENT ON COLUMN job_postings.job_posting_url IS 'URL to the job posting';
COMMENT ON COLUMN job_postings.experience_level IS 'Required experience level (e.g., Entry Level, Mid-Level)';
COMMENT ON COLUMN job_postings.source IS 'Source where job was found (e.g., LinkedIn, Indeed)';
COMMENT ON COLUMN job_postings.lead_temperature IS 'How promising this job posting is';
COMMENT ON COLUMN job_postings.ownership IS 'Staff member who owns this job posting';
COMMENT ON COLUMN job_postings.aligned_sector IS 'JSON array of aligned sectors for this job';
COMMENT ON COLUMN job_postings.notes IS 'Additional notes about the job posting';

