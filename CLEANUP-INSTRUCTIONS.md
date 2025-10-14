# 🧹 Database Cleanup Instructions

## What's Been Fixed

✅ **Overview Dashboard** - Now fetches REAL data:
- Active Builders: Counts builders with status 'active'
- Placements: Counts builders with status 'placed'
- Total Leads: Counts actual outreach + job postings
- Hot Leads: Counts leads with interested/meeting/opportunity status

✅ **Cleanup Script** - Ready to remove all fake data

---

## Step 1: Run the Cleanup

### Option A: Using the Shell Script (Easiest)

```bash
# Navigate to the project directory
cd "/Users/timothyasprec/Desktop/Sales Tracker Application"

# Make the script executable
chmod +x run_cleanup.sh

# Run the cleanup (replace 'sales_tracker_db' with your actual database name if different)
./run_cleanup.sh
```

### Option B: Manual SQL Commands

If Option A doesn't work, run the SQL file manually:

```bash
# Connect to your database
psql -d sales_tracker_db -f cleanup_fake_data.sql
```

### Option C: Using pgAdmin or Database GUI

If you use a GUI tool like pgAdmin:
1. Open `cleanup_fake_data.sql`
2. Copy all the SQL commands
3. Paste and execute them in your database query window

---

## Step 2: Verify the Cleanup

After running the cleanup, you should see:

```
user_count: 1         (Timothy Asprec only)
builder_count: 0      (all fake builders removed)
lead_count: 0         (or only your own leads)
activity_count: 0     (all fake activities removed)
job_posting_count: 0  (all fake job postings removed)
```

---

## Step 3: Restart the Server

```bash
# In the sales-tracker-server directory
cd sales-tracker-server

# Stop the current server (Ctrl+C if running)

# Restart it
npm start
```

---

## Step 4: Refresh the Application

1. Go to your browser
2. **Refresh the page** (or Cmd+Shift+R / Ctrl+Shift+F5 for hard refresh)
3. Navigate to the **Overview** tab

### Expected Results:

Your Overview Dashboard should now show:

- **Total Leads**: 0 (unless you've already created some)
- **Active Builders**: 0 (no builders added yet)
- **Hot Leads**: 0 (no hot leads yet)
- **Placements**: 0 (no placements yet)

### Activity Feed & Builders:

- **Activity Feed**: Empty (no activities)
- **Builders**: Empty (no builders)

---

## Step 5: Test Creating a Builder

1. Go to **Quick Actions** or **Builders**
2. Click **"Add Builder"**
3. Fill out the form:
   - Date: Select today or any past date
   - Full Name: e.g., "John Test Builder"
   - Cohort: e.g., "Cohort 1"
   - Pursuit Email: e.g., "john@pursuit.org"
   - Builder's Desired Role: e.g., "Full-Stack Developer"
   - Aligned Sectors: Select at least one
   - Other fields: Fill as desired
4. **Submit the form**

### Expected Results:

✅ **Builders page** shows the new builder card
✅ **Activity Feed** shows "Timothy Asprec added builder: John Test Builder"
✅ **Overview Dashboard** shows:
   - Active Builders: 1
   - Placements: 0

---

## Step 6: Test Creating a Lead

1. Go to **Quick Actions** or **All Leads**
2. Click **"Add New Lead"**
3. Fill out the form:
   - Date: Select today
   - Lead Type: Contact Outreach or Job Posting
   - Fill required fields
   - **Ownership**: Select "Timothy Asprec" from dropdown
   - Aligned Sectors: Select at least one
4. **Submit the form**

### Expected Results:

✅ **All Leads page** shows the new lead
✅ **Activity Feed** shows the activity
✅ **Overview Dashboard** updates Total Leads count

---

## Troubleshooting

### Issue: "psql: command not found"

You might not have PostgreSQL in your PATH. Try:

```bash
# Find your PostgreSQL installation
which psql

# Or use the full path (common locations):
/Library/PostgreSQL/15/bin/psql -d sales_tracker_db -f cleanup_fake_data.sql
/Applications/Postgres.app/Contents/Versions/latest/bin/psql -d sales_tracker_db -f cleanup_fake_data.sql
```

### Issue: "database does not exist"

Find your database name:

```bash
psql -l  # Lists all databases
```

Then use the correct name in the commands above.

### Issue: Still seeing fake data

1. Make sure the SQL commands ran successfully (check for errors)
2. Restart the server
3. Do a **hard refresh** in your browser (Cmd+Shift+R / Ctrl+Shift+F5)
4. Clear your browser cache

### Issue: Ownership dropdown is empty

1. Make sure the server restarted
2. Check that Timothy Asprec still exists in the database:
   ```sql
   SELECT * FROM users WHERE name = 'Timothy Asprec';
   ```
3. Check browser console for errors (F12)

---

## Database Quick Reference

### Connect to your database:
```bash
psql -d sales_tracker_db
```

### Check current data:
```sql
-- Check users
SELECT id, name, email FROM users;

-- Check builders
SELECT id, name, cohort, role, status FROM builders;

-- Check activities
SELECT id, user_name, action_type, entity_name FROM activities ORDER BY created_at DESC LIMIT 10;

-- Check leads
SELECT id, contact_name, company_name, ownership FROM outreach;
```

### Manual cleanup (if needed):
```sql
-- Remove everything (CAREFUL!)
DELETE FROM activities;
DELETE FROM builders;
DELETE FROM job_posting_builders;
DELETE FROM job_postings;
DELETE FROM outreach;
DELETE FROM users WHERE name != 'Timothy Asprec';
```

---

## Success Checklist

- [ ] Ran cleanup script
- [ ] Verified only Timothy Asprec remains in users
- [ ] Restarted the server
- [ ] Refreshed the browser
- [ ] Overview shows 0 Active Builders
- [ ] Overview shows 0 Placements
- [ ] Activity Feed is empty
- [ ] Builders page is empty
- [ ] Can see "Timothy Asprec" in Ownership dropdown
- [ ] Can successfully submit Builder form
- [ ] New builder appears in Builders page
- [ ] Activity logs in Activity Feed
- [ ] Overview updates with new counts

---

You're all set! Once the cleanup is complete, you'll have a clean slate to test all the forms. 🎉

