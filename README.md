# 📱 VoiceBox - Smart Bill Scanner & Payment App

<div align="center">

![VoiceBox Logo](assets/voicebox-icon.png)

**A modern, voice-enabled bill scanning and payment solution with multi-language OCR support**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## 🌟 Features

### 📸 **Smart Bill Scanning**
- **Multi-language OCR** - Supports Hindi, English, and regional languages
- **Real-time text extraction** - Instant bill data recognition
- **Image preprocessing** - Auto-enhancement for better accuracy
- **Multiple input methods** - Camera, file upload, or drag & drop

### 🗣️ **Voice-Enabled Interface**
- **Voice commands** - Control the app hands-free
- **Multi-language support** - Hindi and English voice recognition
- **Voice feedback** - Audio confirmations and notifications
- **Accessibility** - Perfect for users with visual impairments

### 💳 **Secure Payment Integration**
- **Multiple payment methods** - UPI, Cards, Net Banking
- **QR code payments** - Quick scan and pay
- **Payment history** - Track all transactions
- **Bank-grade security** - Encrypted data transmission

### 👨‍💼 **Admin Dashboard**
- **User management** - View and manage all users
- **Transaction monitoring** - Real-time payment tracking
- **Analytics** - Comprehensive reports and insights
- **Activity logs** - Detailed audit trail

### 🎨 **Modern UI/UX**
- **Responsive design** - Works on all devices
- **Dark mode** - Eye-friendly interface
- **Smooth animations** - Premium user experience
- **Intuitive navigation** - Easy to use

---

## 🚀 Demo

### User Interface
- **Login Page**: Beautiful gradient design with Google OAuth
- **Scanner**: Real-time bill scanning with voice commands
- **History**: View all scanned bills and payments
- **Profile**: Manage account settings

### Admin Panel
- **Dashboard**: Overview of all activities
- **Users**: Manage user accounts
- **Transactions**: Monitor payments
- **Analytics**: Business insights

---

## 📋 Prerequisites

Before you begin, ensure you have:

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (for authentication and database)
- Web3Forms account (for email notifications)
- Basic knowledge of HTML/CSS/JavaScript

---

## 🛠️ Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/voicebox.git
cd voicebox
```

### 2️⃣ Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Authentication** (Email/Password & Google)
4. Enable **Firestore Database**
5. Copy your Firebase config

**Update Firebase Config in:**
- `js/auth.js` (line 2-11)
- `js/admin.js` (line 2-11)
- `js/app.js` (line 2-11)

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 3️⃣ Set Up Email Notifications (Optional)

1. Get API key from [Web3Forms](https://web3forms.com/)
2. Update in `js/admin.js` and `js/auth.js`

### 4️⃣ Run the Application

#### Option A: Using Live Server (Recommended)
```bash
# Install Live Server extension in VS Code
# Right-click on html/login.html → "Open with Live Server"
```

#### Option B: Using Python
```bash
python -m http.server 8000
# Open http://localhost:8000/html/login.html
```

#### Option C: Using Node.js
```bash
npx http-server -p 8000
# Open http://localhost:8000/html/login.html
```

---

## 📖 Usage

### 👤 For Users

#### **Login / Signup**
1. Open `html/login.html`
2. **Option 1**: Sign up with email and password
3. **Option 2**: Continue with Google
4. Access the main app

#### **Demo Credentials**
```
Email: demo@example.com
Password: demo123
```

#### **Scan a Bill**
1. Click on "Scanner" tab
2. Upload bill image or use camera
3. Wait for OCR processing
4. Review extracted data
5. Save or make payment

#### **Make Payment**
1. Go to "Payments" tab
2. Enter amount and details
3. Choose payment method
4. Confirm payment
5. Download receipt

### 👨‍💼 For Admins

#### **Admin Login**
1. Open `html/admin-login.html` (secret URL)
2. Use admin credentials
3. Access admin dashboard

#### **Default Admin Credentials**
```
Email: admin@voicebox.com
Password: admin123
```

⚠️ **Important**: Change default credentials after first login!

#### **Admin Features**
- View all users and their activities
- Monitor transactions in real-time
- Generate reports and analytics
- Manage user accounts
- View system logs

---

## 📁 Project Structure

```
VoiceBox/
│
├── html/                          # All HTML pages
│   ├── login.html                 # User login/signup
│   ├── admin-login.html           # Admin login (secret)
│   ├── admin.html                 # Admin dashboard
│   ├── index.html                 # Main app
│   ├── firebase-setup.html        # Firebase setup guide
│   ├── gmail-setup.html           # Email setup guide
│   └── setup-guide.html           # Complete setup guide
│
├── css/                           # Stylesheets
│   ├── style.css                  # Main app styles
│   ├── auth.css                   # Login/signup styles
│   ├── admin.css                  # Admin panel styles
│   └── center-content.css         # Utility styles
│
├── js/                            # JavaScript files
│   ├── auth.js                    # Authentication logic
│   ├── admin.js                   # Admin panel logic
│   ├── app.js                     # Main app logic
│   ├── scanner.js                 # OCR scanning
│   ├── voice.js                   # Voice commands
│   ├── payment.js                 # Payment processing
│   └── [other modules]            # Feature modules
│
├── assets/                        # Images and icons
│   └── voicebox-icon.png          # App logo
│
├── docs/                          # Documentation
│   ├── DEPLOYMENT_GUIDE.md        # Deployment instructions
│   ├── TESTING_GUIDE.md           # Testing guide
│   └── [other guides]             # Additional docs
│
├── scripts/                       # Utility scripts
│   ├── deploy.bat                 # Deployment script
│   ├── open-admin.bat             # Open admin panel
│   └── open-app.bat               # Open main app
│
└── Root Files
    ├── README.md                  # This file
    ├── ADMIN_LOGIN_GUIDE.md       # Admin guide
    ├── USER_LOGIN_GUIDE.md        # User guide
    ├── fix-user-login.html        # Login fix utility
    └── voice-test.html            # Voice testing page
```

---

## 🔧 Configuration

### Firebase Setup

1. **Authentication**
   - Enable Email/Password authentication
   - Enable Google authentication
   - Configure authorized domains

2. **Firestore Database**
   - Create collections: `users`, `bills`, `payments`, `activities`
   - Set up security rules

3. **Storage** (Optional)
   - Enable Firebase Storage for bill images
   - Configure CORS settings

### Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /bills/{billId} {
      allow read, write: if request.auth != null;
    }
    match /payments/{paymentId} {
      allow read, write: if request.auth != null;
    }
    match /activities/{activityId} {
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🎯 Features in Detail

### OCR Scanning
- **Tesseract.js** - Client-side OCR processing
- **Multi-language support** - Hindi, English, and more
- **Image preprocessing** - Auto-rotation, contrast enhancement
- **Confidence scoring** - Accuracy indicators

### Voice Commands
- **Web Speech API** - Browser-native voice recognition
- **Custom commands** - Scan, pay, navigate
- **Multi-language** - Hindi and English support
- **Voice feedback** - Audio confirmations

### Payment Integration
- **UPI** - Direct UPI payments
- **QR Codes** - Generate and scan payment QRs
- **Payment Gateway** - Integrate Razorpay/Stripe
- **Transaction history** - Complete payment logs

### Admin Analytics
- **Real-time stats** - Live user and transaction counts
- **Charts and graphs** - Visual data representation
- **Export reports** - Download CSV/PDF reports
- **User insights** - Activity patterns and trends

---

## 🔐 Security Features

- ✅ **Firebase Authentication** - Secure user management
- ✅ **Role-based access** - User and Admin roles
- ✅ **Encrypted storage** - Secure data handling
- ✅ **HTTPS only** - Secure communication
- ✅ **Input validation** - Prevent XSS and injection attacks
- ✅ **Session management** - Auto logout on inactivity
- ✅ **Password hashing** - Secure password storage
- ✅ **Activity logging** - Audit trail for all actions

---

## 🌐 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Opera | 76+ | ✅ Full |

---

## 📱 Responsive Design

- ✅ **Mobile** - Optimized for smartphones
- ✅ **Tablet** - Perfect for iPads and tablets
- ✅ **Desktop** - Full-featured experience
- ✅ **PWA Ready** - Install as mobile app

---

## 🧪 Testing

### Demo Mode (Without Firebase)

The app works in **demo mode** without Firebase configuration:

1. Open `html/login.html`
2. Use demo credentials: `demo@example.com` / `demo123`
3. All data stored in LocalStorage
4. Perfect for testing and development

### Fix User Login Issues

If users are redirected to admin dashboard:

1. Open `fix-user-login.html`
2. Click "Fix User Login Issue"
3. Fresh demo users will be created
4. Try logging in again

---

## 📚 Documentation

- **[User Login Guide](USER_LOGIN_GUIDE.md)** - Complete user guide
- **[Admin Guide](ADMIN_LOGIN_GUIDE.md)** - Admin panel guide
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Deploy to production
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Testing instructions
- **[API Documentation](docs/API_DOCS.md)** - API reference

---

## 🚀 Deployment

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Deploy to GitHub Pages

1. Push code to GitHub
2. Go to Settings → Pages
3. Select branch and folder
4. Save and deploy

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- **Tesseract.js** - OCR engine
- **Firebase** - Backend services
- **Web Speech API** - Voice recognition
- **Web3Forms** - Email notifications
- **Font Awesome** - Icons
- **Google Fonts** - Typography

---

## 📞 Support

Having issues? Here's how to get help:

1. **Check Documentation** - Read the guides in `/docs`
2. **Common Issues** - See [FAQ](docs/FAQ.md)
3. **GitHub Issues** - [Open an issue](https://github.com/yourusername/voicebox/issues)
4. **Email Support** - support@voicebox.com

---

## 🗺️ Roadmap

### Version 2.0 (Upcoming)
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync
- [ ] Advanced analytics
- [ ] Multi-currency support
- [ ] Bulk bill processing
- [ ] API for third-party integration

### Version 1.5 (In Progress)
- [x] Voice commands
- [x] Admin dashboard
- [x] Payment integration
- [ ] Email notifications
- [ ] PDF export

---

## 📊 Stats

- **Total Lines of Code**: 15,000+
- **Files**: 50+
- **Features**: 25+
- **Supported Languages**: 10+

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

<div align="center">

**Made with ❤️ by VoiceBox Team**

[⬆ Back to Top](#-voicebox---smart-bill-scanner--payment-app)

</div>
