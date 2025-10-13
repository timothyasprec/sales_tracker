# Admin User Management System

## 🎉 New Features Added!

Your Sales Tracker now has a complete admin management system!

---

## ✨ Features

### 1. **Auto-Admin Promotion on Registration**
New users with specific email addresses will automatically become admins when they register!

**How it works:**
- Emails listed in `.env` file under `ADMIN_EMAILS` are automatically promoted to admin
- Currently configured: `timothyasprec@pursuit.org`
- Comma-separated for multiple admins: `email1@pursuit.org,email2@pursuit.org`

**To add more auto-admin emails:**
1. Edit `sales-tracker-server/.env`
2. Add to `ADMIN_EMAILS`: `ADMIN_EMAILS=timothyasprec@pursuit.org,another@pursuit.org`
3. Backend will restart automatically
4. New registrations with those emails will be admins!

---

### 2. **User Management Dashboard**
Admins can now manage all users through a dedicated interface!

**Access:** http://localhost:5173/users

**From any admin page, click "Manage Users" button**

---

## 🎯 What Admins Can Do

### **View All Users**
- See complete user list with:
  - User ID, Name, Email
  - Role (Admin or Staff)
  - Status (Active or Inactive)
  - Creation date

### **Promote/Demote Users**
- **Promote to Admin:** Give staff members admin privileges
- **Demote to Staff:** Remove admin privileges from users

### **Activate/Deactivate Users**
- **Deactivate:** Prevent users from logging in (they can't access the system)
- **Activate:** Re-enable deactivated users
- **Safety:** You cannot deactivate your own account

---

## 🔒 How It Works

### **Registration Flow:**

**For Regular Users:**
```
1. User registers with any email
2. System checks ADMIN_EMAILS in .env
3. If NOT in list → role = 'staff'
4. User can use the app with staff permissions
```

**For Admin Emails:**
```
1. User registers with admin email (timothyasprec@pursuit.org)
2. System checks ADMIN_EMAILS in .env
3. Email IS in list → role = 'admin'
4. User gets full admin access immediately!
```

---

## 📋 Admin Management Use Cases

### **Scenario 1: New Staff Member Joins**
1. They register at http://localhost:5173/register
2. Email: `newstaff@pursuit.org`
3. Automatically assigned role: **staff**
4. They can log outreach and job postings

### **Scenario 2: Make Someone an Admin**
**Option A - Via User Management Dashboard:**
1. Login as admin
2. Click "Manage Users"
3. Find the user
4. Click "Promote to Admin"
5. Done! They're now an admin

**Option B - Add to Auto-Admin List:**
1. Edit `sales-tracker-server/.env`
2. Add their email to `ADMIN_EMAILS`
3. They'll be admin on next login (or re-register)

### **Scenario 3: Staff Member Leaves**
1. Login as admin
2. Click "Manage Users"
3. Find the user
4. Click "Deactivate"
5. They can no longer login

### **Scenario 4: Re-enable a User**
1. Login as admin
2. Click "Manage Users"
3. Find the deactivated user
4. Click "Activate"
5. They can login again!

---

## 🛡️ Security Features

### **Protected Actions:**
- Only admins can access `/users` page
- Only admins can change user roles
- Only admins can activate/deactivate users
- You cannot deactivate your own account
- All changes require confirmation dialogs

### **API Endpoints:**
```
GET    /api/admin/users           - List all users (admin only)
PUT    /api/admin/users/:id/role  - Change user role (admin only)
PUT    /api/admin/users/:id/status - Activate/deactivate user (admin only)
```

---

## 💡 Best Practices

### **For Production:**
1. **Keep ADMIN_EMAILS secure** - only trusted emails
2. **Review admins regularly** - remove old admin access
3. **Use strong passwords** - enforce password policies
4. **Monitor user activity** - track who's doing what
5. **Backup regularly** - user data is critical

### **For Development:**
- Use test emails for admin testing
- Create multiple test users to test permissions
- Test deactivation before deploying

---

## 🔧 Configuration Files

### **Backend `.env`:**
```env
# Admin Emails (comma-separated, auto-promoted on registration)
ADMIN_EMAILS=timothyasprec@pursuit.org,admin2@pursuit.org
```

### **To Add More Admins:**
Simply edit the `.env` file and add emails separated by commas:
```env
ADMIN_EMAILS=tim@pursuit.org,jane@pursuit.org,john@pursuit.org
```

Backend will restart automatically (nodemon watches for changes).

---

## 📊 User Roles Comparison

| Feature | Staff | Admin |
|---------|-------|-------|
| Log Outreach | ✅ | ✅ |
| Log Job Postings | ✅ | ✅ |
| View Own Records | ✅ | ✅ |
| Edit Own Records | ✅ | ✅ |
| View All Records | ❌ | ✅ |
| Filter All Records | ❌ | ✅ |
| Manage Users | ❌ | ✅ |
| Promote/Demote Users | ❌ | ✅ |
| Activate/Deactivate Users | ❌ | ✅ |

---

## 🎮 Try It Out!

### **Test the New Features:**

1. **You're already an admin!** (timothyasprec@pursuit.org)
   - Logout and login again to see all admin features

2. **Go to User Management:**
   - Click "Admin View" → Click "Manage Users"
   - See yourself in the list with "You" badge

3. **Create a test staff user:**
   - Register with a different email (test@example.com)
   - Login as that user - see staff-only features
   - Login back as admin - promote them!

4. **Test auto-admin:**
   - Add another email to ADMIN_EMAILS in .env
   - Register with that email
   - See instant admin access!

---

## 🆘 Troubleshooting

**"User not found" when promoting:**
- Refresh the page and try again
- Check backend console for errors

**Auto-admin not working:**
- Check `.env` file has correct email format
- Restart backend server: `rs` in backend terminal
- Try registering again

**Can't access User Management:**
- Make sure you're logged in as admin
- Logout and login again
- Check your role in database

**Changes not saving:**
- Check backend is running
- Look for errors in browser console (F12)
- Verify network requests are successful

---

## 📚 Related Documentation

- `README.md` - Full project documentation
- `START-APP.md` - Quick start guide
- `database-schema.md` - Database structure

---

**Your Sales Tracker now has enterprise-level user management! 🚀**

