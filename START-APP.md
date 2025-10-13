# 🚀 Quick Start Guide

## ✅ Setup Complete!

Your Sales Tracker Application is ready to use!

### What's Been Done:
- ✅ PostgreSQL installed and running
- ✅ Database `sales_tracker` created
- ✅ All 4 tables created (users, outreach, job_postings, job_posting_builders)
- ✅ Backend .env configured
- ✅ Frontend .env configured

---

## 🎯 Start the Application

### Option 1: Using Two Terminal Windows (Recommended)

**Terminal 1 - Backend:**
```bash
cd "/Users/timothyasprec/Desktop/Sales Tracker Application/sales-tracker-server"
npm run dev
```
You should see:
- `Server listening on port 4001`
- `Database connected successfully`

**Terminal 2 - Frontend:**
```bash
cd "/Users/timothyasprec/Desktop/Sales Tracker Application/sales-tracker-client"
npm run dev
```
You should see:
- `VITE vX.X.X ready in XXX ms`
- `Local: http://localhost:5173/`

---

## 🌐 Access the Application

1. **Open your browser to:** `http://localhost:5173`

2. **Register your first user:**
   - Click "Register here"
   - Fill in:
     - Full Name: Your Name
     - Email: your-email@example.com
     - Password: (min 6 characters)
   - Click "Register"

3. **Make yourself an admin (optional):**
   ```bash
   /opt/homebrew/opt/postgresql@14/bin/psql sales_tracker -c "UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';"
   ```
   Then logout and login again.

---

## 🎮 Using the Application

### As Staff Member:
1. **Log Outreach:**
   - Click "Contact Outreach" tab
   - Click "+ Log Outreach"
   - Fill in company, contact details, date
   - Select status and add notes
   - Click "Create"

2. **Log Job Postings:**
   - Click "Job Postings" tab
   - Click "+ Log Job Posting"
   - Fill in company, job title, URL
   - Add location, salary, description
   - Click "Create"

3. **Edit/Delete:**
   - Click "Edit" on any card to modify
   - Click "Delete" to remove (with confirmation)

### As Admin:
1. Click "Admin View" button in header
2. View all org-wide outreach and job postings
3. Use filters:
   - Filter by staff member
   - Filter by status
   - Search by company name
4. Click "Clear Filters" to reset
5. Switch between "All Outreach" and "All Job Postings" tabs

---

## 🛑 Stop the Application

Press `Ctrl + C` in each terminal window running the servers.

---

## 📝 Database Access

To access the database directly:
```bash
/opt/homebrew/opt/postgresql@14/bin/psql sales_tracker
```

Useful commands:
```sql
-- View all users
SELECT id, name, email, role FROM users;

-- View outreach stats
SELECT status, COUNT(*) FROM outreach GROUP BY status;

-- View job posting stats
SELECT status, COUNT(*) FROM job_postings GROUP BY status;

-- Make a user an admin
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

-- Exit psql
\q
```

---

## 🔧 Troubleshooting

### Backend won't start:
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Restart PostgreSQL if needed
brew services restart postgresql@14
```

### Port already in use:
```bash
# Find and kill process on port 4001 (backend)
lsof -ti:4001 | xargs kill -9

# Find and kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Database connection errors:
- Check `.env` file in sales-tracker-server
- Verify PG_USER matches your Mac username
- PG_PASSWORD can be empty for local development

### Frontend can't connect to backend:
- Make sure backend is running (check Terminal 1)
- Verify you see "Server listening on port 4001"
- Check browser console (F12) for errors

---

## 📊 Your Application URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4001
- **Health Check:** http://localhost:4001/api/health

---

## 🎉 You're Ready!

Open http://localhost:5173 in your browser and start tracking!

For detailed documentation, see:
- `README.md` - Full documentation
- `SETUP-GUIDE.md` - Complete setup guide
- `database-schema.md` - Database details

