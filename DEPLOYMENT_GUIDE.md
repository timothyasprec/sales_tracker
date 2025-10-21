# Sales Tracker - Deployment Guide

This guide will help you deploy the Sales Tracker application with seed data to various platforms.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Deployment](#local-deployment)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)
5. [Production Deployment](#production-deployment)
6. [Deployment Platforms](#deployment-platforms)

---

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**
- **npm** or **yarn**

---

## Local Deployment

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd sales_tracker
```

### 2. Install Dependencies

#### Backend (Server)
```bash
cd sales-tracker-server
npm install
```

#### Frontend (Client)
```bash
cd ../sales-tracker-client
npm install
```

---

## Database Setup

### Option 1: Fresh Database Setup (Recommended for First Time)

1. **Create the PostgreSQL database:**

```bash
psql -U postgres
```

```sql
CREATE DATABASE sales_tracker;
\q
```

2. **Run the schema to create tables:**

```bash
cd sales-tracker-server
psql -U postgres -d sales_tracker -f db/schema.sql
```

3. **Seed the database with sample data:**

```bash
psql -U postgres -d sales_tracker -f db/seed.sql
```

**Note:** The seed file includes placeholder password hashes. You'll need to update these or register users through the app.

### Option 2: Using npm Scripts (Automated)

Add these scripts to your `sales-tracker-server/package.json`:

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "db:setup": "psql -U postgres -d sales_tracker -f db/schema.sql",
    "db:seed": "psql -U postgres -d sales_tracker -f db/seed.sql",
    "db:reset": "psql -U postgres -d sales_tracker -f db/schema.sql && psql -U postgres -d sales_tracker -f db/seed.sql"
  }
}
```

Then run:

```bash
npm run db:setup    # Create tables
npm run db:seed     # Add seed data
npm run db:reset    # Drop and recreate everything
```

### Updating User Passwords

The seed file has placeholder password hashes. To generate real bcrypt hashes:

```bash
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('password123', 10));"
```

Copy the output and replace the password hashes in `db/seed.sql`.

---

## Environment Variables

### Backend (.env)

Create `.env` in `sales-tracker-server/`:

```env
# Server Configuration
PORT=4001
NODE_ENV=production

# Database Configuration (PostgreSQL)
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=sales_tracker
PG_USER=postgres
PG_PASSWORD=your_secure_password

# JWT Authentication
SECRET=your-very-secure-random-secret-key-change-this

# Auto-Admin Emails (comma-separated)
ADMIN_EMAILS=admin@pursuit.org,your-email@pursuit.org

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# LinkedIn Scraping Credentials (Optional)
LINKEDIN_EMAIL=your-email@pursuit.org
LINKEDIN_PASSWORD=your-secure-password
```

### Frontend (.env)

Create `.env` in `sales-tracker-client/`:

```env
VITE_API_URL=https://your-backend-domain.com
```

**Important:** For production, generate a strong SECRET key:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Production Deployment

### Build the Frontend

```bash
cd sales-tracker-client
npm run build
```

This creates a `dist/` folder with optimized static files.

### Start the Backend

```bash
cd sales-tracker-server
NODE_ENV=production node app.js
```

---

## Deployment Platforms

### 1. Render (Recommended - Easy & Free Tier)

#### Backend Deployment

1. **Go to [Render.com](https://render.com)** and sign up
2. **Create a New PostgreSQL Database**:
   - Click "New +" → "PostgreSQL"
   - Name: `sales-tracker-db`
   - Choose free tier
   - Copy the connection details

3. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your Git repository
   - Settings:
     - **Name**: `sales-tracker-server`
     - **Environment**: `Node`
     - **Build Command**: `cd sales-tracker-server && npm install`
     - **Start Command**: `cd sales-tracker-server && node app.js`
     - **Environment Variables**: Add all from your `.env` file

4. **Run Database Setup**:
   After deployment, go to Render dashboard → Shell:
   ```bash
   cd sales-tracker-server
   psql $DATABASE_URL -f db/schema.sql
   psql $DATABASE_URL -f db/seed.sql
   ```

#### Frontend Deployment

1. **Create a New Static Site**:
   - Click "New +" → "Static Site"
   - Connect your Git repository
   - Settings:
     - **Name**: `sales-tracker-client`
     - **Build Command**: `cd sales-tracker-client && npm install && npm run build`
     - **Publish Directory**: `sales-tracker-client/dist`
     - **Environment Variables**:
       - `VITE_API_URL` = `https://your-backend-url.onrender.com`

### 2. Heroku

#### Backend

```bash
cd sales-tracker-server

# Login to Heroku
heroku login

# Create app
heroku create sales-tracker-server

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SECRET=your-secret-key
heroku config:set FRONTEND_URL=https://your-frontend.com
heroku config:set ADMIN_EMAILS=admin@pursuit.org

# Deploy
git subtree push --prefix sales-tracker-server heroku main

# Run database setup
heroku run bash
psql $DATABASE_URL -f db/schema.sql
psql $DATABASE_URL -f db/seed.sql
```

#### Frontend

```bash
cd sales-tracker-client

# Build
npm run build

# Deploy to Netlify or Vercel (easier than Heroku for static sites)
```

### 3. Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Create New Project**
3. **Add PostgreSQL** plugin
4. **Deploy from GitHub**:
   - Select repository
   - Set root directory to `sales-tracker-server`
   - Add environment variables
5. **Run migrations** via Railway dashboard shell

### 4. DigitalOcean App Platform

1. **Create App**
2. **Add Component** → Web Service
   - Source: GitHub repository
   - Build Command: `cd sales-tracker-server && npm install`
   - Run Command: `cd sales-tracker-server && node app.js`
3. **Add Database** → PostgreSQL
4. **Set Environment Variables**
5. **Deploy**

### 5. AWS (Advanced)

- **EC2** for backend
- **RDS PostgreSQL** for database
- **S3 + CloudFront** for frontend
- See AWS deployment guides for detailed steps

---

## Post-Deployment Checklist

- [ ] Database is created and running
- [ ] Schema tables are created (`db/schema.sql`)
- [ ] Seed data is loaded (`db/seed.sql`)
- [ ] Environment variables are set correctly
- [ ] Backend is running and accessible
- [ ] Frontend is built and deployed
- [ ] CORS is configured (Frontend URL in backend `.env`)
- [ ] Test user registration and login
- [ ] Test creating leads, builders, and job postings
- [ ] Verify Activity Feed is working
- [ ] Test CSV export functionality

---

## Default Seed Data

The seed file includes:

- **5 Users**: Admin + 4 staff members
- **5 Builders**: With various job search statuses
- **5 Outreach Leads**: Different stages and companies
- **5 Job Postings**: Various experience levels and sectors
- **7 Job-Builder Matches**: Sample applications and shares
- **8 Activities**: Recent activity feed entries

### Default Login (After Updating Passwords)

You'll need to either:
1. Update the password hashes in `seed.sql` with real bcrypt hashes, OR
2. Register new users through the app's registration page

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
psql -U postgres -d sales_tracker -c "SELECT 1;"

# Check environment variables
echo $DATABASE_URL
```

### CORS Errors

Make sure `FRONTEND_URL` in backend `.env` matches your actual frontend URL.

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Maintenance

### Backup Database

```bash
pg_dump -U postgres sales_tracker > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql -U postgres -d sales_tracker < backup_20251020.sql
```

### Update Seed Data

Edit `db/seed.sql` and re-run:

```bash
psql -U postgres -d sales_tracker -f db/seed.sql
```

---

## Support

For issues or questions:
- Check the [README.md](README.md) for project documentation
- Review server logs for error messages
- Check browser console for frontend errors

---

**Happy Deploying! 🚀**
