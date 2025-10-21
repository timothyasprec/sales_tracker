# Sales Tracker - Quick Start Guide

Get your Sales Tracker application up and running in 5 minutes!

## Prerequisites

- Node.js v18+
- PostgreSQL 14+
- Terminal access

---

## Quick Setup (Local Development)

### 1. Install Dependencies

```bash
# Install backend dependencies
cd sales-tracker-server
npm install

# Install frontend dependencies
cd ../sales-tracker-client
npm install
```

### 2. Setup Database

From the `sales-tracker-server` directory:

```bash
# Create database, tables, and seed data (all in one command)
npm run db:init
```

**OR** do it manually step-by-step:

```bash
# Step 1: Create the database
npm run db:create

# Step 2: Create tables
npm run db:setup

# Step 3: Add sample data
npm run db:seed
```

### 3. Configure Environment

The default `.env` file should work for local development, but verify:

```bash
cd sales-tracker-server
cat .env
```

Ensure these values are set:
```env
PG_DATABASE=sales_tracker
PG_USER=postgres
PG_PASSWORD=admin
PORT=4001
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd sales-tracker-server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd sales-tracker-client
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4001

---

## First Login

Since the seed data has placeholder passwords, you'll need to:

**Option 1: Register a New User**
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Register with an email matching `ADMIN_EMAILS` in `.env` to get admin access

**Option 2: Update Seed Passwords**
1. Generate a password hash:
   ```bash
   node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('password123', 10));"
   ```
2. Copy the hash
3. Edit `db/seed.sql` and replace password hashes
4. Re-run: `npm run db:seed`
5. Login with: `admin@pursuit.org` / `password123`

---

## What's Included in Seed Data?

- **5 Staff Users** (Sarah, Michael, Emily, David + Admin)
- **5 Builders** with different job search statuses
- **5 Outreach Leads** in various stages
- **5 Job Postings** with different experience levels
- **7 Job-Builder Matches** (applications and shares)
- **8 Recent Activities** for the activity feed

---

## Available npm Scripts

### Backend (sales-tracker-server)

```bash
npm run dev          # Start dev server with auto-reload
npm start            # Start production server
npm run db:init      # Create DB + tables + seed data
npm run db:create    # Create database
npm run db:setup     # Create tables only
npm run db:seed      # Add seed data only
npm run db:reset     # Drop tables and re-seed
```

### Frontend (sales-tracker-client)

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Testing the Application

### 1. Test User Registration
- Navigate to http://localhost:5173
- Register a new user
- Verify login works

### 2. Test Core Features
- ✅ View Overview Dashboard
- ✅ Browse All Leads
- ✅ View Job Postings
- ✅ Add a new lead
- ✅ Update lead status
- ✅ Export to CSV

### 3. Check Sample Data
- **All Leads**: Should see 5 sample companies
- **Job Postings**: Should see 5 sample jobs
- **Overview**: Metrics should show totals

---

## Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1;"

# If not running, start it
# macOS (Postgres.app):
# Start Postgres.app

# Linux:
sudo service postgresql start

# Windows:
# Start PostgreSQL service from Services
```

### Port Already in Use

```bash
# Change PORT in sales-tracker-server/.env
PORT=4002

# Frontend auto-detects available port
```

### "Cannot find module" Error

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Already Exists Error

```bash
# Just run setup (skip create)
npm run db:reset
```

---

## Next Steps

1. **Customize Data**: Edit `db/seed.sql` with your own sample data
2. **Deploy**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production deployment
3. **Invite Team**: Add team members through the registration page

---

## Quick Reference

### Database
- **Database Name**: `sales_tracker`
- **Default User**: `postgres`
- **Schema File**: `sales-tracker-server/db/schema.sql`
- **Seed File**: `sales-tracker-server/db/seed.sql`

### Endpoints
- **Frontend Dev**: http://localhost:5173
- **Backend Dev**: http://localhost:4001
- **API Health**: http://localhost:4001/api/health

### Key Features
- User authentication with JWT
- Lead tracking and management
- Job posting management
- Builder profiles
- Activity feed
- CSV export
- Search and filters

---

## Need Help?

- See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment steps
- Check server logs: `cd sales-tracker-server && npm run dev`
- Check browser console for frontend errors

---

**You're all set! Start tracking those leads! 🚀**
