# Sales Tracker Application - Technical Breakdown

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Structure](#frontend-structure)
6. [Backend Structure](#backend-structure)
7. [Data Flow](#data-flow)
8. [Dynamic vs Static Elements](#dynamic-vs-static-elements)
9. [Key Features Implemented](#key-features-implemented)
10. [File Structure](#file-structure)
11. [Authentication & Authorization](#authentication--authorization)

---

## Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  (Port 5173 - Vite Development Server)                  │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Overview │  │All Leads │  │ Builders │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Requests (Fetch API)
                     │ JWT Token Auth
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Express.js Backend (API)                    │
│           (Port 5001 - Node.js Server)                   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Controllers  │  │   Routes     │  │   Queries    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     │ SQL Queries (pg library)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database                         │
│           (Local: sales_tracker)                         │
│                                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │ users  │  │outreach│  │builders│  │activity│       │
│  └────────┘  └────────┘  └────────┘  └────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Authentication**: JWT tokens stored in localStorage
- **HTTP Client**: Native Fetch API
- **Styling**: Custom CSS with BEM naming convention
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database Driver**: node-postgres (pg)
- **Authentication**: bcrypt + JWT (jsonwebtoken)
- **Middleware**: cors, express.json
- **Environment**: dotenv for configuration

### Database
- **RDBMS**: PostgreSQL
- **Connection**: Direct connection via pg Pool
- **Schema Management**: SQL migration files

---

## Database Schema

### 1. `users` Table
**Purpose**: Store user accounts and authentication data

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes**: 
- Primary key on `id`
- Unique index on `email`

**Roles**: `'admin'`, `'staff'`

---

### 2. `outreach` Table
**Purpose**: Store contact leads (companies, contacts, relationships)

```sql
CREATE TABLE outreach (
  id SERIAL PRIMARY KEY,
  staff_user_id INTEGER NOT NULL REFERENCES users(id),
  contact_method VARCHAR(100),
  company_name VARCHAR(255),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  linkedin_url TEXT,
  source VARCHAR(100),
  stage VARCHAR(100),
  lead_temperature VARCHAR(50),
  lead_type VARCHAR(50) DEFAULT 'contact',
  ownership VARCHAR(255),
  notes TEXT,
  next_steps TEXT,
  aligned_sector TEXT,
  job_title VARCHAR(255),
  job_posting_url TEXT,
  experience_level VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Fields**:
- `lead_type`: 'contact' (main leads) or 'job_posting' (deprecated, moved to job_postings table)
- `lead_temperature`: 'hot', 'warm', 'cold'
- `stage`: Current stage in pipeline
- `aligned_sector`: JSON string array of sectors
- `notes`: Historical update log with timestamps
- `ownership`: Name of staff member who owns this lead

**Indexes**:
- `idx_outreach_company` on company_name
- `idx_outreach_stage` on stage
- `idx_outreach_ownership` on ownership

---

### 3. `builders` Table
**Purpose**: Store Pursuit builders/fellows information

```sql
CREATE TABLE builders (
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
  aligned_sector TEXT,
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
```

**Key Fields**:
- `job_search_status`: 'building_resume', 'ready_to_apply', 'actively_applying', 'interviewing', 'offer_hired', 'paused'
- `ownership`: Name of staff member who created this builder
- `aligned_sector`: JSON string array of sectors
- `notes`: Historical update log with timestamps
- Offer fields: Track placement details when builder gets hired

**Indexes**:
- `idx_builders_cohort` on cohort
- `idx_builders_status` on status
- `idx_builders_job_search_status` on job_search_status
- `idx_builders_ownership` on ownership

---

### 4. `job_postings` Table
**Purpose**: Store job postings separate from leads

```sql
CREATE TABLE job_postings (
  id SERIAL PRIMARY KEY,
  staff_user_id INTEGER NOT NULL REFERENCES users(id),
  company_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  job_url TEXT,
  source VARCHAR(50),
  experience_level VARCHAR(50),
  lead_temperature VARCHAR(50) DEFAULT 'cold',
  ownership VARCHAR(255),
  aligned_sector TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Fields**:
- `ownership`: Name of staff member who added this posting
- `aligned_sector`: JSON string array of sectors
- `job_url`: Link to the actual job posting

**Indexes**:
- `idx_job_postings_company` on company_name
- `idx_job_postings_created_at` on created_at DESC
- `idx_job_postings_ownership` on ownership

---

### 5. `activities` Table
**Purpose**: Activity log for all user actions

```sql
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
```

**Action Types**:
- `'added_lead'`, `'updated_lead'`, `'deleted_lead'`
- `'added_job_posting'`, `'deleted_job_posting'`
- `'added_builder'`, `'updated_builder'`
- `'completed_lead_task'`, `'completed_builder_task'`

**Indexes**:
- `idx_activities_created_at` on created_at DESC
- `idx_activities_action_type` on action_type

---

### 6. `cohorts` Table
**Purpose**: Track Pursuit cohorts

```sql
CREATE TABLE cohorts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Authentication Endpoints
**Base URL**: `http://localhost:5001/api`

#### POST `/auth/register`
**Purpose**: Create new user account  
**Auth Required**: No  
**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "staff"
}
```
**Response**:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "staff" }
}
```

#### POST `/auth/login`
**Purpose**: Authenticate user  
**Auth Required**: No  
**Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "token": "jwt_token_here",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "staff" }
}
```

---

### User Endpoints

#### GET `/users`
**Purpose**: Get all users (for ownership dropdowns)  
**Auth Required**: Yes  
**Response**:
```json
[
  { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "staff", "is_active": true }
]
```

---

### Outreach (Leads) Endpoints

#### GET `/outreach`
**Purpose**: Get all leads (filtered by ownership for staff, all for admin)  
**Auth Required**: Yes  
**Query Params**: `?_t=<timestamp>` (cache busting)  
**Response**:
```json
[
  {
    "id": 1,
    "company_name": "Tech Corp",
    "contact_name": "Jane Smith",
    "contact_email": "jane@techcorp.com",
    "stage": "Initial Contact",
    "lead_temperature": "warm",
    "ownership": "John Doe",
    "aligned_sector": "[\"Technology\", \"Healthcare\"]",
    "notes": "[10/15/2024] Initial outreach\n\n[10/16/2024] Follow-up email sent",
    "next_steps": "Schedule demo call",
    "created_at": "2024-10-15T10:00:00.000Z"
  }
]
```

#### POST `/outreach`
**Purpose**: Create new lead  
**Auth Required**: Yes  
**Body**:
```json
{
  "company_name": "Tech Corp",
  "contact_name": "Jane Smith",
  "contact_email": "jane@techcorp.com",
  "linkedin_url": "https://linkedin.com/in/janesmith",
  "source": "Personal Network",
  "stage": "Initial Contact",
  "lead_temperature": "warm",
  "ownership": "John Doe",
  "aligned_sector": ["Technology", "Healthcare"],
  "notes": "Met at conference",
  "next_steps": "Schedule demo call"
}
```

#### PUT `/outreach/:id`
**Purpose**: Update existing lead  
**Auth Required**: Yes  
**Body**: Same as POST (partial updates supported)

#### DELETE `/outreach/:id`
**Purpose**: Delete a lead  
**Auth Required**: Yes

---

### Job Posting Endpoints

#### GET `/job-postings`
**Purpose**: Get all job postings  
**Auth Required**: Yes  
**Response**:
```json
[
  {
    "id": 1,
    "company_name": "Tech Corp",
    "job_title": "Senior Software Engineer",
    "job_url": "https://techcorp.com/careers/123",
    "experience_level": "Senior",
    "ownership": "John Doe",
    "aligned_sector": "[\"Technology\"]",
    "created_at": "2024-10-15T10:00:00.000Z"
  }
]
```

#### POST `/job-postings`
**Purpose**: Create new job posting  
**Auth Required**: Yes

#### DELETE `/job-postings/:id`
**Purpose**: Delete a job posting  
**Auth Required**: Yes

---

### Builder Endpoints

#### GET `/builders`
**Purpose**: Get all builders  
**Auth Required**: Yes  
**Response**:
```json
[
  {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@pursuit.org",
    "cohort": "10.0",
    "role": "Full Stack Developer",
    "job_search_status": "actively_applying",
    "ownership": "John Doe",
    "aligned_sector": "[\"Technology\", \"Finance\"]",
    "skills": "React, Node.js, PostgreSQL",
    "created_at": "2024-10-15T10:00:00.000Z"
  }
]
```

#### POST `/builders`
**Purpose**: Create new builder  
**Auth Required**: Yes  
**Body**:
```json
{
  "name": "Alice Johnson",
  "email": "alice@pursuit.org",
  "cohort": "10.0",
  "role": "Full Stack Developer",
  "ownership": "John Doe",
  "aligned_sector": ["Technology", "Finance"],
  "skills": "React, Node.js, PostgreSQL",
  "job_search_status": "building_resume",
  "created_date": "2024-10-15"
}
```

#### PUT `/builders/:id`
**Purpose**: Update existing builder  
**Auth Required**: Yes

---

### Activity Endpoints

#### GET `/activities`
**Purpose**: Get activity log  
**Auth Required**: Yes  
**Response**:
```json
[
  {
    "id": 1,
    "user_name": "John Doe",
    "action_type": "added_lead",
    "entity_type": "lead",
    "entity_name": "Tech Corp",
    "details": {
      "company": "Tech Corp",
      "contact": "Jane Smith",
      "temperature": "warm"
    },
    "created_at": "2024-10-15T10:00:00.000Z"
  }
]
```

#### POST `/activities`
**Purpose**: Log new activity  
**Auth Required**: Yes

---

### Cohort Endpoints

#### GET `/builders/cohorts`
**Purpose**: Get all cohorts  
**Auth Required**: Yes

---

## Frontend Structure

### Pages (Routes)

#### 1. **Login** (`/login`)
- **File**: `src/pages/Login.jsx`
- **Purpose**: User authentication
- **Features**:
  - Email/password form
  - JWT token generation
  - Redirect to /overview on success
- **State**: Email, password, error message
- **API Calls**: POST `/auth/login`

#### 2. **Register** (`/register`)
- **File**: `src/pages/Register.jsx`
- **Purpose**: New user registration
- **Features**:
  - Name, email, password, role fields
  - Validation
  - Auto-login after registration
- **API Calls**: POST `/auth/register`

#### 3. **Overview Dashboard** (`/overview`)
- **File**: `src/pages/Overview.jsx`
- **Purpose**: Main dashboard with metrics and charts
- **Features**:
  - 4 metric cards (Total Leads, Job Postings, Active Builders, Hired)
  - Horizontal bar chart (Companies by Aligned Sector)
  - Pie chart (Top 5 Contributors - last 30 days)
  - Interactive drill-down modals
  - Click metric → See list
  - Click list item → See details
- **State**:
  - `metrics`: Object with all counts
  - `sectorData`: Array of sector data for chart
  - `contributorData`: Array of top 5 contributors
  - `activeModal`: Current modal type
  - `modalData`: Data for current modal
  - `detailView`: Nested detail view state
  - `modalHistory`: Navigation breadcrumb stack
- **API Calls**:
  - GET `/outreach` (for leads data)
  - GET `/job-postings` (for job postings data)
  - GET `/builders` (for builders data)
  - GET `/activities` (for activity data)
- **Dynamic Elements**:
  - All metrics calculated from live data
  - Charts render based on actual database records
  - Last 30 days filter applied dynamically
  - Bar colors calculated based on count (green=high, red=low)

#### 4. **All Leads** (`/leads`)
- **File**: `src/pages/AllLeads.jsx`
- **Purpose**: View and manage all leads
- **Layout**:
  - Main section (3/4 width): Contact leads in cards
  - Sidebar (1/4 width): Job postings list
- **Features**:
  - Search bar (company name, contact name)
  - Filter tabs (All, Hot, Warm, Cold)
  - Lead cards with:
    - Contact info
    - Stage and temperature badges
    - Next steps
    - View Details and Delete buttons
  - Modals:
    - Add New Lead (contact outreach only)
    - Update Lead Status
    - View Details (with edit capabilities)
  - Job Postings sidebar:
    - Add Job Posting button (sticky)
    - Scrollable list of jobs (past 2 months only)
    - Download CSV button
    - Delete individual postings
- **State**:
  - `leads`: Array of all leads
  - `filteredLeads`: Array after search/filter
  - `jobPostings`: Array of job postings
  - `staffMembers`: Array for ownership dropdown
  - `activeModal`: Current modal type
  - `selectedLead`: Lead being viewed/edited
  - `newLeadForm`: Form state for new lead
  - `updateLeadForm`: Form state for updates
- **API Calls**:
  - GET `/outreach`
  - POST `/outreach`
  - PUT `/outreach/:id`
  - DELETE `/outreach/:id`
  - GET `/job-postings`
  - POST `/job-postings`
  - DELETE `/job-postings/:id`
  - GET `/users` (for ownership dropdown)
  - POST `/activities` (logging)
- **Dynamic Elements**:
  - Lead cards render from database
  - Real-time search filtering
  - Temperature badge colors
  - Update history parsed from notes field
  - Next steps with day counter
  - Job postings filtered by date (last 2 months)

#### 5. **Builders** (`/builders`)
- **File**: `src/pages/Builders.jsx`
- **Purpose**: View and manage builders/fellows
- **Features**:
  - Search bar (name, role, skills)
  - Filter by cohort and status
  - Builder cards with:
    - Name and job search status
    - Role of interest
    - Matching companies (shared aligned sectors)
    - Update Profile button
  - Modal:
    - Add New Builder
    - Edit Builder Profile
    - Job Search Status bar (7 stages)
    - Offer Details form (when offer/hired)
    - Update History section
    - Next Steps with completion
- **State**:
  - `builders`: Array of all builders
  - `filteredBuilders`: Array after search/filter
  - `cohorts`: Array of cohorts
  - `leads`: Array (for matching companies)
  - `staffMembers`: Array for ownership dropdown
  - `selectedBuilder`: Builder being edited
  - `newBuilderForm`: Form state
- **API Calls**:
  - GET `/builders`
  - POST `/builders`
  - PUT `/builders/:id`
  - GET `/builders/cohorts`
  - GET `/outreach` (for matching)
  - GET `/users` (for ownership)
  - POST `/activities` (logging)
- **Dynamic Elements**:
  - Builder cards render from database
  - Job search status colors
  - Matching companies algorithm (aligned sectors)
  - Update history parsed from notes
  - Optimistic UI updates

#### 6. **Activity Feed** (`/activity`)
- **File**: `src/pages/ActivityFeed.jsx`
- **Purpose**: Show recent activity log
- **Features**:
  - Chronological list of all actions
  - Emojis for different action types
  - Section badges (Lead, Builder, Job Posting)
  - Celebration messages for milestones
  - Auto-refresh every 30 seconds
- **State**:
  - `activities`: Array of activity records
  - `loading`: Boolean
- **API Calls**:
  - GET `/activities`
- **Dynamic Elements**:
  - All content from database
  - Real-time updates via polling
  - Conditional rendering based on action_type

---

### Components

#### `ProtectedRoute.jsx`
**Purpose**: Wrap routes that require authentication  
**Logic**:
- Check localStorage for JWT token
- Check user role for admin routes
- Redirect to /login if unauthorized

#### `JobPostingList.jsx`
**Purpose**: Reusable component for job posting cards (not currently used in favor of inline rendering)

---

### Services

#### `api.js`
**Purpose**: Centralized API service layer  
**Features**:
- Base URL configuration
- JWT token management (from localStorage)
- Cache-busting headers
- Error handling
- Exports: `authAPI`, `userAPI`, `outreachAPI`, `jobPostingAPI`, `builderAPI`, `activityAPI`

**Example**:
```javascript
export const outreachAPI = {
  getAllOutreach: () => apiRequest('/outreach'),
  createOutreach: (data) => apiRequest('/outreach', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateOutreach: (id, data) => apiRequest(`/outreach/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteOutreach: (id) => apiRequest(`/outreach/${id}`, {
    method: 'DELETE'
  })
};
```

---

### Utils

#### `AuthContext.jsx`
**Purpose**: React Context for global authentication state  
**Provides**:
- `user`: Current user object
- `login(userData, token)`: Set user and token
- `logout()`: Clear user and token
- `isAuthenticated`: Boolean

**Usage**:
```javascript
const { user, logout } = useAuth();
```

#### `csvExport.js`
**Purpose**: Export data to CSV files  
**Functions**:
- `convertToCSV(data, headers)`: Convert array to CSV string
- `downloadCSV(csvContent, filename)`: Trigger browser download
- `exportJobPostingsToCSV(jobPostings, filename)`: Export job postings

---

## Backend Structure

### Server Entry (`app.js`)
```javascript
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const outreachRoutes = require('./routes/outreachRoutes');
const builderRoutes = require('./routes/builderRoutes');
const activityRoutes = require('./routes/activityRoutes');
const jobPostingRoutes = require('./routes/jobPostingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/outreach', outreachRoutes);
app.use('/api/builders', builderRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/job-postings', jobPostingRoutes);

// Server start
app.listen(5001, () => {
  console.log('Server running on port 5001');
});
```

---

### Middleware

#### `authMiddleware.js`
**Purpose**: Protect routes with JWT authentication

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### `adminMiddleware.js`
**Purpose**: Restrict routes to admin users only

---

### Controllers (Business Logic)

#### `authController.js`
- `register`: Hash password, create user, generate JWT
- `login`: Verify password, generate JWT

#### `userController.js`
- `getAllUsers`: Return all users (filtered by active status)
- `getUserById`: Return single user
- `updateUser`: Update user details
- `deleteUser`: Soft delete (set is_active = false)

#### `outreachController.js`
- `createOutreach`: Create new lead with ownership
- `getAllOutreach`: Get leads (admins see all, staff see own)
- `updateOutreach`: Update lead, append to notes with timestamp
- `deleteOutreach`: Delete lead

#### `builderController.js`
- `createBuilder`: Create new builder with ownership
- `getAllBuilders`: Get all builders
- `updateBuilder`: Update builder, append to notes
- `getAllCohorts`: Get cohort list

#### `jobPostingController.js`
- `createJobPosting`: Create new job posting
- `getAllJobPostings`: Get all job postings
- `deleteJobPosting`: Delete job posting

#### `activityController.js`
- `createActivity`: Log new activity
- `getAllActivities`: Get activity log

---

### Queries (Database Layer)

#### `builderQueries.js`
```javascript
const createBuilder = async (builderData) => {
  const { name, email, cohort, ownership, aligned_sector, ... } = builderData;
  
  const query = `
    INSERT INTO builders (name, email, cohort, ownership, aligned_sector, ...)
    VALUES ($1, $2, $3, $4, $5, ...)
    RETURNING *
  `;
  
  const values = [
    name,
    email,
    cohort,
    ownership || null,
    JSON.stringify(aligned_sector || []),
    ...
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};
```

**Pattern**: All query files follow this structure
- Accept data objects from controllers
- Build SQL queries with parameterized values ($1, $2, ...)
- Handle JSON serialization for arrays
- Return database results

---

## Data Flow

### Example: Creating a New Lead

```
┌──────────────────────────────────────────────────────┐
│ 1. User fills out "Add New Lead" form in AllLeads   │
│    - Company name: Tech Corp                         │
│    - Contact: Jane Smith                             │
│    - Ownership: John Doe (from dropdown)             │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 2. handleAddLead function called (AllLeads.jsx)     │
│    - Validates form data                             │
│    - Converts aligned_sector array to JSON string    │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 3. API call: outreachAPI.createOutreach(formData)   │
│    - Sends POST to /api/outreach                     │
│    - Includes JWT token in Authorization header      │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 4. Backend: authMiddleware validates JWT            │
│    - Extracts user from token                        │
│    - Attaches req.user = { id, name, email, role }   │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 5. outreachController.createOutreach()              │
│    - Receives formData + req.user                    │
│    - Adds staff_user_id from req.user.id             │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 6. outreachQueries.createOutreach()                 │
│    - Builds INSERT SQL query                         │
│    - Executes: pool.query(query, values)             │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 7. PostgreSQL inserts row into outreach table       │
│    - Auto-generates id                               │
│    - Sets created_at to NOW()                        │
│    - Returns: RETURNING *                            │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 8. Create activity log entry                        │
│    - activityAPI.createActivity()                    │
│    - action_type: 'added_lead'                       │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 9. Frontend receives success response                │
│    - Shows success message                           │
│    - Calls fetchData() to refresh leads list         │
│    - Closes modal                                    │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 10. UI updates                                       │
│     - New lead card appears in list                  │
│     - Activity Feed shows "added_lead" entry         │
│     - Overview dashboard counts update               │
└──────────────────────────────────────────────────────┘
```

---

### Example: Overview Dashboard Loading

```
┌──────────────────────────────────────────────────────┐
│ 1. User navigates to /overview                      │
│    - React Router renders Overview component         │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 2. useEffect runs on mount                          │
│    - Calls fetchMetrics()                            │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 3. Parallel API calls (Promise.all)                 │
│    - GET /api/outreach                               │
│    - GET /api/job-postings                           │
│    - GET /api/builders                               │
│    - GET /api/activities                             │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 4. Backend queries PostgreSQL                       │
│    - SELECT * FROM outreach                          │
│    - SELECT * FROM job_postings                      │
│    - SELECT * FROM builders                          │
│    - SELECT * FROM activities                        │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 5. Data processing in fetchMetrics()                │
│    - Filter last 30 days                             │
│    - Count total leads (contact type only)           │
│    - Count job postings                              │
│    - Count active builders                           │
│    - Count hired builders                            │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 6. Calculate chart data                             │
│    - Sector Data: Group leads by aligned_sector     │
│    - Sort sectors by count                           │
│    - Contributor Data: Aggregate by ownership        │
│    - Count leads + jobs + builders + updates         │
│    - Sort descending, take top 5                     │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 7. Update state with setState()                     │
│    - setMetrics({ totalLeads: X, ... })             │
│    - setSectorData([...])                            │
│    - setContributorData([...])                       │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 8. React re-renders with new data                   │
│    - Metric cards show calculated counts             │
│    - Bar chart renders with dynamic heights/colors   │
│    - Pie chart renders with calculated segments      │
│    - All interactive and clickable                   │
└──────────────────────────────────────────────────────┘
```

---

## Dynamic vs Static Elements

### Dynamic Elements (Data-Driven)

#### Overview Dashboard
- ✅ All 4 metric card counts
- ✅ Week-over-week comparison arrows
- ✅ Bar chart (sectors) - bar heights and colors
- ✅ Pie chart (contributors) - segment sizes and legend
- ✅ Modal content when clicking charts
- ✅ Nested detail views

#### All Leads
- ✅ Lead card list
- ✅ Search results
- ✅ Filter results (Hot/Warm/Cold)
- ✅ Temperature badges and colors
- ✅ Next steps content and day counter
- ✅ Update history timeline
- ✅ Job postings sidebar list
- ✅ Matching companies in modals
- ✅ Ownership dropdown options

#### Builders
- ✅ Builder card list
- ✅ Job search status badges and colors
- ✅ Matching companies display
- ✅ Update history
- ✅ Next steps with day counter
- ✅ Cohort filter options
- ✅ Ownership dropdown options

#### Activity Feed
- ✅ All activity items
- ✅ Timestamps
- ✅ Action type emojis
- ✅ Section badges
- ✅ Celebration messages

### Static Elements (Hardcoded)

#### UI Structure
- ❌ Navigation tabs (Overview, All Leads, Builders, Activity Feed)
- ❌ Page titles
- ❌ Form labels
- ❌ Button text
- ❌ Help text
- ❌ Modal titles
- ❌ Chart titles and subtitles

#### Form Options (Static Dropdowns)
- ❌ Aligned Sector options (Technology, Healthcare, Finance, Education, Nonprofit, Construction, Retail, Manufacturing, Other)
- ❌ Source options (Personal Network, Professional Network, Online/Research)
- ❌ Stage options (Initial Contact, Follow-up, Meeting Scheduled, Proposal Sent, Negotiation, Closed Won, Closed Lost)
- ❌ Lead Temperature options (Hot, Warm, Cold)
- ❌ Experience Level options (Entry, Mid, Senior, Lead, Executive)
- ❌ Job Search Status options (Building Resume, Ready to Apply, Actively Applying, Interviewing, Offer/Hired, Paused/On Hold)

#### Styling
- ❌ All CSS (colors, fonts, spacing, animations)
- ❌ Component layouts
- ❌ Responsive breakpoints

---

## Key Features Implemented

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (admin vs staff)
- Protected routes
- Persistent login (localStorage)
- Secure password hashing (bcrypt)

### 2. CRUD Operations
- **Leads**: Create, Read, Update, Delete
- **Job Postings**: Create, Read, Delete
- **Builders**: Create, Read, Update
- **Activity Log**: Create, Read (audit trail)

### 3. Data Filtering & Search
- Text search (leads, builders)
- Filter by temperature (leads)
- Filter by cohort (builders)
- Filter by status (builders)
- Date range filtering (last 30 days for charts, last 2 months for job postings)

### 4. Data Visualization
- Metric cards with counts and trends
- Horizontal bar chart with color gradient
- Pie chart with interactive segments
- Drill-down modals with breadcrumb navigation

### 5. Data Export
- CSV export for job postings
- Formatted date and sector data

### 6. Real-Time Updates
- Optimistic UI updates (immediate feedback)
- Activity feed polling (30 seconds)
- Cache busting to prevent stale data

### 7. Historical Tracking
- Update history with timestamps
- Notes append pattern (never overwrite)
- Activity log for all actions
- Audit trail

### 8. Ownership & Attribution
- All entities track who created them
- Top 5 Contributors chart
- Filter by ownership (staff see own data)

### 9. Next Steps Management
- Track next actions needed
- Day counter since creation
- Mark as completed
- Append to history when completed

### 10. Advanced Modal System
- Nested navigation (3 levels deep)
- Back button navigation
- Detail views for all entity types
- Inline editing capabilities

### 11. Matching Algorithm
- Builders show matching companies
- Based on aligned sectors
- Up to 5 most recent matches

### 12. Date Selection
- Custom date picker for backdating
- Historical data entry
- Accurate timeline tracking

---

## File Structure

```
Sales Tracker Application/
├── sales-tracker-client/          # React Frontend
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   │   ├── JobPostingList.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/                 # Route components
│   │   │   ├── ActivityFeed.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AllLeads.jsx
│   │   │   ├── Builders.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Overview.jsx
│   │   │   ├── QuickActions.jsx   # Deprecated
│   │   │   ├── Register.jsx
│   │   │   └── UserManagement.jsx
│   │   ├── services/              # API layer
│   │   │   └── api.js
│   │   ├── styles/                # CSS files
│   │   │   ├── ActivityFeed.css
│   │   │   ├── AllLeads.css
│   │   │   ├── Builders.css
│   │   │   ├── Dashboard.css
│   │   │   ├── Login.css
│   │   │   ├── Overview.css
│   │   │   └── QuickActions.css
│   │   ├── utils/                 # Utilities
│   │   │   ├── AuthContext.jsx
│   │   │   └── csvExport.js
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── sales-tracker-server/          # Express Backend
│   ├── controllers/               # Business logic
│   │   ├── activityController.js
│   │   ├── authController.js
│   │   ├── builderController.js
│   │   ├── jobPostingController.js
│   │   ├── outreachController.js
│   │   └── userController.js
│   ├── middleware/                # Request middleware
│   │   ├── adminMiddleware.js
│   │   └── authMiddleware.js
│   ├── queries/                   # Database queries
│   │   ├── activityQueries.js
│   │   ├── builderQueries.js
│   │   ├── jobPostingQueries.js
│   │   ├── outreachQueries.js
│   │   └── userQueries.js
│   ├── routes/                    # API routes
│   │   ├── activityRoutes.js
│   │   ├── authRoutes.js
│   │   ├── builderRoutes.js
│   │   ├── jobPostingRoutes.js
│   │   ├── outreachRoutes.js
│   │   └── userRoutes.js
│   ├── config/                    # Configuration
│   │   └── database.js
│   ├── .env                       # Environment variables
│   ├── app.js                     # Server entry point
│   └── package.json
│
├── SQL Migration Files/           # Database schema
│   ├── create_tables.sql
│   ├── alter_outreach_table.sql
│   ├── fix_outreach_table.sql
│   ├── add_next_steps_column.sql
│   ├── add_builder_next_steps.sql
│   ├── add_builder_job_status.sql
│   ├── add_builder_ownership.sql
│   ├── create_job_postings_table.sql
│   └── update_job_postings_table.sql
│
└── Documentation Files/
    ├── PROJECT-SUMMARY.md
    ├── TECHNICAL-BREAKDOWN.md   # This file
    ├── CLEANUP-INSTRUCTIONS.md
    └── FORMS-READY.md
```

---

## Authentication & Authorization

### JWT Token Flow

1. **User logs in**:
   - POST `/api/auth/login` with email + password
   - Server verifies credentials
   - Server generates JWT token with payload: `{ id, name, email, role }`
   - Token returned to client

2. **Client stores token**:
   - Saved in `localStorage.setItem('token', token)`
   - Saved in AuthContext state

3. **Subsequent requests**:
   - Client includes token in Authorization header: `Bearer <token>`
   - Server middleware (`authMiddleware.js`) validates token
   - Decoded user info attached to `req.user`

4. **Authorization checks**:
   - Admin routes check `req.user.role === 'admin'`
   - Ownership filtering: Staff see only their own data (except reads)

### Security Measures
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens expire (configurable in SECRET)
- CORS enabled for localhost:5173
- SQL injection prevented via parameterized queries
- XSS prevented via React's built-in escaping

---

## Environment Variables

### Frontend (`.env` in `sales-tracker-client/`)
```
VITE_API_URL=http://localhost:5001/api
```

### Backend (`.env` in `sales-tracker-server/`)
```
PG_HOST=localhost
PG_DATABASE=sales_tracker
PG_USER=timothyasprec
PG_PASSWORD=admin
PG_PORT=5432
SECRET=your_jwt_secret_key
PORT=5001
```

---

## Cache Busting Strategy

### Problem
Browsers cache GET requests, causing stale data issues.

### Solution
1. **HTTP Headers**:
   ```javascript
   'Cache-Control': 'no-cache, no-store, must-revalidate',
   'Pragma': 'no-cache',
   'Expires': '0'
   ```

2. **Timestamp Query Parameter**:
   ```javascript
   const timestamp = Date.now();
   fetch(`/api/builders?_t=${timestamp}`);
   ```

3. **React State Management**:
   - Clear state before setting new data
   - Use setTimeout(0) to force re-render
   - Change component keys when data updates

---

## Performance Optimizations

1. **Parallel API Calls**: Use `Promise.all()` for concurrent requests
2. **Indexed Database Fields**: All foreign keys and frequently filtered fields
3. **Pagination Ready**: Structure supports offset/limit (not implemented yet)
4. **Optimistic UI**: Update UI before server response for better UX
5. **Conditional Rendering**: Only render visible modals/sections
6. **Lazy Loading**: React Router code-splitting ready

---

## Known Limitations & Future Enhancements

### Current Limitations
- No pagination (all data loaded at once)
- No real-time updates (uses polling for activity feed)
- No file uploads (attachments, resumes)
- No email notifications
- No data export for builders/leads (only job postings)
- No advanced search (regex, multi-field)
- No data visualization for trends over time

### Potential Enhancements
1. WebSocket integration for real-time updates
2. Email notifications for next steps and deadlines
3. Advanced analytics (trends, forecasting)
4. Bulk operations (import CSV, bulk edit)
5. File attachments (resumes, contracts)
6. Calendar integration for next steps
7. Mobile responsive design improvements
8. Offline support (Service Worker)
9. Multi-language support (i18n)
10. Dark mode

---

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation Steps

1. **Clone repository**
2. **Install dependencies**:
   ```bash
   # Frontend
   cd sales-tracker-client
   npm install
   
   # Backend
   cd ../sales-tracker-server
   npm install
   ```

3. **Setup PostgreSQL database**:
   ```bash
   createdb sales_tracker
   psql -d sales_tracker -f create_tables.sql
   # Run all migration files in order
   ```

4. **Configure environment variables**:
   - Create `.env` files in both client and server directories
   - Copy example values from above

5. **Start development servers**:
   ```bash
   # Backend (Terminal 1)
   cd sales-tracker-server
   npm start
   
   # Frontend (Terminal 2)
   cd sales-tracker-client
   npm run dev
   ```

6. **Access application**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5001

---

## Deployment Considerations

### Frontend
- Build: `npm run build` → creates `dist/` folder
- Serve via Nginx, Apache, or Vercel/Netlify
- Update `VITE_API_URL` to production API URL

### Backend
- Use PM2 or similar for process management
- Set NODE_ENV=production
- Use HTTPS (SSL certificate)
- Configure CORS for production domain
- Use connection pooling for PostgreSQL

### Database
- Use managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)
- Set up automatic backups
- Configure SSL for database connections
- Use environment-specific databases (dev, staging, prod)

---

## Testing Strategy (Not Implemented)

### Recommended Testing
1. **Unit Tests**: Controllers, queries, utilities
2. **Integration Tests**: API endpoints
3. **E2E Tests**: User flows (Cypress, Playwright)
4. **Load Tests**: Performance under stress

---

## Summary

This Sales Tracker Application is a full-stack CRUD application with:
- **React frontend** with dynamic data visualization
- **Express.js backend** with RESTful API
- **PostgreSQL database** with relational data
- **JWT authentication** and role-based authorization
- **Activity logging** for audit trail
- **Interactive charts** with drill-down capabilities
- **Ownership tracking** for team accountability
- **Historical updates** with timestamp tracking

**Dynamic**: All data (leads, builders, metrics, charts, activity feed)  
**Static**: UI structure, form options, styling

**Total Files**: ~50 files  
**Total Lines of Code**: ~15,000 lines

**Development Time**: Built incrementally with iterative improvements based on user feedback.

