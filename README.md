# Sales Tracker Application

A full-stack sales outreach and job posting tracking application built for Pursuit staff to manage job sourcing activities and employer outreach.

## Overview

The Sales Tracker Application provides two defined pathways for tracking:
1. **Contact Outreach** - Track staff-driven employer outreach activities
2. **Job Postings** - Log and manage relevant job opportunities for Builders

## Tech Stack

### Backend (`sales-tracker-server`)
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt
- **API**: RESTful endpoints with proper error handling

### Frontend (`sales-tracker-client`)
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: CSS with BEM naming conventions
- **State Management**: React Context API

## Project Structure

```
Sales Tracker Application/
├── sales-tracker-server/      # Backend API
│   ├── app.js                  # Main server entry point
│   ├── db/                     # Database configuration
│   ├── routes/                 # API routes
│   ├── controllers/            # Business logic
│   ├── queries/                # Database queries
│   ├── middleware/             # Auth & validation middleware
│   └── .env.example            # Environment variables template
├── sales-tracker-client/      # Frontend React app
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── services/           # API service layer
│   │   ├── utils/              # Auth context & utilities
│   │   └── styles/             # BEM-styled CSS files
│   └── .env.example            # Environment variables template
└── database-schema.md          # Database schema documentation

```

## Features

### For Staff Members
- ✅ Log and track contact outreach attempts
- ✅ Record job postings found through various sources
- ✅ View and edit their own outreach records
- ✅ View and edit their own job postings
- ✅ Update status and add notes to records

### For Admins (Leadership & PBC)
- ✅ View all staff outreach activity org-wide
- ✅ View all job postings sourced by staff
- ✅ Filter by staff member, status, or company
- ✅ Track trends and metrics across the organization

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn
- Git

### 1. Database Setup

1. Create a PostgreSQL database:
```bash
createdb sales_tracker
```

2. Run the SQL commands from `database-schema.md` to create tables:
```bash
psql sales_tracker < database-schema.sql
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd sales-tracker-server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` with your database credentials:
```env
PORT=4001
NODE_ENV=development
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=sales_tracker
PG_USER=your_username
PG_PASSWORD=your_password
SECRET=your-very-secure-jwt-secret-key
FRONTEND_URL=http://localhost:5173
```

5. Start the development server:
```bash
npm run dev
```

The backend will be running at `http://localhost:4001`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd sales-tracker-client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env`:
```env
VITE_API_URL=http://localhost:4001
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

## Usage

### First Time Setup

1. Open your browser to `http://localhost:5173`
2. Click "Register" to create your first account
3. First user should be created as admin (modify in database if needed)
4. Login with your credentials

### Creating Records

**Staff View:**
- Navigate to "Contact Outreach" tab to log employer outreach
- Navigate to "Job Postings" tab to log job opportunities
- Click "+ Log Outreach" or "+ Log Job Posting"
- Fill in the form and submit

**Admin View:**
- Click "Admin View" button in header
- Use filters to find specific records
- View all staff activity org-wide

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Outreach
- `GET /api/outreach` - Get all outreach records
- `GET /api/outreach/:id` - Get outreach by ID
- `POST /api/outreach` - Create new outreach
- `PUT /api/outreach/:id` - Update outreach
- `DELETE /api/outreach/:id` - Delete outreach

### Job Postings
- `GET /api/job-postings` - Get all job postings
- `GET /api/job-postings/:id` - Get job posting by ID
- `POST /api/job-postings` - Create new job posting
- `PUT /api/job-postings/:id` - Update job posting
- `DELETE /api/job-postings/:id` - Delete job posting
- `POST /api/job-postings/:id/builders` - Add Builder to job posting
- `GET /api/job-postings/:id/builders` - Get Builders for job posting

## Development Guidelines

This project follows the engineering best practices outlined in `cursor.md`:

1. **BEM Naming**: All CSS uses Block Element Modifier naming
2. **One File at a Time**: Changes are made systematically
3. **Git Workflow**: Feature branches and descriptive commits
4. **Code Quality**: Self-documenting code with clear variable names
5. **Security**: Environment variables, JWT authentication, parameterized queries

## Future Enhancements

- [ ] Salesforce integration for opportunity creation
- [ ] AI Native tool integration for application tracking
- [ ] LinkedIn scraping for contact/job information
- [ ] Email notifications for status changes
- [ ] Export functionality (CSV/Excel)
- [ ] Advanced analytics and reporting dashboard
- [ ] Builder management system integration

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes following the cursor.md guidelines
3. Commit with descriptive messages: `git commit -m "Add feature description"`
4. Push your branch: `git push origin feature/your-feature-name`
5. Create a Pull Request

## Troubleshooting

### Backend won't start
- Verify PostgreSQL is running
- Check `.env` file has correct database credentials
- Ensure port 4001 is available

### Frontend won't connect to backend
- Verify backend is running on port 4001
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

### Database errors
- Ensure database tables are created using schema
- Verify database user has proper permissions
- Check PostgreSQL logs for detailed errors

## License

This project is proprietary and confidential.

## Contact

For questions or support, contact the Pursuit technical team.

