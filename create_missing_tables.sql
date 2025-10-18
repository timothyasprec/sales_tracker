-- Create missing tables: builders and activities

-- Builders table
CREATE TABLE IF NOT EXISTS builders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cohort VARCHAR(100),
    role VARCHAR(255),
    skills TEXT,
    status VARCHAR(50) DEFAULT 'active',
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
    aligned_sector JSONB DEFAULT '[]'::jsonb,
    sector_alignment_notes TEXT,
    ownership VARCHAR(255),
    notes TEXT,
    next_steps TEXT,
    job_search_status VARCHAR(50) DEFAULT 'building_resume',
    offer_company_name VARCHAR(255),
    initial_salary DECIMAL(10,2),
    current_salary DECIMAL(10,2),
    offer_date DATE,
    start_date DATE,
    offer_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builders_cohort ON builders(cohort);
CREATE INDEX IF NOT EXISTS idx_builders_status ON builders(status);
CREATE INDEX IF NOT EXISTS idx_builders_job_search_status ON builders(job_search_status);
CREATE INDEX IF NOT EXISTS idx_builders_ownership ON builders(ownership);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_name VARCHAR(255),
    action_type VARCHAR(100),
    entity_type VARCHAR(100),
    entity_name VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_action_type ON activities(action_type);
