# Cleanup and Testing Guide

## Step 1: Clean Up Fake Data

Run the cleanup SQL script to remove all fake users and test data:

```bash
# Navigate to your database (replace with your actual database connection)
psql -d sales_tracker_db -f cleanup_fake_data.sql
```

OR if you're using a different method to connect to PostgreSQL, run the SQL commands from `cleanup_fake_data.sql` manually.

This will:
- ✅ Delete all activities (all fake)
- ✅ Delete all builders (none added yet)
- ✅ Delete fake users (Alex Martinez, Jordan Lee, Emily Rodriguez, Marcus Johnson, Sarah Chen)
- ✅ Keep only Timothy Asprec
- ✅ Remove outreach/leads not owned by Timothy Asprec

## Step 2: Restart the Server

The backend code has been updated to:
- ✅ Allow all authenticated users to see the user list in ownership dropdowns
- ✅ Accept all builder form fields (education, sectors, dates, etc.)
- ✅ Handle custom dates for backdating entries

**Restart your server:**

```bash
# In the sales-tracker-server directory
cd sales-tracker-server
npm start
```

## Step 3: Test the Builder Form

### What to Test:

1. **Navigate to Quick Actions or Builders page**
2. **Click "Add Builder"**
3. **Fill out the form:**
   - ✅ Date field at the top (can select past dates)
   - ✅ Full Name *
   - ✅ Cohort *
   - ✅ Pursuit Email *
   - ✅ Builder's Desired Role *
   - ✅ Aligned Sectors * (select at least one)
   - All other fields are optional

4. **Submit the form**

### Expected Results:

✅ **Builder appears in the Builders page** 
   - You should see the builder card with:
     - Name
     - Role
     - Cohort
     - Status badge (active)
     - Potential matches count

✅ **Activity appears in Activity Feed**
   - Action type: "added_builder"
   - Entity: Builder name
   - User: Timothy Asprec
   - Details showing cohort, role, and aligned sectors

## Step 4: Test Add New Lead Form

### What to Test:

1. **Navigate to Quick Actions or All Leads**
2. **Click "Add New Lead"**
3. **Fill out the form:**
   - ✅ Date field at the top
   - ✅ Select Lead Type (Contact Outreach or Job Posting)
   - ✅ Fill required fields based on type
   - ✅ Select Aligned Sectors
   - ✅ **Select your name in Ownership dropdown** (should show "Timothy Asprec")

4. **Submit the form**

### Expected Results:

✅ **Lead appears in All Leads page**
✅ **Activity logged in Activity Feed**
✅ **Ownership shows your name**

## Step 5: Test Update Lead Status

### What to Test:

1. **Navigate to Quick Actions**
2. **Click "Update Lead Status"**
3. **Features:**
   - ✅ Date field at the top for backdating updates
   - ✅ Search for existing leads
   - ✅ "My Leads Only" filter (should show only leads owned by you)
   - ✅ Update status, temperature, add notes
   - ✅ Submit and verify activity is logged

## Troubleshooting

### If you don't see yourself in the Ownership dropdown:

1. Check that the server restarted successfully
2. Try logging out and back in
3. Open browser console (F12) and check for errors
4. Verify the cleanup script ran successfully:
   ```sql
   SELECT id, name, email, role FROM users;
   ```

### If Builder form doesn't submit:

1. Check browser console for errors
2. Check server logs for error messages
3. Verify all required fields are filled:
   - Name, Cohort, Email, Role, Aligned Sectors (at least one)

### If Activities don't appear:

1. Check that the activity feed page refreshed
2. Verify in database:
   ```sql
   SELECT * FROM activities ORDER BY created_at DESC LIMIT 10;
   ```
3. Check server logs for errors when creating the builder

## Database Verification Queries

```sql
-- Check all users
SELECT id, name, email, role, is_active FROM users ORDER BY name;

-- Check all builders
SELECT id, name, cohort, role, status, created_at FROM builders ORDER BY created_at DESC;

-- Check recent activities
SELECT id, user_name, action_type, entity_type, entity_name, created_at 
FROM activities 
ORDER BY created_at DESC 
LIMIT 20;

-- Check leads
SELECT id, contact_name, company_name, ownership, stage, created_at 
FROM outreach 
ORDER BY created_at DESC;
```

## Success Criteria

- ✅ Only Timothy Asprec appears in users
- ✅ Ownership dropdown shows "Timothy Asprec"
- ✅ Can submit Builder form successfully
- ✅ Builder appears in Builders page
- ✅ Activity logs when builder is created
- ✅ Can submit Lead forms successfully
- ✅ Can update lead status with custom dates
- ✅ All activities show in Activity Feed

