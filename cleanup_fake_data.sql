-- Cleanup Script: Remove fake users, activities, and builders
-- This will keep only Timothy Asprec and remove all test data

-- Delete all activities (all fake)
DELETE FROM activities;

-- Delete all builders (all fake)
DELETE FROM builders;

-- Delete all job posting builders relationships
DELETE FROM job_posting_builders;

-- Delete all job postings
DELETE FROM job_postings;

-- Delete all outreach/leads that are not owned by Timothy Asprec
DELETE FROM outreach WHERE ownership != 'Timothy Asprec';

-- Delete all outreach/leads with ownership NULL
DELETE FROM outreach WHERE ownership IS NULL;

-- Delete fake users (keep only Timothy Asprec)
DELETE FROM users 
WHERE name IN (
    'Alex Martinez',
    'Jordan Lee',
    'Emily Rodriguez',
    'Marcus Johnson',
    'Sarah Chen',
    'John Doe',
    'Jane Smith'
);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify remaining users (should only show Timothy Asprec)
SELECT id, name, email, role, is_active, created_at 
FROM users 
ORDER BY name;

-- Verify all tables are cleaned
SELECT 
    (SELECT COUNT(*) FROM users) as user_count,
    (SELECT COUNT(*) FROM builders) as builder_count,
    (SELECT COUNT(*) FROM outreach) as lead_count,
    (SELECT COUNT(*) FROM activities) as activity_count,
    (SELECT COUNT(*) FROM job_postings) as job_posting_count;

