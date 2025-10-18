-- Insert Dummy Data for Sales Tracker

-- Clear existing data (optional - uncomment if you want to start fresh)
-- TRUNCATE TABLE activities, job_posting_builders, job_postings, outreach, builders, users RESTART IDENTITY CASCADE;

-- Insert Users (passwords are all 'password123' hashed with bcrypt)
INSERT INTO users (name, email, password, role, is_active) VALUES
('John Smith', 'john@pursuit.org', '$2b$10$hUUgcqb9IN4QY9AYqZ.iL.WltCJ/VT0/IljCuEfR9AlvXIMSeN.L2', 'admin', true),
('Sarah Johnson', 'sarah@pursuit.org', '$2b$10$hUUgcqb9IN4QY9AYqZ.iL.WltCJ/VT0/IljCuEfR9AlvXIMSeN.L2', 'staff', true),
('Mike Chen', 'mike@pursuit.org', '$2b$10$hUUgcqb9IN4QY9AYqZ.iL.WltCJ/VT0/IljCuEfR9AlvXIMSeN.L2', 'staff', true),
('Emily Rodriguez', 'emily@pursuit.org', '$2b$10$hUUgcqb9IN4QY9AYqZ.iL.WltCJ/VT0/IljCuEfR9AlvXIMSeN.L2', 'staff', true);

-- Insert Outreach Leads
INSERT INTO outreach (
  staff_user_id, company_name, contact_name, contact_email, contact_phone,
  linkedin_url, source, stage, lead_temperature, ownership,
  aligned_sector, notes, next_steps, created_at
) VALUES
(1, 'TechCorp Solutions', 'David Miller', 'david.miller@techcorp.com', '555-0101',
 'https://linkedin.com/in/davidmiller', 'Personal Network', 'Initial Contact', 'hot', 'John Smith',
 '["Technology", "Finance"]', '[12/15/2024] Initial outreach via LinkedIn', 'Schedule intro call', NOW() - INTERVAL '2 days'),

(2, 'HealthTech Innovations', 'Lisa Wong', 'lisa@healthtech.io', '555-0102',
 'https://linkedin.com/in/lisawong', 'Professional Network', 'Meeting Scheduled', 'warm', 'Sarah Johnson',
 '["Healthcare", "Technology"]', '[12/10/2024] Met at tech conference
[12/12/2024] Follow-up email sent
[12/14/2024] Meeting scheduled for next week', 'Prepare meeting agenda', NOW() - INTERVAL '5 days'),

(3, 'Green Energy Co', 'Robert Taylor', 'robert.t@greenenergy.com', '555-0103',
 'https://linkedin.com/in/roberttaylor', 'Online/Research', 'Follow-up', 'warm', 'Mike Chen',
 '["Nonprofit", "Technology"]', '[12/01/2024] Cold outreach
[12/08/2024] Responded positively', 'Send company overview', NOW() - INTERVAL '10 days'),

(1, 'FinanceHub Inc', 'Amanda Lee', 'alee@financehub.com', '555-0104',
 'https://linkedin.com/in/amandalee', 'Personal Network', 'Proposal Sent', 'hot', 'John Smith',
 '["Finance", "Technology"]', '[11/20/2024] Initial meeting
[11/28/2024] Second meeting with hiring manager
[12/10/2024] Sent partnership proposal', 'Follow up on proposal', NOW() - INTERVAL '15 days'),

(4, 'BuildRight Construction', 'James Wilson', 'jwilson@buildright.com', '555-0105',
 'https://linkedin.com/in/jameswilson', 'Professional Network', 'Initial Contact', 'cold', 'Emily Rodriguez',
 '["Construction", "Technology"]', '[12/14/2024] LinkedIn connection accepted', 'Send introductory email', NOW() - INTERVAL '1 day'),

(2, 'EduTech Platform', 'Maria Garcia', 'maria@edutech.com', '555-0106',
 'https://linkedin.com/in/mariagarcia', 'Online/Research', 'Negotiation', 'hot', 'Sarah Johnson',
 '["Education", "Technology"]', '[11/15/2024] Initial outreach
[11/25/2024] Demo call completed
[12/05/2024] Pricing discussion', 'Finalize partnership terms', NOW() - INTERVAL '20 days'),

(3, 'Retail Innovations LLC', 'Kevin Brown', 'kbrown@retailinno.com', '555-0107',
 'https://linkedin.com/in/kevinbrown', 'Personal Network', 'Follow-up', 'warm', 'Mike Chen',
 '["Retail", "Technology"]', '[12/12/2024] Initial conversation at networking event', 'Schedule follow-up call', NOW() - INTERVAL '3 days');

-- Insert Job Postings
INSERT INTO job_postings (
  staff_user_id, company_name, job_title, job_url, source,
  experience_level, ownership, aligned_sector, notes, created_at
) VALUES
(1, 'TechCorp Solutions', 'Full Stack Developer', 'https://techcorp.com/careers/123', 'linkedin',
 'Mid', 'John Smith', '["Technology"]', 'Great benefits package', NOW() - INTERVAL '2 days'),

(2, 'HealthTech Innovations', 'Frontend Engineer', 'https://healthtech.io/jobs/456', 'indeed',
 'Entry', 'Sarah Johnson', '["Healthcare", "Technology"]', 'Remote-friendly position', NOW() - INTERVAL '1 day'),

(1, 'FinanceHub Inc', 'Software Engineer', 'https://financehub.com/careers/789', 'company_site',
 'Senior', 'John Smith', '["Finance", "Technology"]', 'Equity and 401k matching', NOW() - INTERVAL '5 days'),

(3, 'Green Energy Co', 'Junior Developer', 'https://greenenergy.com/jobs/101', 'referral',
 'Entry', 'Mike Chen', '["Nonprofit", "Technology"]', 'Mission-driven company', NOW() - INTERVAL '3 days'),

(4, 'EduTech Platform', 'Backend Developer', 'https://edutech.com/careers/202', 'linkedin',
 'Mid', 'Emily Rodriguez', '["Education", "Technology"]', 'Flexible hours', NOW() - INTERVAL '4 days'),

(2, 'BuildRight Construction', 'Software Developer', 'https://buildright.com/jobs/303', 'indeed',
 'Entry', 'Sarah Johnson', '["Construction", "Technology"]', 'Growing startup', NOW() - INTERVAL '6 days'),

(1, 'Retail Innovations LLC', 'Full Stack Engineer', 'https://retailinno.com/careers/404', 'company_site',
 'Senior', 'John Smith', '["Retail", "Technology"]', 'Innovative e-commerce platform', NOW() - INTERVAL '7 days');

-- Insert Builders (Fellows)
INSERT INTO builders (
  name, email, cohort, role, skills, ownership, aligned_sector,
  linkedin_url, years_of_experience, education, university, major,
  job_search_status, notes, next_steps, created_at
) VALUES
('Alex Thompson', 'alex.thompson@pursuit.org', '10.0', 'Full Stack Developer',
 'React, Node.js, PostgreSQL, JavaScript, Express', 'John Smith', '["Technology", "Finance"]',
 'https://linkedin.com/in/alexthompson', 2, 'Bachelor of Arts', 'CUNY Hunter', 'Computer Science',
 'actively_applying', '[12/10/2024] Applied to 5 positions this week', 'Review and apply to TechCorp posting', NOW() - INTERVAL '30 days'),

('Maya Patel', 'maya.patel@pursuit.org', '10.0', 'Frontend Developer',
 'React, JavaScript, CSS, HTML, Tailwind', 'Sarah Johnson', '["Technology", "Healthcare"]',
 'https://linkedin.com/in/mayapatel', 1, 'Associate Degree', 'LaGuardia CC', 'Liberal Arts',
 'interviewing', '[12/01/2024] Interview with HealthTech scheduled
[12/12/2024] First round completed', 'Prepare for second round interview', NOW() - INTERVAL '45 days'),

('Jordan Lee', 'jordan.lee@pursuit.org', '9.5', 'Full Stack Developer',
 'React, Node.js, MongoDB, Python, Django', 'Mike Chen', '["Technology", "Education"]',
 'https://linkedin.com/in/jordanlee', 3, 'Bachelor of Science', 'NYU', 'Information Systems',
 'offer_negotiation', '[11/20/2024] Received offer from EduTech
[12/05/2024] Negotiating salary', 'Finalize offer details', NOW() - INTERVAL '60 days'),

('Sam Rodriguez', 'sam.rodriguez@pursuit.org', '10.0', 'Backend Developer',
 'Node.js, Express, PostgreSQL, Python, Flask', 'Emily Rodriguez', '["Technology", "Finance"]',
 'https://linkedin.com/in/samrodriguez', 1, 'Some College', 'Brooklyn College', 'Mathematics',
 'ready_to_apply', '[12/14/2024] Resume updated and reviewed', 'Start applying to positions', NOW() - INTERVAL '20 days'),

('Taylor Kim', 'taylor.kim@pursuit.org', '9.5', 'Full Stack Developer',
 'React, Vue.js, Node.js, PostgreSQL, AWS', 'John Smith', '["Technology", "Retail"]',
 'https://linkedin.com/in/taylorkim', 4, 'Bachelor of Arts', 'Columbia University', 'Economics',
 'hired', '[10/15/2024] Accepted offer from Retail Innovations
Start date: 01/15/2025
Initial salary: $95,000', 'Complete onboarding documents', NOW() - INTERVAL '90 days'),

('Casey Martinez', 'casey.martinez@pursuit.org', '10.0', 'Frontend Developer',
 'React, TypeScript, Next.js, GraphQL', 'Sarah Johnson', '["Technology", "Nonprofit"]',
 'https://linkedin.com/in/caseymartinez', 1, 'High School Diploma', 'N/A', 'N/A',
 'building_resume', '[12/12/2024] Working on portfolio projects', 'Complete portfolio site', NOW() - INTERVAL '15 days');

-- Insert Activities
INSERT INTO activities (user_name, action_type, entity_type, entity_name, details, created_at) VALUES
('John Smith', 'added_lead', 'lead', 'TechCorp Solutions', '{"company": "TechCorp Solutions", "contact": "David Miller", "temperature": "hot"}', NOW() - INTERVAL '2 days'),
('Sarah Johnson', 'added_lead', 'lead', 'HealthTech Innovations', '{"company": "HealthTech Innovations", "contact": "Lisa Wong", "temperature": "warm"}', NOW() - INTERVAL '5 days'),
('Mike Chen', 'updated_lead', 'lead', 'Green Energy Co', '{"stage": "Follow-up", "notes": "Responded positively"}', NOW() - INTERVAL '7 days'),
('John Smith', 'added_job_posting', 'job_posting', 'TechCorp Solutions - Full Stack Developer', '{"company": "TechCorp Solutions", "title": "Full Stack Developer"}', NOW() - INTERVAL '2 days'),
('Sarah Johnson', 'added_builder', 'builder', 'Maya Patel', '{"name": "Maya Patel", "cohort": "10.0"}', NOW() - INTERVAL '45 days'),
('Emily Rodriguez', 'updated_builder', 'builder', 'Jordan Lee', '{"status": "offer_negotiation", "notes": "Negotiating salary with EduTech"}', NOW() - INTERVAL '10 days'),
('John Smith', 'added_job_posting', 'job_posting', 'FinanceHub Inc - Software Engineer', '{"company": "FinanceHub Inc", "title": "Software Engineer"}', NOW() - INTERVAL '5 days');
