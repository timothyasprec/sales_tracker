-- Sales Tracker Database Tables
-- Run this file with: psql sales_tracker -f create_tables.sql

-- Users table
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

-- Outreach table
CREATE TABLE outreach (
    id SERIAL PRIMARY KEY,
    staff_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(255),
    contact_title VARCHAR(255),
    company_name VARCHAR(255) NOT NULL,
    linkedin_url TEXT,
    contact_method VARCHAR(50),
    outreach_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'attempted',
    notes TEXT,
    response_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_outreach_staff ON outreach(staff_user_id);
CREATE INDEX idx_outreach_company ON outreach(company_name);
CREATE INDEX idx_outreach_status ON outreach(status);
CREATE INDEX idx_outreach_date ON outreach(outreach_date);

-- Job postings table
CREATE TABLE job_postings (
    id SERIAL PRIMARY KEY,
    staff_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_url TEXT,
    source VARCHAR(50),
    outreach_id INTEGER REFERENCES outreach(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    description TEXT,
    salary_range VARCHAR(100),
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_job_postings_staff ON job_postings(staff_user_id);
CREATE INDEX idx_job_postings_company ON job_postings(company_name);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_outreach ON job_postings(outreach_id);

-- Job posting builders table
CREATE TABLE job_posting_builders (
    id SERIAL PRIMARY KEY,
    job_posting_id INTEGER NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    builder_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'shared',
    shared_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(job_posting_id, builder_name)
);

CREATE INDEX idx_jpb_job_posting ON job_posting_builders(job_posting_id);
CREATE INDEX idx_jpb_builder ON job_posting_builders(builder_name);
CREATE INDEX idx_jpb_status ON job_posting_builders(status);

