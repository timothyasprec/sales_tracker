# Sales Tracker Application - Quick Setup Guide

## ✅ What's Been Built

Your Sales Tracker Application is complete with:

### Backend (sales-tracker-server)
- ✅ Express.js server with RESTful API
- ✅ PostgreSQL database integration
- ✅ JWT authentication with bcrypt
- ✅ Full CRUD operations for outreach and job postings
- ✅ Admin authorization middleware
- ✅ Proper error handling

### Frontend (sales-tracker-client)
- ✅ React + Vite application
- ✅ Login & Registration pages
- ✅ Staff Dashboard with two pathways:
  - Contact Outreach tracking
  - Job Posting management
- ✅ Admin Dashboard with filtering and org-wide view
- ✅ All CSS using BEM naming conventions
- ✅ Responsive design

### Database Schema
- ✅ 4 tables: users, outreach, job_postings, job_posting_builders
- ✅ Proper relationships and indexes
- ✅ Status tracking for both pathways

## 🚀 Next Steps to Get Running

### Step 1: Set Up PostgreSQL Database

1. Install PostgreSQL if you haven't already:
```bash
# On Mac:
brew install postgresql
brew services start postgresql
```

2. Create the database:
```bash
createdb sales_tracker
```

3. Create the tables using the SQL from `database-schema.md`:
```bash
# Open psql
psql sales_tracker

# Then copy and paste the CREATE TABLE statements from database-schema.md
# Or save the SQL to a file and run:
psql sales_tracker -f create_tables.sql
```

### Step 2: Configure Backend

1. Navigate to backend:
```bash
cd sales-tracker-server
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` with your actual credentials:
```env
PORT=4001
NODE_ENV=development

# Your PostgreSQL credentials
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=sales_tracker
PG_USER=your_username
PG_PASSWORD=your_password

# Generate a secure secret key
SECRET=your-super-secure-jwt-secret-min-32-chars

FRONTEND_URL=http://localhost:5173
```

4. Start the backend:
```bash
npm run dev
```

You should see: `Server listening on port 4001` and `Database connected successfully`

### Step 3: Configure Frontend

1. Open a NEW terminal and navigate to frontend:
```bash
cd sales-tracker-client
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. The default should work, but verify:
```env
VITE_API_URL=http://localhost:4001
```

4. Start the frontend:
```bash
npm run dev
```

You should see: `Local: http://localhost:5173/`

### Step 4: Create Your First User

1. Open browser to `http://localhost:5173`
2. Click "Register here"
3. Fill in your details:
   - Full Name: Your Name
   - Email: your-email@example.com
   - Password: (at least 6 characters)
4. Click "Register"

### Step 5: Make First User an Admin (Optional)

To give your user admin privileges:

```bash
psql sales_tracker
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
\q
```

Then logout and login again to see the "Admin View" button.

## 🎯 Testing the Application

### Test as Staff Member

1. **Log Outreach:**
   - Click "Contact Outreach" tab
   - Click "+ Log Outreach"
   - Fill in company name, date, and other details
   - Click "Create"
   - Verify it appears in your list

2. **Log Job Posting:**
   - Click "Job Postings" tab
   - Click "+ Log Job Posting"
   - Fill in company, job title, and details
   - Click "Create"
   - Verify it appears in your list

3. **Edit & Delete:**
   - Click "Edit" on any record
   - Modify some fields
   - Click "Update"
   - Try deleting a record

### Test as Admin

1. Click "Admin View" button
2. View all outreach records
3. Switch to "All Job Postings" tab
4. Test filters:
   - Filter by staff member
   - Filter by status
   - Search by company name
5. Click "Clear Filters"

## 📁 Project Structure

```
Sales Tracker Application/
├── sales-tracker-server/       Backend (Node.js + Express)
│   ├── app.js                  Main server file
│   ├── routes/                 API routes
│   ├── controllers/            Business logic
│   ├── queries/                Database queries
│   ├── middleware/             Auth middleware
│   └── db/                     Database config
├── sales-tracker-client/       Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/              Login, Dashboard, Admin
│   │   ├── components/         Forms, Lists, etc.
│   │   ├── services/           API calls
│   │   ├── styles/             BEM CSS files
│   │   └── utils/              Auth Context
│   └── .env
├── database-schema.md          Database documentation
├── PRD.md                      Product requirements
└── README.md                   Full documentation
```

## 🐛 Common Issues

### "Cannot connect to database"
- Make sure PostgreSQL is running: `brew services restart postgresql`
- Check your PG_* credentials in backend `.env`
- Verify database exists: `psql -l`

### "Port 4001 already in use"
- Change PORT in backend `.env` to 4002
- Update VITE_API_URL in frontend `.env` to match

### Frontend shows "Network Error"
- Make sure backend is running (check terminal)
- Verify VITE_API_URL in frontend `.env`
- Check browser console (F12) for CORS errors

### "Invalid token" errors
- Clear browser localStorage (F12 → Application → Local Storage → Clear)
- Re-login

## 🔐 Creating Additional Users

### As Admin via UI (Future)
Currently, users can self-register. To control access:

1. Users register via `/register`
2. Admin can update roles in database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
UPDATE users SET is_active = false WHERE email = 'user@example.com';
```

## 📊 Next Steps / Future Enhancements

- [ ] Set up production database (e.g., Heroku Postgres)
- [ ] Deploy backend (e.g., Heroku, Railway)
- [ ] Deploy frontend (e.g., Vercel, Netlify)
- [ ] Add LinkedIn scraping feature
- [ ] Integrate with Salesforce
- [ ] Connect to AI Native tool
- [ ] Add email notifications
- [ ] Export to CSV functionality

## 🎉 You're All Set!

Your Sales Tracker Application is fully functional and ready to track:
- Contact outreach activities
- Job posting opportunities
- Builder assignments to jobs

For detailed documentation, see `README.md`

Questions? Check the troubleshooting section or review the code comments.

