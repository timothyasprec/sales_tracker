-- Add job search status and offer details columns to builders table
-- Run this file with: psql sales_tracker -f add_builder_job_status.sql

-- Add job search status column
ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS job_search_status VARCHAR(50) DEFAULT 'building_resume';

-- Add offer details columns
ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS offer_company_name VARCHAR(255);

ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS initial_salary DECIMAL(10, 2);

ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS current_salary DECIMAL(10, 2);

ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS offer_date DATE;

ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS start_date DATE;

ALTER TABLE builders 
ADD COLUMN IF NOT EXISTS offer_notes TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_builders_job_search_status ON builders(job_search_status);
CREATE INDEX IF NOT EXISTS idx_builders_offer_company ON builders(offer_company_name);

-- Add comments
COMMENT ON COLUMN builders.job_search_status IS 'Current stage in job search: building_resume, ready_to_apply, actively_applying, interviewing, offer_negotiation, hired, paused';
COMMENT ON COLUMN builders.offer_company_name IS 'Name of company that made the offer';
COMMENT ON COLUMN builders.initial_salary IS 'Salary before Pursuit program';
COMMENT ON COLUMN builders.current_salary IS 'Current/offered salary';
COMMENT ON COLUMN builders.offer_date IS 'Date the offer was received';
COMMENT ON COLUMN builders.start_date IS 'Start date for the new role';
COMMENT ON COLUMN builders.offer_notes IS 'Additional notes about the offer';

