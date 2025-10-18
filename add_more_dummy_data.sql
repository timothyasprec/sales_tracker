-- Add more comprehensive dummy data

-- Add more outreach leads
INSERT INTO outreach (
  staff_user_id, company_name, contact_name, contact_email, contact_phone,
  linkedin_url, stage, lead_temperature, ownership, outreach_date,
  aligned_sector, notes, next_steps, status
) VALUES
(2, 'EduTech Platform', 'Maria Garcia', 'maria@edutech.com', '555-0106',
 'https://linkedin.com/in/mariagarcia', 'Negotiation', 'hot', 'Sarah Johnson', CURRENT_DATE - 20,
 '["Education", "Technology"]'::jsonb, E'[11/15/2024] Initial outreach\n[11/25/2024] Demo call\n[12/05/2024] Pricing discussion', 'Finalize partnership', 'active'),

(3, 'Retail Innovations LLC', 'Kevin Brown', 'kbrown@retailinno.com', '555-0107',
 'https://linkedin.com/in/kevinbrown', 'Follow-up', 'warm', 'Mike Chen', CURRENT_DATE - 3,
 '["Retail", "Technology"]'::jsonb, '[12/12/2024] Met at networking event', 'Schedule follow-up call', 'active'),

(1, 'DataAnalytics Pro', 'Jennifer White', 'jwhite@dataanalytics.com', '555-0108',
 'https://linkedin.com/in/jenniferwhite', 'Initial Contact', 'cold', 'John Smith', CURRENT_DATE,
 '["Technology", "Finance"]'::jsonb, '[12/15/2024] Sent LinkedIn connection request', 'Wait for response', 'attempted');

-- Add more job postings
INSERT INTO job_postings (
  staff_user_id, company_name, job_title, job_url, source,
  experience_level, ownership, aligned_sector, notes, status
) VALUES
(2, 'EduTech Platform', 'Backend Developer', 'https://edutech.com/careers/505', 'linkedin',
 'Mid', 'Sarah Johnson', '["Education", "Technology"]'::jsonb, 'Remote position, flexible hours', 'open'),

(1, 'Retail Innovations LLC', 'Full Stack Engineer', 'https://retailinno.com/careers/606', 'company_site',
 'Senior', 'John Smith', '["Retail", "Technology"]'::jsonb, 'E-commerce platform', 'open'),

(3, 'DataAnalytics Pro', 'Data Engineer', 'https://dataanalytics.com/jobs/707', 'referral',
 'Mid', 'Mike Chen', '["Technology", "Finance"]'::jsonb, 'Big data and ML focus', 'open');

-- Add Builders
INSERT INTO builders (
  name, email, cohort, role, skills, ownership, aligned_sector,
  linkedin_url, years_of_experience, education, university, major,
  job_search_status, notes, next_steps
) VALUES
('Alex Thompson', 'alex.thompson@pursuit.org', '10.0', 'Full Stack Developer',
 'React, Node.js, PostgreSQL, JavaScript', 'John Smith', '["Technology", "Finance"]'::jsonb,
 'https://linkedin.com/in/alexthompson', 2, 'Bachelor of Arts', 'CUNY Hunter', 'Computer Science',
 'actively_applying', E'[12/10/2024] Applied to 5 positions\n[12/14/2024] Interview at TechCorp', 'Prepare for TechCorp interview'),

('Maya Patel', 'maya.patel@pursuit.org', '10.0', 'Frontend Developer',
 'React, JavaScript, CSS, Tailwind', 'Sarah Johnson', '["Technology", "Healthcare"]'::jsonb,
 'https://linkedin.com/in/mayapatel', 1, 'Associate Degree', 'LaGuardia CC', 'Liberal Arts',
 'interviewing', E'[12/01/2024] Interview with HealthTech\n[12/12/2024] First round completed', 'Prep for second round'),

('Jordan Lee', 'jordan.lee@pursuit.org', '9.5', 'Full Stack Developer',
 'React, Node.js, MongoDB, Python', 'Mike Chen', '["Technology", "Education"]'::jsonb,
 'https://linkedin.com/in/jordanlee', 3, 'Bachelor of Science', 'NYU', 'Information Systems',
 'offer_negotiation', E'[11/20/2024] Received offer from EduTech\n[12/05/2024] Negotiating salary', 'Finalize offer'),

('Sam Rodriguez', 'sam.rodriguez@pursuit.org', '10.0', 'Backend Developer',
 'Node.js, Express, PostgreSQL, Python', 'Sarah Johnson', '["Technology", "Finance"]'::jsonb,
 'https://linkedin.com/in/samrodriguez', 1, 'Some College', 'Brooklyn College', 'Mathematics',
 'ready_to_apply', '[12/14/2024] Resume updated', 'Start applying to positions'),

('Taylor Kim', 'taylor.kim@pursuit.org', '9.5', 'Full Stack Developer',
 'React, Vue.js, Node.js, AWS', 'John Smith', '["Technology", "Retail"]'::jsonb,
 'https://linkedin.com/in/taylorkim', 4, 'Bachelor of Arts', 'Columbia', 'Economics',
 'hired', E'[10/15/2024] Accepted offer\nSalary: $95,000\nStart: 01/15/2025', 'Complete onboarding'),

('Casey Martinez', 'casey.martinez@pursuit.org', '10.0', 'Frontend Developer',
 'React, TypeScript, Next.js', 'Mike Chen', '["Technology", "Nonprofit"]'::jsonb,
 'https://linkedin.com/in/caseymartinez', 1, 'High School', NULL, NULL,
 'building_resume', '[12/12/2024] Working on portfolio', 'Complete portfolio site'),

('Jamie Washington', 'jamie.washington@pursuit.org', '10.0', 'Backend Developer',
 'Node.js, Python, Django, PostgreSQL', 'John Smith', '["Technology", "Healthcare"]'::jsonb,
 'https://linkedin.com/in/jamiewashington', 2, 'Bachelor of Science', 'CUNY Queens', 'Biology',
 'actively_applying', '[12/13/2024] Applied to HealthTech', 'Follow up on applications'),

('River Chen', 'river.chen@pursuit.org', '9.5', 'Full Stack Developer',
 'React, Node.js, Express, MongoDB', 'Sarah Johnson', '["Technology", "Education"]'::jsonb,
 'https://linkedin.com/in/riverchen', 2, 'Bachelor of Arts', 'CUNY Baruch', 'Business',
 'interviewing', E'[12/08/2024] Applied to EduTech\n[12/11/2024] Phone screen', 'Technical interview prep');

-- Add Activities
INSERT INTO activities (user_id, user_name, action_type, entity_type, entity_name, details, created_at) VALUES
(1, 'John Smith', 'added_lead', 'lead', 'TechCorp Solutions', '{"company": "TechCorp Solutions", "contact": "David Miller", "temperature": "hot"}'::jsonb, NOW() - INTERVAL '2 days'),
(2, 'Sarah Johnson', 'added_lead', 'lead', 'HealthTech Innovations', '{"company": "HealthTech Innovations", "contact": "Lisa Wong", "temperature": "warm"}'::jsonb, NOW() - INTERVAL '5 days'),
(3, 'Mike Chen', 'updated_lead', 'lead', 'Green Energy Co', '{"stage": "Follow-up", "notes": "Responded positively"}'::jsonb, NOW() - INTERVAL '7 days'),
(1, 'John Smith', 'added_job_posting', 'job_posting', 'TechCorp Solutions - Full Stack Developer', '{"company": "TechCorp Solutions", "title": "Full Stack Developer"}'::jsonb, NOW() - INTERVAL '2 days'),
(2, 'Sarah Johnson', 'added_builder', 'builder', 'Maya Patel', '{"name": "Maya Patel", "cohort": "10.0"}'::jsonb, NOW() - INTERVAL '30 days'),
(1, 'John Smith', 'updated_builder', 'builder', 'Taylor Kim', '{"status": "hired", "company": "Retail Innovations", "salary": "95000"}'::jsonb, NOW() - INTERVAL '45 days'),
(3, 'Mike Chen', 'updated_builder', 'builder', 'Jordan Lee', '{"status": "offer_negotiation"}'::jsonb, NOW() - INTERVAL '10 days'),
(2, 'Sarah Johnson', 'added_job_posting', 'job_posting', 'HealthTech - Frontend Engineer', '{"company": "HealthTech", "title": "Frontend Engineer"}'::jsonb, NOW() - INTERVAL '1 day'),
(1, 'John Smith', 'added_lead', 'lead', 'FinanceHub Inc', '{"company": "FinanceHub Inc", "temperature": "hot"}'::jsonb, NOW() - INTERVAL '15 days'),
(3, 'Mike Chen', 'updated_lead', 'lead', 'EduTech Platform', '{"stage": "Negotiation"}'::jsonb, NOW() - INTERVAL '20 days');
