-- Insert Simple Dummy Data for Sales Tracker

-- Insert Users (password for all is 'password123')
INSERT INTO users (name, email, password, role, is_active) VALUES
('John Smith', 'john@pursuit.org', '$2b$10$hUUgcqb9IN4QY9AYqZ.iL.WltCJ/VT0/IljCuEfR9AlvXIMSeN.L2', 'admin', true),
('Sarah Johnson', 'sarah@pursuit.org', '$2b$10$hUUgcqb9IN4QY9AYqZ.iL.WltCJ/VT0/IljCuEfR9AlvXIMSeN.L2', 'staff', true),
('Mike Chen', 'mike@pursuit.org', '$2b$10$hUUgcqb9IN4QY9AYqZ.iL.WltCJ/VT0/IljCuEfR9AlvXIMSeN.L2', 'staff', true)
ON CONFLICT (email) DO NOTHING;

-- Insert Outreach Leads
INSERT INTO outreach (
  staff_user_id, company_name, contact_name, contact_email, contact_phone,
  linkedin_url, stage, lead_temperature, ownership, outreach_date,
  aligned_sector, notes, next_steps, status
) VALUES
(1, 'TechCorp Solutions', 'David Miller', 'david.miller@techcorp.com', '555-0101',
 'https://linkedin.com/in/davidmiller', 'Initial Contact', 'hot', 'John Smith', CURRENT_DATE - 2,
 '["Technology", "Finance"]'::jsonb, '[12/15/2024] Initial outreach via LinkedIn', 'Schedule intro call', 'active'),

(2, 'HealthTech Innovations', 'Lisa Wong', 'lisa@healthtech.io', '555-0102',
 'https://linkedin.com/in/lisawong', 'Meeting Scheduled', 'warm', 'Sarah Johnson', CURRENT_DATE - 5,
 '["Healthcare", "Technology"]'::jsonb, E'[12/10/2024] Met at tech conference\n[12/12/2024] Follow-up email sent', 'Prepare meeting agenda', 'active'),

(3, 'Green Energy Co', 'Robert Taylor', 'robert.t@greenenergy.com', '555-0103',
 'https://linkedin.com/in/roberttaylor', 'Follow-up', 'warm', 'Mike Chen', CURRENT_DATE - 10,
 '["Nonprofit"]'::jsonb, E'[12/01/2024] Cold outreach\n[12/08/2024] Responded positively', 'Send company overview', 'active'),

(1, 'FinanceHub Inc', 'Amanda Lee', 'alee@financehub.com', '555-0104',
 'https://linkedin.com/in/amandalee', 'Proposal Sent', 'hot', 'John Smith', CURRENT_DATE - 15,
 '["Finance", "Technology"]'::jsonb, E'[11/20/2024] Initial meeting\n[12/10/2024] Sent proposal', 'Follow up on proposal', 'active'),

(2, 'BuildRight Construction', 'James Wilson', 'jwilson@buildright.com', '555-0105',
 'https://linkedin.com/in/jameswilson', 'Initial Contact', 'cold', 'Sarah Johnson', CURRENT_DATE - 1,
 '["Construction"]'::jsonb, '[12/14/2024] LinkedIn connection accepted', 'Send introductory email', 'attempted');

-- Insert Job Postings
INSERT INTO job_postings (
  staff_user_id, company_name, job_title, job_url, source,
  experience_level, ownership, aligned_sector, notes, status
) VALUES
(1, 'TechCorp Solutions', 'Full Stack Developer', 'https://techcorp.com/careers/123', 'linkedin',
 'Mid', 'John Smith', '["Technology"]'::jsonb, 'Great benefits package', 'open'),

(2, 'HealthTech Innovations', 'Frontend Engineer', 'https://healthtech.io/jobs/456', 'indeed',
 'Entry', 'Sarah Johnson', '["Healthcare", "Technology"]'::jsonb, 'Remote-friendly position', 'open'),

(1, 'FinanceHub Inc', 'Software Engineer', 'https://financehub.com/careers/789', 'company_site',
 'Senior', 'John Smith', '["Finance", "Technology"]'::jsonb, 'Equity and 401k matching', 'open'),

(3, 'Green Energy Co', 'Junior Developer', 'https://greenenergy.com/jobs/101', 'referral',
 'Entry', 'Mike Chen', '["Nonprofit"]'::jsonb, 'Mission-driven company', 'open'),

(2, 'BuildRight Construction', 'Software Developer', 'https://buildright.com/jobs/303', 'indeed',
 'Mid', 'Sarah Johnson', '["Construction"]'::jsonb, 'Growing startup', 'open');
