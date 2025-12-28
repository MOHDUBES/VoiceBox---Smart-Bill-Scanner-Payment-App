# VoiceBox - User और Admin Login Guide

## 🎯 Overview - User और Admin Login कैसे काम करता है?

VoiceBox में दो अलग-अलग प्रकार की login हैं:

1. **User Login** - आम उपयोगकर्ताओं के लिए (`login.html`)
2. **Admin Login** - Admin पैनल के लिए (`admin.html`)

---

## 👤 1. USER LOGIN (आम उपयोगकर्ता)

### Login Page URL
```
login.html
```

### User Login Steps

#### Step 1: Login Form भरें
- **Email Address**: अपना ईमेल दर्ज करें
- **Password**: अपना पासवर्ड दर्ज करें
- **Remember Me**: यदि आप डिवाइस को याद रखना चाहते हैं तो चेक करें

#### Step 2: Login करें
```javascript
// File: js/auth.js
async function handleLogin(e) {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Firebase से verify करता है
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // ✅ Success - index.html पर redirect
}
```

#### Step 3: Access करें
- ✅ Login success के बाद **`index.html`** पर redirect होते हो
- आप Bill Scanner, Payment, History आदि access कर सकते हो

### User Login के Features
- ✅ Google Sign-In सपोर्ट
- ✅ Email + Password Login
- ✅ Signup करने का विकल्प
- ✅ Password Reset
- ✅ Demo Mode भी काम करता है (Firebase बिना)

### Demo Mode में User Login (बिना Firebase)
```javascript
// LocalStorage में save होता है
localStorage.setItem('voicebox_current_user', JSON.stringify({
    uid: 'demo_user_' + Date.now(),
    email: 'user@example.com',
    name: 'Demo User',
    role: 'user'  // ← Important: role = 'user'
}));
```

---

## 👨‍💼 2. ADMIN LOGIN (Admin पैनल)

### Admin Page URL
```
admin.html
```

### Admin कैसे बनें?

#### Method 1: Firebase में Admin बनाएं
```javascript
// Firebase Console में जाएं:
// 1. Firestore Database खोलें
// 2. 'users' collection में अपना document खोलें
// 3. 'role' field को 'admin' सेट करें

// Example document:
{
    email: "admin@voicebox.com",
    name: "Admin User",
    role: "admin"    // ← यह बहुत महत्वपूर्ण है!
}
```

#### Method 2: Demo Mode में Admin बनाएं (बिना Firebase)
```javascript
// Browser Console में paste करो (F12):
localStorage.setItem('voicebox_current_user', JSON.stringify({
    uid: 'admin_' + Date.now(),
    email: 'admin@voicebox.com',
    name: 'Admin User',
    role: 'admin'  // ← यह magic है!
}));

// फिर admin.html पर जाओ
// या reload करो current page को
```

### Admin Login Steps

#### Step 1: Login करो (User की तरह ही)
- `login.html` पर जाओ
- Email + Password से login करो (जहाँ Firebase में role = 'admin')

#### Step 2: Admin Check होता है
```javascript
// File: js/admin.js
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('voicebox_current_user'));
    
    // यहाँ check होता है:
    if (user.role !== 'admin') {
        alert('❌ Access denied. Admin only.');
        window.location.href = 'index.html';
        return;
    }
    
    // ✅ Admin verify! Dashboard load करो
    loadDashboard();
}
```

#### Step 3: Admin Dashboard Access करो
- ✅ Login success के बाद **`admin.html`** पर जा सकते हो
- Dashboard देख सकते हो
- Users, Bill Scans, Payments, Analytics आदि manage कर सकते हो

---

## 📊 User और Admin में Difference

| Feature | User | Admin |
|---------|------|-------|
| Login Page | `login.html` | `login.html` (फिर verify होता है) |
| Main Page | `index.html` | `admin.html` |
| Role Field | `role: 'user'` | `role: 'admin'` |
| Features | Scanner, Payments, History | Dashboard, Users, Analytics, Settings |
| Redirect Check | `checkAuthState()` → `index.html` | `checkAdminAuth()` → `admin.html` |
| Database Access | अपने bills, payments | सभी users के data |

---

## 🔑 Login Flow Diagram

```
┌─────────────────────────────────────────────────┐
│         User login.html खोलता है              │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│    Email + Password दर्ज करता है               │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│   Firebase/LocalStorage से verify होता है      │
└──────────────┬──────────────────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
 LOGIN FAIL      LOGIN SUCCESS
      │                 │
      │      ┌──────────┴──────────┐
      │      │                     │
      │      ▼                     ▼
      │   Check Role          Check Role
      │      │                     │
      │      ├─ role: 'user'   ├─ role: 'admin'
      │      │  ↓               ↓
      │      │  index.html      admin.html
      │      │                  ✅ ADMIN DASHBOARD
      │      ✅ APP HOME
      │
      ▼
Error Message दिखता है
```

---

## 🛠️ Quick Setup - Demo Mode में Test करो

### Admin बनने के लिए:
```javascript
// Browser Console खोलो (F12 दबाओ)
// यह paste करो:

localStorage.setItem('voicebox_current_user', JSON.stringify({
    uid: 'admin_demo_001',
    email: 'admin@demo.com',
    name: 'Demo Admin',
    role: 'admin'
}));

// फिर यहाँ जाओ:
// http://localhost/admin.html
```

### User बनने के लिए:
```javascript
// Browser Console में:
localStorage.setItem('voicebox_current_user', JSON.stringify({
    uid: 'user_demo_001',
    email: 'user@demo.com',
    name: 'Demo User',
    role: 'user'
}));

// फिर यहाँ जाओ:
// http://localhost/index.html
```

---

## 🔐 Security Notes

### Firebase Mode में (Production):
1. **Admin role check** होता है Firestore में
2. **Password** Firebase से secure होता है
3. **Session** localStorage में नहीं रहता (Firebase handles करता है)

### LocalStorage Mode में (Demo):
1. **LocalStorage से check** होता है (हल्का security)
2. **Password** localStorage में plain text नहीं रहता
3. **Demo mode के लिए ही है**, production के लिए नहीं!

---

## 📝 Files Reference

| File | Purpose |
|------|---------|
| `login.html` | User + Admin दोनों login form |
| `admin.html` | Admin Dashboard |
| `js/auth.js` | Login/Signup logic |
| `js/admin.js` | Admin verification + Dashboard logic |
| `index.html` | User का main app |

---

## 🚀 Admin Dashboard Features

एक बार admin login करने के बाद:

- 📊 **Dashboard** - Overview stats
- 👥 **Users** - सभी users का list
- 📸 **Bill Scans** - सभी bills scan की हुई
- 💳 **Payments** - सभी payments history
- 📈 **Analytics** - Performance metrics
- ⚙️ **Settings** - App settings

---

## ❓ Common Questions

### Q: मैं admin कैसे बनूँ?
**A:** Firebase में अपने user document में `role: 'admin'` सेट करो, या demo mode में ऊपर दिया गया code चलाओ।

### Q: क्या एक user admin बन सकता है?
**A:** हाँ, अगर Firestore में role को 'admin' से 'user' कर दो, तो admin access खत्म हो जाएगा।

### Q: Login failed हो रहा है क्या करूँ?
**A:** 
- Check करो Firebase configured है या नहीं (auth.js देखो)
- Demo mode में localStorage check करो
- Browser Console में errors देखो

### Q: Admin logout करने के बाद क्या होता है?
**A:** Session clear होता है और login.html पर redirect होता है।

---

## 📞 Need Help?

- Check `ADMIN_LOGIN_GUIDE.md` for detailed admin setup
- Check `setup-guide.html` for Firebase configuration
- See `docs/` folder for more documentation
