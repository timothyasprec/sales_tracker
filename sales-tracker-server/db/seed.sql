-- ========================================
-- Sales Tracker Seed Data
-- ========================================
-- This file populates the database with sample data for testing and demonstration
-- Run this AFTER schema.sql to populate the database

-- Clear existing data (if any)
TRUNCATE TABLE activities, job_posting_builders, job_postings, builders, outreach, users RESTART IDENTITY CASCADE;

-- ========================================
-- SEED USERS
-- ========================================
-- Password for all users: "password123" (hashed with bcrypt)
INSERT INTO users (name, email, password, role, is_active) VALUES
('Admin User', 'admin@pursuit.org', '$2b$10$YourHashedPasswordHere', 'admin', true),
('Sarah Johnson', 'sarah@pursuit.org', '$2b$10$YourHashedPasswordHere', 'staff', true),
('Michael Chen', 'michael@pursuit.org', '$2b$10$YourHashedPasswordHere', 'staff', true),
('Emily Rodriguez', 'emily@pursuit.org', '$2b$10$YourHashedPasswordHere', 'staff', true),
('David Kim', 'david@pursuit.org', '$2b$10$YourHashedPasswordHere', 'staff', true);

-- ========================================
-- SEED BUILDERS
-- ========================================
INSERT INTO builders (
    name, email, cohort, role, skills, status, job_search_status,
    ownership, linkedin_url, years_of_experience, education, university,
    aligned_sector, sector_alignment_notes, notes, created_at
) VALUES
(
    'Alex Martinez',
    'alex.martinez@pursuit.org',
    'Fellowship 9.0',
    'Full-Stack Developer',
    'React, Node.js, Express, PostgreSQL, JavaScript, HTML, CSS, Git',
    'active',
    'actively_applying',
    'Sarah Johnson',
    'https://linkedin.com/in/alexmartinez',
    2,
    'Bachelor''s Degree',
    'CUNY Hunter College',
    '["Technology", "Finance", "Health"]'::jsonb,
    'Strong background in fintech and healthcare applications. Has built HIPAA-compliant web apps.',
    '[2025-10-15] Builder added to system. Currently applying to fintech companies.',
    '2025-10-15'
),
(
    'Jessica Wong',
    'jessica.wong@pursuit.org',
    'Fellowship 9.0',
    'Frontend Developer',
    'React, TypeScript, Next.js, Tailwind CSS, Figma, JavaScript, Redux',
    'active',
    'interviewing',
    'Michael Chen',
    'https://linkedin.com/in/jessicawong',
    1,
    'Bootcamp/Certificate',
    'Pursuit Fellowship',
    '["Technology", "Marketing", "Education"]'::jsonb,
    'Excellent UI/UX skills. Has experience building marketing websites and educational platforms.',
    '[2025-10-12] Currently interviewing with 3 companies. Progress looking good!',
    '2025-10-12'
),
(
    'Marcus Johnson',
    'marcus.johnson@pursuit.org',
    'Fellowship 8.5',
    'Backend Developer',
    'Node.js, Python, Django, PostgreSQL, MongoDB, Docker, AWS, REST APIs',
    'active',
    'ready_to_apply',
    'Emily Rodriguez',
    'https://linkedin.com/in/marcusjohnson',
    3,
    'Bachelor''s Degree',
    'NYU',
    '["Technology", "Finance", "Government"]'::jsonb,
    'Strong backend and cloud infrastructure experience. Interested in government and fintech roles.',
    '[2025-10-10] Resume finalized. Ready to start applying.',
    '2025-10-10'
),
(
    'Samantha Lee',
    'samantha.lee@pursuit.org',
    'Fellowship 9.0',
    'Full-Stack Developer',
    'JavaScript, React, Node.js, Express, PostgreSQL, MongoDB, AWS',
    'active',
    'offer_hired',
    'David Kim',
    'https://linkedin.com/in/samanthalee',
    1,
    'Associate Degree (AA)',
    'LaGuardia Community College',
    '["Technology", "Health", "Non-Profit"]'::jsonb,
    'Passionate about healthcare technology and social impact. Strong technical skills.',
    '[2025-10-18] Received offer from HealthTech startup! Salary: $75,000. Start date: Nov 1.',
    '2025-10-18'
),
(
    'Daniel Rivera',
    'daniel.rivera@pursuit.org',
    'Fellowship 8.5',
    'Full-Stack Developer',
    'React, Vue.js, Node.js, Express, PostgreSQL, Python, Flask',
    'active',
    'building_resume',
    'Sarah Johnson',
    'https://linkedin.com/in/danielrivera',
    1,
    'High School',
    'N/A',
    '["Technology", "Education", "Other"]'::jsonb,
    'Self-taught developer with strong fundamentals. Eager to learn and grow.',
    '[2025-10-08] Working on portfolio projects and resume.',
    '2025-10-08'
);

-- ========================================
-- SEED OUTREACH (All Leads)
-- ========================================
INSERT INTO outreach (
    staff_user_id, contact_name, contact_title, contact_email, company_name,
    linkedin_url, outreach_date, status, stage, ownership, current_owner,
    source, aligned_sector, notes, created_at
) VALUES
(
    2, -- Sarah Johnson
    'Jennifer Park',
    'VP of Engineering',
    'jpark@techcorp.com',
    'TechCorp Solutions',
    'https://linkedin.com/in/jenniferpark',
    '2025-10-15',
    'responded',
    'Sales Pitch Meeting',
    'Sarah Johnson',
    'Sarah Johnson',
    '["LinkedIn", "Referral"]'::jsonb,
    '["Technology"]'::jsonb,
    '[2025-10-15] Initial outreach via LinkedIn. [2025-10-17] Responded! Meeting scheduled for 10/20.',
    '2025-10-15'
),
(
    3, -- Michael Chen
    'Robert Thompson',
    'CTO',
    'rthompson@financeplus.com',
    'FinancePlus Inc',
    'https://linkedin.com/in/robertthompson',
    '2025-10-10',
    'responded',
    'Interested',
    'Michael Chen',
    'Michael Chen',
    '["Cold Email"]'::jsonb,
    '["Finance", "Technology"]'::jsonb,
    '[2025-10-10] Cold email sent. [2025-10-12] Positive response - interested in hiring!',
    '2025-10-10'
),
(
    4, -- Emily Rodriguez
    'Maria Gonzalez',
    'Director of HR',
    'mgonzalez@healthsystems.com',
    'Health Systems Group',
    'https://linkedin.com/in/mariagonzalez',
    '2025-10-08',
    'responded',
    'Follow-up Resources Sent',
    'Emily Rodriguez',
    'Emily Rodriguez',
    '["Event", "Conference"]'::jsonb,
    '["Health", "Technology"]'::jsonb,
    '[2025-10-08] Met at healthcare tech conference. [2025-10-13] Sent builder profiles and Pursuit info.',
    '2025-10-08'
),
(
    2, -- Sarah Johnson
    'Kevin Wu',
    'Engineering Manager',
    'kwu@startupxyz.com',
    'StartupXYZ',
    'https://linkedin.com/in/kevinwu',
    '2025-10-05',
    'attempted',
    'Initial Outreach',
    'Sarah Johnson',
    'Sarah Johnson',
    '["LinkedIn"]'::jsonb,
    '["Technology", "Marketing"]'::jsonb,
    '[2025-10-05] Sent connection request and message. No response yet.',
    '2025-10-05'
),
(
    5, -- David Kim
    'Angela Davis',
    'Talent Acquisition Lead',
    'adavis@govtech.org',
    'GovTech Solutions',
    'https://linkedin.com/in/angeladavis',
    '2025-10-01',
    'responded',
    'Not Interested',
    'David Kim',
    'David Kim',
    '["Cold Email", "Government Database"]'::jsonb,
    '["Government", "Technology"]'::jsonb,
    '[2025-10-01] Email sent. [2025-10-03] Not hiring at this time. Will reach out in Q1 2026.',
    '2025-10-01'
);

-- ========================================
-- SEED JOB POSTINGS
-- ========================================
INSERT INTO job_postings (
    staff_user_id, company_name, job_title, job_url, source, status,
    ownership, experience_level, aligned_sector, salary_range, location,
    notes, is_shared, shared_date, created_at
) VALUES
(
    2, -- Sarah Johnson
    'TechFlow Inc',
    'Junior Full-Stack Developer',
    'https://jobs.techflow.com/positions/12345',
    'LinkedIn',
    'new',
    'Sarah Johnson',
    'Entry-Level',
    '["Technology"]',
    '$60,000 - $75,000',
    'New York, NY (Hybrid)',
    'Great opportunity for new grads. React/Node stack. Benefits include health insurance and 401k.',
    true,
    '2025-10-16',
    '2025-10-16'
),
(
    3, -- Michael Chen
    'DataCorp',
    'Backend Engineer',
    'https://datacorp.com/careers/backend-eng',
    'Indeed',
    'new',
    'Michael Chen',
    'Mid-Level',
    '["Technology", "Finance"]',
    '$80,000 - $95,000',
    'Brooklyn, NY (Remote)',
    'Python/Django shop. Working on financial data products. Shared with Marcus.',
    true,
    '2025-10-14',
    '2025-10-14'
),
(
    4, -- Emily Rodriguez
    'HealthFirst',
    'Frontend Developer',
    'https://healthfirst.com/jobs/frontend-dev',
    'Company Website',
    'new',
    'Emily Rodriguez',
    'Entry-Level',
    '["Health", "Technology"]',
    '$65,000 - $78,000',
    'Manhattan, NY (On-site)',
    'Healthcare startup building patient portal. React/TypeScript. Shared with Jessica and Samantha.',
    true,
    '2025-10-12',
    '2025-10-12'
),
(
    2, -- Sarah Johnson
    'EduTech Solutions',
    'Full-Stack Developer',
    'https://edutech.com/careers',
    'Referral',
    'new',
    'Sarah Johnson',
    'Entry-Level',
    '["Education", "Technology"]',
    '$62,000 - $72,000',
    'Queens, NY (Hybrid)',
    'EdTech platform for K-12 students. MERN stack. Not yet shared.',
    false,
    NULL,
    '2025-10-09'
),
(
    5, -- David Kim
    'CivicTech Partners',
    'Junior Software Engineer',
    'https://civictech.org/jobs/junior-swe',
    'Government Portal',
    'new',
    'David Kim',
    'Entry-Level',
    '["Government", "Technology"]',
    '$70,000 - $82,000',
    'Remote',
    'Building citizen-facing government services. Node.js/React. Shared with Marcus and Daniel.',
    true,
    '2025-10-11',
    '2025-10-11'
);

-- ========================================
-- SEED JOB POSTING BUILDERS (Matches)
-- ========================================
INSERT INTO job_posting_builders (
    job_posting_id, builder_name, status, shared_date, applied_date, notes
) VALUES
(1, 'Alex Martinez', 'Applied', '2025-10-16', '2025-10-17', 'Applied via company website. Waiting for response.'),
(1, 'Jessica Wong', 'Shared', '2025-10-16', NULL, 'Sent to Jessica for review.'),
(2, 'Marcus Johnson', 'Applied', '2025-10-14', '2025-10-15', 'Application submitted. Has referral from alumni.'),
(3, 'Jessica Wong', 'Phone Screen', '2025-10-12', '2025-10-13', 'Phone screen scheduled for 10/22.'),
(3, 'Samantha Lee', 'Declined', '2025-10-12', NULL, 'Declined - accepted offer elsewhere.'),
(5, 'Marcus Johnson', 'Shared', '2025-10-11', NULL, 'Shared today. Good match for his interests.'),
(5, 'Daniel Rivera', 'Shared', '2025-10-11', NULL, 'Could be good entry-level opportunity.');

-- ========================================
-- SEED ACTIVITIES (Activity Feed)
-- ========================================
INSERT INTO activities (
    user_id, user_name, action_type, entity_type, entity_name, details, created_at
) VALUES
(2, 'Sarah Johnson', 'added_lead', 'lead', 'TechCorp Solutions', '{"source": "LinkedIn"}', '2025-10-15 10:30:00'),
(2, 'Sarah Johnson', 'updated_lead', 'lead', 'TechCorp Solutions', '{"old_stage": "Initial Outreach", "new_stage": "Sales Pitch Meeting"}', '2025-10-17 14:20:00'),
(2, 'Sarah Johnson', 'added_job_posting', 'job_posting', 'Junior Full-Stack Developer - TechFlow Inc', '{"experience_level": "Entry-Level"}', '2025-10-16 09:15:00'),
(3, 'Michael Chen', 'added_builder', 'builder', 'Jessica Wong', '{"cohort": "Fellowship 9.0", "role": "Frontend Developer"}', '2025-10-12 11:00:00'),
(3, 'Michael Chen', 'updated_builder', 'builder', 'Jessica Wong', '{"changes": "job status from \"Ready to Apply\" to \"Interviewing\"", "job_status": "Interviewing"}', '2025-10-14 16:45:00'),
(4, 'Emily Rodriguez', 'added_lead', 'lead', 'Health Systems Group', '{"source": "Conference"}', '2025-10-08 13:30:00'),
(5, 'David Kim', 'updated_builder', 'builder', 'Samantha Lee', '{"changes": "job status from \"Interviewing\" to \"Offer/Hired\", salary to $75000", "job_status": "Offer/Hired"}', '2025-10-18 10:00:00'),
(2, 'Sarah Johnson', 'added_builder', 'builder', 'Alex Martinez', '{"cohort": "Fellowship 9.0", "role": "Full-Stack Developer"}', '2025-10-15 08:45:00');

-- ========================================
-- UPDATE SEQUENCES
-- ========================================
-- Ensure sequences are set correctly after manual inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('builders_id_seq', (SELECT MAX(id) FROM builders));
SELECT setval('outreach_id_seq', (SELECT MAX(id) FROM outreach));
SELECT setval('job_postings_id_seq', (SELECT MAX(id) FROM job_postings));
SELECT setval('job_posting_builders_id_seq', (SELECT MAX(id) FROM job_posting_builders));
SELECT setval('activities_id_seq', (SELECT MAX(id) FROM activities));

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Uncomment these to verify the seed data was inserted correctly

-- SELECT 'Users:' as table_name, COUNT(*) as count FROM users
-- UNION ALL
-- SELECT 'Builders:', COUNT(*) FROM builders
-- UNION ALL
-- SELECT 'Outreach:', COUNT(*) FROM outreach
-- UNION ALL
-- SELECT 'Job Postings:', COUNT(*) FROM job_postings
-- UNION ALL
-- SELECT 'Job Posting Builders:', COUNT(*) FROM job_posting_builders
-- UNION ALL
-- SELECT 'Activities:', COUNT(*) FROM activities;
