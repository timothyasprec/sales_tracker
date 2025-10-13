# Sales Tracker Server (Backend)

Backend API for the Sales Tracker Application built with Node.js, Express, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt
- **Environment**: dotenv

## Getting Started

### Prerequisites

- Node.js installed
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` file with your database credentials and JWT secret

4. Create the database tables (see `../database-schema.md` for SQL statements)

5. Run the development server:
```bash
npm run dev
```

The server will start on port 4001 (or the PORT specified in .env)

## Project Structure

```
sales-tracker-server/
├── app.js              # Main application entry point
├── db/
│   └── dbConfig.js     # Database connection configuration
├── routes/             # API route definitions
├── controllers/        # Business logic for routes
├── queries/            # Database queries
├── middleware/         # Custom middleware (auth, validation, etc.)
└── .env.example        # Environment variables template
```

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
- `POST /api/outreach` - Create new outreach record
- `PUT /api/outreach/:id` - Update outreach record
- `DELETE /api/outreach/:id` - Delete outreach record

### Job Postings
- `GET /api/job-postings` - Get all job postings
- `GET /api/job-postings/:id` - Get job posting by ID
- `POST /api/job-postings` - Create new job posting
- `PUT /api/job-postings/:id` - Update job posting
- `DELETE /api/job-postings/:id` - Delete job posting
- `POST /api/job-postings/:id/builders` - Add Builder to job posting
- `GET /api/job-postings/:id/builders` - Get Builders for job posting

## Development

- Run in development mode: `npm run dev` (uses nodemon for auto-restart)
- Run in production mode: `npm start`

## Environment Variables

See `.env.example` for required environment variables.

## Database Schema

Refer to `../database-schema.md` for detailed database schema and SQL create statements.

