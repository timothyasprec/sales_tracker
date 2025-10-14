#!/bin/bash

# Cleanup Script for Sales Tracker Application
# This removes all fake data and keeps only Timothy Asprec

echo "🧹 Starting database cleanup..."

# Run the SQL cleanup commands
psql -d sales_tracker_db << 'EOF'

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

-- Display remaining data
\echo ''
\echo '✅ Cleanup complete! Here is what remains:'
\echo ''
\echo '👤 Users:'
SELECT id, name, email, role, is_active FROM users ORDER BY name;

\echo ''
\echo '📊 Summary:'
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM builders) as total_builders,
    (SELECT COUNT(*) FROM outreach) as total_leads,
    (SELECT COUNT(*) FROM activities) as total_activities;

EOF

echo ""
echo "✨ Cleanup finished! Restart your server and refresh the app."

