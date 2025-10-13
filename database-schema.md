# Sales Tracker Database Schema

## Overview
This database supports a two-pathway approach for tracking sales outreach and job postings at Pursuit.

## Tables

### 1. users
Stores all user accounts (staff members and admins)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique user identifier |
| name | VARCHAR(255) | NOT NULL | Full name of user |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email for login |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | VARCHAR(50) | NOT NULL, DEFAULT 'staff' | Role: 'staff' or 'admin' |
| is_active | BOOLEAN | DEFAULT true | Account active status |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_role` on `role`

---

### 2. outreach
Pathway 1: Tracks staff contact outreach to potential employers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique outreach identifier |
| staff_user_id | INTEGER | NOT NULL, FOREIGN KEY → users(id) | Staff member who logged this |
| contact_name | VARCHAR(255) | | Name of person contacted |
| contact_title | VARCHAR(255) | | Title/role of contact |
| company_name | VARCHAR(255) | NOT NULL | Company name |
| linkedin_url | TEXT | | LinkedIn URL of contact |
| contact_method | VARCHAR(50) | | Method: 'email', 'linkedin', 'phone', 'in_person', 'other' |
| outreach_date | DATE | NOT NULL | Date of outreach attempt |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'attempted' | Pipeline status (see below) |
| notes | TEXT | | General notes about the outreach |
| response_notes | TEXT | | Notes about their response |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Status Values:**
- `attempted` - Initial outreach made
- `responded` - Contact responded
- `interested` - Expressed interest
- `meeting_scheduled` - Meeting/call scheduled
- `opportunity_created` - Led to job opportunity
- `not_interested` - Declined/not interested
- `no_response` - No response received

**Indexes:**
- `idx_outreach_staff` on `staff_user_id`
- `idx_outreach_company` on `company_name`
- `idx_outreach_status` on `status`
- `idx_outreach_date` on `outreach_date`

---

### 3. job_postings
Pathway 2: Tracks job postings sourced by staff

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique job posting identifier |
| staff_user_id | INTEGER | NOT NULL, FOREIGN KEY → users(id) | Staff member who logged this |
| company_name | VARCHAR(255) | NOT NULL | Company with the opening |
| job_title | VARCHAR(255) | NOT NULL | Job title/role |
| job_url | TEXT | | Link to job posting |
| source | VARCHAR(50) | | Source: 'outreach', 'job_board', 'referral', 'other' |
| outreach_id | INTEGER | FOREIGN KEY → outreach(id) | Links to outreach if applicable |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'new' | Pipeline status (see below) |
| description | TEXT | | Job description details |
| salary_range | VARCHAR(100) | | Salary information if available |
| location | VARCHAR(255) | | Job location |
| notes | TEXT | | General notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Status Values:**
- `new` - Just logged
- `reviewing` - Being reviewed by team
- `shared_with_builders` - Shared with Builders
- `builders_applied` - One or more Builders applied
- `interview_stage` - Builder(s) in interview process
- `offer_received` - Builder received offer
- `closed` - Posting closed/filled

**Indexes:**
- `idx_job_postings_staff` on `staff_user_id`
- `idx_job_postings_company` on `company_name`
- `idx_job_postings_status` on `status`
- `idx_job_postings_outreach` on `outreach_id`

---

### 4. job_posting_builders
Tracks which Builders are associated with which job postings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| job_posting_id | INTEGER | NOT NULL, FOREIGN KEY → job_postings(id) ON DELETE CASCADE | Job posting reference |
| builder_name | VARCHAR(255) | NOT NULL | Name of the Builder |
| status | VARCHAR(50) | DEFAULT 'shared' | Status: 'shared', 'applied', 'interview', 'offer', 'hired', 'declined' |
| shared_date | DATE | DEFAULT CURRENT_DATE | Date shared with Builder |
| notes | TEXT | | Notes about this Builder/job match |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_jpb_job_posting` on `job_posting_id`
- `idx_jpb_builder` on `builder_name`
- `idx_jpb_status` on `status`

**Unique Constraint:**
- `UNIQUE(job_posting_id, builder_name)` - Prevent duplicate Builder/job combinations

---

## Relationships

```
users (1) ──< (many) outreach
  └─ A user (staff) can create many outreach records

users (1) ──< (many) job_postings
  └─ A user (staff) can create many job postings

outreach (1) ──< (many) job_postings
  └─ An outreach can lead to multiple job postings (optional relationship)

job_postings (1) ──< (many) job_posting_builders
  └─ A job posting can be shared with many Builders
```

---

## SQL Create Statements

### Create Tables

```sql
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
```

---

## Future Considerations

### For Salesforce Integration
- Add `salesforce_opportunity_id` to `job_postings` table
- Add `salesforce_sync_status` and `salesforce_last_sync` fields

### For AI Native Tool Integration
- Add `ai_native_application_id` to `job_posting_builders` table
- Track application status syncs

### Additional Features
- Activity/audit log table for tracking changes
- Tags/categories tables for flexible classification
- Email notifications tracking table
- File attachments table for storing resumes, etc.

---

## Sample Data Model Flows

### Flow 1: Staff logs outreach that leads to job posting
1. Staff creates `outreach` record (status: 'attempted')
2. Contact responds → update `outreach` (status: 'responded')
3. Contact shares job opening → create `job_posting` (with `outreach_id` linked)
4. Delivery team shares with Builders → create `job_posting_builders` records

### Flow 2: Staff finds job posting independently
1. Staff creates `job_posting` record (source: 'job_board', no `outreach_id`)
2. Delivery team shares with Builders → create `job_posting_builders` records
3. Track Builder progress through status updates

### Flow 3: Admin views activity
- Query all `outreach` grouped by `staff_user_id` for activity metrics
- Query all `job_postings` with JOIN to `users` for sourcing metrics
- Query `job_posting_builders` for Builder placement progress

