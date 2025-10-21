-- ========================================
-- Sales Tracker Database Schema
-- ========================================
-- This file creates all tables for the Sales Tracker application
-- Run this on a fresh database to set up the schema

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS job_posting_builders CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE;
DROP TABLE IF EXISTS builders CASCADE;
DROP TABLE IF EXISTS outreach CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ========================================
-- OUTREACH TABLE (All Leads)
-- ========================================
CREATE TABLE outreach (
    id SERIAL PRIMARY KEY,
    staff_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(255),
    contact_title VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    company_name VARCHAR(255) NOT NULL,
    linkedin_url TEXT,
    contact_method VARCHAR(50),
    outreach_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'attempted',
    stage VARCHAR(100) DEFAULT 'Initial Outreach',
    stage_detail VARCHAR(255),
    ownership VARCHAR(255),
    current_owner VARCHAR(255),
    source JSONB DEFAULT '[]',
    aligned_sector JSONB DEFAULT '[]',
    job_title VARCHAR(255),
    job_posting_url TEXT,
    job_description_url TEXT,
    experience_level VARCHAR(50),
    salary_range VARCHAR(255),
    role_consideration TEXT,
    notes TEXT,
    response_notes TEXT,
    next_steps JSONB DEFAULT '[]',
    is_shared BOOLEAN DEFAULT false,
    shared_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE outreach IS 'Tracks all outreach leads - both contact outreach and job postings';
COMMENT ON COLUMN outreach.aligned_sector IS 'JSON array of sectors this lead is aligned with for builder matching';
COMMENT ON COLUMN outreach.ownership IS 'Original creator of the lead (immutable)';
COMMENT ON COLUMN outreach.current_owner IS 'Current person responsible for following up on the lead (can be reassigned)';
COMMENT ON COLUMN outreach.stage_detail IS 'Additional detail for stages: Active Lead (type), Close Won (reason), Close Loss (reason)';
COMMENT ON COLUMN outreach.next_steps IS 'Array of next step objects with id, task, created_at, and completed fields';
COMMENT ON COLUMN outreach.is_shared IS 'Whether this job posting has been shared with builders';
COMMENT ON COLUMN outreach.shared_date IS 'Date when job posting was marked as shared';

CREATE INDEX idx_outreach_staff ON outreach(staff_user_id);
CREATE INDEX idx_outreach_company ON outreach(company_name);
CREATE INDEX idx_outreach_date ON outreach(outreach_date);
CREATE INDEX idx_outreach_status ON outreach(status);
CREATE INDEX idx_outreach_stage ON outreach(stage);
CREATE INDEX idx_outreach_stage_detail ON outreach(stage_detail);
CREATE INDEX idx_outreach_ownership ON outreach(ownership);
CREATE INDEX idx_outreach_current_owner ON outreach(current_owner);
CREATE INDEX idx_outreach_aligned_sector ON outreach USING GIN(aligned_sector);
CREATE INDEX idx_outreach_next_steps ON outreach USING GIN(next_steps);
CREATE INDEX idx_outreach_is_shared ON outreach(is_shared);

-- ========================================
-- JOB POSTINGS TABLE
-- ========================================
CREATE TABLE job_postings (
    id SERIAL PRIMARY KEY,
    staff_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outreach_id INTEGER REFERENCES outreach(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_url TEXT,
    source VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    ownership VARCHAR(255),
    description TEXT,
    salary_range VARCHAR(100),
    location VARCHAR(255),
    experience_level VARCHAR(100),
    aligned_sector TEXT,
    notes TEXT,
    is_shared BOOLEAN DEFAULT false,
    shared_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE job_postings IS 'Stores job postings tracked by the sales team';
COMMENT ON COLUMN job_postings.aligned_sector IS 'JSON array of aligned sectors for this job';
COMMENT ON COLUMN job_postings.ownership IS 'Staff member who owns this job posting';

CREATE INDEX idx_job_postings_staff ON job_postings(staff_user_id);
CREATE INDEX idx_job_postings_outreach ON job_postings(outreach_id);
CREATE INDEX idx_job_postings_company ON job_postings(company_name);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_ownership ON job_postings(ownership);
CREATE INDEX idx_job_postings_is_shared ON job_postings(is_shared);
CREATE INDEX idx_job_postings_created_at ON job_postings(created_at DESC);

-- ========================================
-- BUILDERS TABLE
-- ========================================
CREATE TABLE builders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cohort VARCHAR(100),
    role VARCHAR(255),
    skills TEXT,
    status VARCHAR(50) DEFAULT 'active',
    job_search_status VARCHAR(50) DEFAULT 'building_resume',
    ownership VARCHAR(255),
    bio TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    years_of_experience INTEGER,
    education VARCHAR(255),
    university VARCHAR(255),
    major VARCHAR(255),
    education_completed BOOLEAN DEFAULT false,
    date_of_birth DATE,
    aligned_sector JSONB DEFAULT '[]',
    sector_alignment_notes TEXT,
    offer_company_name VARCHAR(255),
    initial_salary NUMERIC(10,2),
    current_salary NUMERIC(10,2),
    offer_date DATE,
    start_date DATE,
    offer_notes TEXT,
    notes TEXT,
    next_steps TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_builders_cohort ON builders(cohort);
CREATE INDEX idx_builders_status ON builders(status);
CREATE INDEX idx_builders_job_search_status ON builders(job_search_status);
CREATE INDEX idx_builders_ownership ON builders(ownership);

-- ========================================
-- JOB POSTING BUILDERS (Relationship Table)
-- ========================================
CREATE TABLE job_posting_builders (
    id SERIAL PRIMARY KEY,
    job_posting_id INTEGER NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    builder_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Shared',
    shared_date DATE DEFAULT CURRENT_DATE,
    applied_date DATE,
    last_updated_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(job_posting_id, builder_name)
);

COMMENT ON TABLE job_posting_builders IS 'Tracks which builders have been shared job postings and their application status';
COMMENT ON COLUMN job_posting_builders.status IS 'Application status stages: Shared, Applied, Phone Screen, Technical Interview, Final Interview, Offer, Rejected, Accepted, Declined, Withdrawn';

CREATE INDEX idx_jpb_job_posting ON job_posting_builders(job_posting_id);
CREATE INDEX idx_jpb_builder ON job_posting_builders(builder_name);
CREATE INDEX idx_jpb_status ON job_posting_builders(status);
CREATE INDEX idx_jpb_applied_date ON job_posting_builders(applied_date);

-- ========================================
-- ACTIVITIES TABLE (Activity Feed)
-- ========================================
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_name VARCHAR(255),
    action_type VARCHAR(100),
    entity_type VARCHAR(100),
    entity_name VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activities_action_type ON activities(action_type);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
