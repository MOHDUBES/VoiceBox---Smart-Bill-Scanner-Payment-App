# 📁 VoiceBox - File Structure & Access Guide

## 🎯 सही URLs

### **👤 User के लिए:**
```
User Login Page:
http://yoursite.com/html/login.html

Main App:
http://yoursite.com/html/index.html
```

### **👨‍💼 Admin के लिए (Secret):**
```
Admin Login Page:
http://yoursite.com/html/admin-login.html

Admin Dashboard:
http://yoursite.com/html/admin.html
```

---

## 📂 Folder Structure

```
VoiceBox/
│
├── html/                          ✅ सभी HTML files यहाँ
│   ├── login.html                 👤 User Login
│   ├── signup के साथ
│   ├── admin-login.html           🔐 Admin Login (Secret)
│   ├── admin.html                 📊 Admin Dashboard
│   ├── index.html                 🏠 Main App
│   ├── firebase-setup.html        ⚙️ Firebase Setup
│   ├── gmail-setup.html           📧 Gmail Setup
│   ├── reset-password.html        🔑 Password Reset
│   └── setup-guide.html           📖 Setup Guide
│
├── css/                           ✅ Styling
│   ├── style.css                  Main app styling
│   ├── auth.css                   Login/Signup styling
│   ├── admin.css                  Admin panel styling
│   └── center-content.css         Helper styles
│
├── js/                            ✅ JavaScript Logic
│   ├── auth.js                    Login/Signup logic
│   ├── admin.js                   Admin panel logic
│   ├── app.js                     Main app logic
│   ├── app.js.backup              Backup
│   └── [अन्य JS files]            Various features
│
├── assets/                        ✅ Images & Icons
│   └── voicebox-icon.png          App icon
│
├── docs/                          ✅ Documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── TESTING_GUIDE.md
│   └── [अन्य docs]                Various guides
│
├── scripts/                       ✅ Batch Scripts
│   ├── deploy.bat
│   ├── open-admin.bat
│   └── open-app.bat
│
└── Root Files
    ├── ADMIN_LOGIN_GUIDE.md       📖 Admin guide
    ├── ADMIN_SECRET_ACCESS.md     🔐 Secret admin access
    ├── USER_AND_ADMIN_LOGIN_GUIDE.md
    ├── QUICK_DEPLOY.md
    ├── voice-test.html            🎤 Voice test page
    └── [अन्य MD files]            Documentation

```

---

## ✅ हर चीज़ एक जगह है:

| Component | Location | Status |
|-----------|----------|--------|
| User Login | `html/login.html` | ✅ |
| Admin Login | `html/admin-login.html` | ✅ |
| Admin Dashboard | `html/admin.html` | ✅ |
| Main App | `html/index.html` | ✅ |
| CSS Files | `css/` | ✅ |
| JS Files | `js/` | ✅ |
| Images | `assets/` | ✅ |
| Docs | `docs/` | ✅ |
| No Duplicates | - | ✅ |

---

## 🚀 Quick Access

### **Admin को कहाँ जाना है:**
```
1. http://yoursite.com/html/admin-login.html
2. Email: admin@voicebox.com
3. Password: admin123
4. ✅ Access Admin Dashboard
```

### **User को कहाँ जाना है:**
```
1. http://yoursite.com/html/login.html
2. Signup या Login करो
3. ✅ Access Main App
```

---

## 🔒 Security Features

✅ **No Admin Option दिखता है user login में**
✅ **Secret admin-login.html सिर्फ तुम्हारे पास**
✅ **Admin role check होता है login के बाद**
✅ **सभी files properly organized**

---

## 📝 हर बार याद रखो:

- सिर्फ root में `html/` folder है
- User को सिर्फ `html/login.html` दो
- Admin को secretly `html/admin-login.html` दो
- कोई भी duplicate files नहीं हैं
- सब कुछ clean और organized है!

---

**Good to go! 🚀** सब कुछ सही है अब!
