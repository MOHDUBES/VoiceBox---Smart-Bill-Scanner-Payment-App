# 🔐 Admin Login Guide - VoiceBox

## Quick Start - Admin Access

### Option 1: Create New Admin Account (Recommended)
1. **Go to Login Page**: Open `login.html`
2. **Click "Sign Up"** tab
3. **Fill Registration Form**:
   - Full Name: `Admin` (or your name)
   - Email: `admin@voicebox.com` (or any email)
   - Phone: `+91 9876543210`
   - Password: `Admin123!` (or any password)
4. **CHECK** the "🔐 Create as Admin Account" checkbox
5. **Click "Create Account"**
6. **Automatic Redirect** → You'll be sent to Admin Panel

---

### Option 2: Login as Admin (If Account Exists)
1. **Go to Login Page**: Open `login.html`
2. **Fill Login Details**:
   - Email: (your registered email)
   - Password: (your password)
3. **CHECK** the "🔐 Login as Admin" checkbox
4. **Click "Sign In"**
5. **Admin Panel Opens** → Full access granted

---

## 📊 What You Can Access as Admin

Once logged in as Admin, you get access to:

✅ **Dashboard**
- Total Users Count
- Total Bills Scanned
- Total Transactions
- Real-time Statistics

✅ **User Management**
- View all registered users
- User statistics
- Account details

✅ **Bill Scans History**
- All bills scanned by users
- View bill images
- Scan timestamps

✅ **Payment Transactions**
- All payments made
- Transaction amounts
- Status tracking

✅ **Analytics**
- Usage graphs
- Performance metrics
- Revenue insights

---

## 🚀 Demo Admin Credentials

**For Quick Testing:**

| Field | Value |
|-------|-------|
| Email | `demo@admin.com` |
| Password | `Demo123!` |
| Admin Checkbox | ✓ Checked |

---

## 📝 Important Notes

### Demo Mode
- Currently running in **Demo Mode** (No Firebase)
- Data stored in **LocalStorage** (browser storage)
- No backend server needed
- Data persists during session

### When Firebase is Configured
- Will use **Firestore** for data storage
- Real-time database updates
- Multi-device sync
- Production-ready

### How It Works
1. **Signup with Admin Checkbox** → Creates user with `admin` role
2. **Login with Admin Checkbox** → Grants admin privileges
3. **Admin Role Verified** → Redirects to `admin.html`
4. **Regular User Role** → Redirects to `index.html`

---

## 🛠️ Troubleshooting

### Q: Admin Panel not opening?
**A:** Make sure the "🔐 Create as Admin Account" or "🔐 Login as Admin" checkbox is **CHECKED**

### Q: Getting "Access denied" error?
**A:** The checkbox wasn't checked during signup/login. Try again with the admin option enabled.

### Q: Data not saved?
**A:** You're in Demo Mode. Data is stored locally. Clear browser cache if having issues:
```
Browser → Settings → Clear Browsing Data → Clear All
```

### Q: Can I convert existing user to admin?
**A:** Currently, you need to signup/login with admin checkbox. To convert:
1. Open **Browser Console** (F12 → Console)
2. Run this command:
```javascript
let user = JSON.parse(localStorage.getItem('voicebox_current_user'));
user.role = 'admin';
localStorage.setItem('voicebox_current_user', JSON.stringify(user));
location.reload();
```

---

## 📂 File Paths to Remember

- **Login Page**: `html/login.html`
- **Admin Panel**: `html/admin.html`
- **Main App**: `html/index.html`
- **Auth Logic**: `js/auth.js`
- **Admin Logic**: `js/admin.js`

---

## ✨ Next Steps

1. **Create Admin Account** via signup
2. **Login to Admin Panel** and explore features
3. **Check demo data** in Dashboard
4. **Configure Firebase** (optional) for production use

Good luck! 🚀
