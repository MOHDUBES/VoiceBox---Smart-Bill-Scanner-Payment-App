# 👤 User Login Guide - VoiceBox

## 📍 Login Page URL

```
http://yoursite.com/html/login.html
```

---

## 🚀 User Login करने के 3 तरीके

### **Option 1️⃣: Email + Password से Login (सबसे आसान)**

#### Step 1: Login Page खोलो
```
URL: http://yoursite.com/html/login.html
```

#### Step 2: Login Form भरो
```
┌─────────────────────────────────────────┐
│ Email Address                           │
│ [demo@example.com]                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Password                                │
│ [••••••••••]                            │
└─────────────────────────────────────────┘

☑ Remember me          (Optional - अगली बार auto login)
← Back link दिखेगी

[Sign In] Button दबाओ
```

#### Step 3: Successfully Login! ✅
```
✅ Login success message
↓
Automatically redirect होगा index.html पर
↓
🏠 Main App दिखेगा
```

---

### **Option 2️⃣: Google Account से Login (सबसे तेज़)**

#### Step 1: Login Page खोलो
```
http://yoursite.com/html/login.html
```

#### Step 2: "Continue with Google" बटन दबाओ
```
┌──────────────────────────────────────┐
│ [Google Icon] Continue with Google   │
└──────────────────────────────────────┘
```

#### Step 3: Google Account Select करो
```
जो Google account चलता है उसे select करो
↓
Permission दो
↓
✅ Auto Login!
```

---

### **Option 3️⃣: Signup करके New Account बनाओ**

#### Step 1: "Sign Up" Link दबाओ
```
Login Form में नीचे:
"Don't have an account? Sign Up"
← यह link दबाओ
```

#### Step 2: Signup Form भरो
```
┌─────────────────────────────────────────┐
│ Full Name                               │
│ [John Doe]                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Email Address                           │
│ [your@example.com]                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Password                                │
│ [••••••••••]                            │
│ (कम से कम 8 characters)                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Confirm Password                        │
│ [••••••••••]                            │
└─────────────────────────────────────────┘

Password Strength दिखेगी:
🔴 Weak → 🟡 Fair → 🟢 Strong

[Create Account] Button दबाओ
```

#### Step 3: Account बन गया! ✅
```
✅ Account created successfully
↓
Auto login हो जाओगे
↓
🏠 Main App खुल जाएगा
```

---

## 🎯 Demo Mode में Test करो (बिना Firebase के)

अगर तुम पहले से कोई user बनाना चाहते हो तो **Browser Console** में:

### **Demo User बनाओ:**
```javascript
// Browser में F12 दबाओ (Developer Tools खुल जाएंगे)
// Console tab में यह paste करो:

localStorage.setItem('voicebox_users', JSON.stringify([
    {
        uid: 'user_001',
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'demo123',
        role: 'user'
    },
    {
        uid: 'user_002',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'john123',
        role: 'user'
    }
]));

// फिर यह paste करो:
console.log('✅ Demo users created! Now try login:');
console.log('User 1: demo@example.com / demo123');
console.log('User 2: john@example.com / john123');
```

अब इन credentials से login कर सकते हो!

---

## 📊 Login के बाद क्या दिखेगा?

### **Main App Features:**

```
🏠 SCANNER
   📸 Bill की photo लो
   🗣️ Voice commands
   📄 Text automatically recognize होगा

📋 HISTORY
   ✓ सभी scanned bills
   ✓ Payment status
   ✓ Download option

💳 PAYMENTS
   💰 Direct payment
   📱 QR code payment
   ✓ Payment confirmation

⚙️ SETTINGS
   🌐 Language (Hindi/English)
   🎤 Voice settings
   🔔 Notifications
   👤 Profile

👤 PROFILE
   ✓ अपना data
   ✓ Payment history
   ✓ Settings
   🚪 Logout
```

---

## 🔒 Security Tips

✅ **Strong Password बनाओ:**
```
❌ 123456 (बहुत simple)
❌ password (dictionary word)
✅ MyPass@123 (letters + numbers + symbols)
✅ VoiceBox#2024 (ज्यादा secure)
```

✅ **Remember Me का use करो:**
```
☑ Remember me → अगली बार auto login होगा
☐ यह uncheck करो → हर बार login करना पड़ेगा
```

✅ **Public Computer पर:**
```
❌ Remember me check मत करो
✅ हमेशा logout करो session के बाद
```

---

## ❓ Common Issues & Solutions

### **Issue 1: "Invalid Email" Error**
```
❌ Problem: Email format गलत है
✅ Solution: 
   - @ sign होना चाहिए
   - .com/.in आदि होना चाहिए
   - Example: user@example.com
```

### **Issue 2: "Password doesn't match"**
```
❌ Problem: Password गलत है
✅ Solution:
   - Caps Lock check करो
   - Space न हो password में
   - Correct spelling दो
```

### **Issue 3: "Account doesn't exist"**
```
❌ Problem: Email से कोई account नहीं है
✅ Solution:
   - Sign Up करके नया account बनाओ
   - Correct email दो
```

### **Issue 4: "Page not loading"**
```
❌ Problem: Connection issue
✅ Solution:
   - Internet check करो
   - Browser reload करो (Ctrl+R)
   - Cache clear करो (Ctrl+Shift+Del)
```

### **Issue 5: Google Login नहीं हो रहा**
```
❌ Problem: Pop-up blocked है
✅ Solution:
   - Browser के pop-up settings में allow करो
   - Private window में try करो
```

---

## 🔑 Password Forgotten?

### **Password Reset करना है?**

```
Login Page पर:
"Forgot Password?" link दबाओ
↓
Email address दर्ज करो
↓
Reset link भेजा जाएगा
↓
Email में link खोलो
↓
New password set करो
↓
✅ Login कर सकते हो!
```

---

## 📱 Mobile से Login करो

```
Same procedure है, बस:
1. http://yoursite.com/html/login.html खोलो
2. Mobile keyboard से भरो
3. Sign In दबाओ
4. ✅ Same app सब devices पर काम करेगा
```

---

## 🎯 Quick Reference

| Feature | Method |
|---------|--------|
| **Login करना है** | Email + Password |
| **Fast login** | Google से |
| **New account** | Sign Up button |
| **Password भूल गए** | Forgot Password |
| **Session remember** | Remember me ☑ |
| **Logout करना** | Profile → Logout |

---

## 📞 Help & Support

- **Login issue?** Browser console (F12) check करो errors के लिए
- **Account problem?** Password reset करो
- **Technical issue?** Admin से contact करो

---

**Happy VoiceBox-ing! 🚀** 

सब कुछ simple है, बस ऊपर दिए steps follow करो! ✅
