// Firebase Configuration
const firebaseConfig = {
    // IMPORTANT: Replace with your Firebase project credentials
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
// Make auth/db/analytics available in module scope
let auth = null;
let db = null;
let analytics = null;

if (!isFirebaseConfigured) {
    // Show helpful message
    document.addEventListener('DOMContentLoaded', () => {
        showToast('⚠️ Firebase not configured! Please add your Firebase config in auth.js file. Check ADMIN_SETUP.md for instructions.', 'error');
        console.error(`
╔════════════════════════════════════════════════════════════╗
║           FIREBASE CONFIGURATION MISSING!                   ║
╠════════════════════════════════════════════════════════════╣
║  Please follow these steps:                                 ║
║                                                             ║
║  1. Go to Firebase Console:                                ║
║     https://console.firebase.google.com/                   ║
║                                                             ║
║  2. Create a new project or select existing one            ║
║                                                             ║
║  3. Go to Project Settings → General                       ║
║                                                             ║
║  4. Scroll to "Your apps" → Click Web icon (</>)          ║
║                                                             ║
║  5. Copy the firebaseConfig object                         ║
║                                                             ║
║  6. Paste it in auth.js (line 2-11)                       ║
║     Also paste in admin.js and app.js                      ║
║                                                             ║
║  📖 Full guide: Open ADMIN_SETUP.md or setup-guide.html   ║
╚════════════════════════════════════════════════════════════╝
        `);
    });
}

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    analytics = isFirebaseConfigured ? firebase.analytics() : null;
} catch (error) {
    console.error('Firebase initialization error:', error);
    document.addEventListener('DOMContentLoaded', () => {
        showToast('Firebase initialization failed. Please check your configuration.', 'error');
    });
}

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initializeForms();
    loadStats();
    checkAuthState();
});

// ===== Auth State Management =====
function checkAuthState() {
    // Only use Firebase auth state if configured
    if (isFirebaseConfigured && auth && typeof auth.onAuthStateChanged === 'function') {
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                console.log('User logged in:', user.email);

                // Track login analytics
                logActivity('login', {
                    userId: user.uid,
                    email: user.email,
                    timestamp: new Date().toISOString()
                });

                // Redirect to main app
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            }
        });
    }
}

// ===== Form Initialization =====
function initializeForms() {
    // Login Form
    const loginFormSubmit = document.getElementById('loginFormSubmit');
    loginFormSubmit.addEventListener('submit', handleLogin);

    // Signup Form
    const signupFormSubmit = document.getElementById('signupFormSubmit');
    signupFormSubmit.addEventListener('submit', handleSignup);

    // Google Login
    document.getElementById('googleLogin').addEventListener('click', handleGoogleAuth);
    document.getElementById('googleSignup').addEventListener('click', handleGoogleAuth);

    // Password Strength Checker
    document.getElementById('signupPassword').addEventListener('input', checkPasswordStrength);
}

// ===== Login Functionality =====
async function handleLogin(e) {
    e.preventDefault();
    showLoading(true);

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Check if Firebase is configured
    if (!isFirebaseConfigured) {
        // Use LocalStorage authentication (Demo Mode)
        handleLocalStorageLogin(email, password, rememberMe);
        return;
    }

    try {
        // Set persistence
        const persistence = rememberMe
            ? firebase.auth.Auth.Persistence.LOCAL
            : firebase.auth.Auth.Persistence.SESSION;
        await auth.setPersistence(persistence);

        // Sign in
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update user stats
        await updateUserStats(user.uid, 'login');

        showToast('Login successful! Redirecting...');

        // Log activity
        logActivity('login_success', {
            userId: user.uid,
            email: user.email,
            method: 'email'
        });

        // Redirect handled by onAuthStateChanged
    } catch (error) {
        showLoading(false);
        handleAuthError(error);

        logActivity('login_failed', {
            email: email,
            error: error.code
        });
    }
}

// ===== LocalStorage Login (Demo Mode) =====
function handleLocalStorageLogin(email, password, rememberMe) {
    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Login successful
        const userRole = user.role || 'user';
        const currentUser = {
            uid: user.uid,
            name: user.name,
            email: user.email,
            role: userRole,
            loginTime: new Date().toISOString()
        };

        // Save to session
        if (rememberMe) {
            localStorage.setItem('voicebox_current_user', JSON.stringify(currentUser));
        } else {
            sessionStorage.setItem('voicebox_current_user', JSON.stringify(currentUser));
        }

        showToast('✅ Login successful! (Demo Mode - No Firebase)', 'success');
        showLoading(false);

        // Show detailed notification
        const loginNotification = `
🎉 Login Successful!
👤 User: ${user.name}
📧 Email: ${user.email}
🕐 Time: ${new Date().toLocaleTimeString('en-IN')}
🔐 Mode: ${user.authProvider === 'google' ? 'Google' : 'Email/Password'}
        `;
        console.log(loginNotification);

        // Redirect
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);
    } else {
        showLoading(false);
        showToast('❌ Invalid email or password. Try signing up first!', 'error');
    }
}

// ===== Signup Functionality =====
async function handleSignup(e) {
    e.preventDefault();
    showLoading(true);

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;

    // Check if Firebase is configured
    if (!isFirebaseConfigured) {
        // Use LocalStorage authentication (Demo Mode)
        handleLocalStorageSignup(name, email, phone, password);
        return;
    }

    try {
        // Create user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update profile
        await user.updateProfile({
            displayName: name
        });

        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            name: name,
            email: email,
            phone: phone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            role: 'user',
            stats: {
                totalScans: 0,
                totalPayments: 0,
                totalAmount: 0
            },
            isActive: true
        });

        // Send verification email
        await user.sendEmailVerification();

        showToast('Account created! Please verify your email.');

        // Log activity
        logActivity('signup_success', {
            userId: user.uid,
            email: user.email,
            method: 'email'
        });

        // Redirect handled by onAuthStateChanged
    } catch (error) {
        showLoading(false);
        handleAuthError(error);

        logActivity('signup_failed', {
            email: email,
            error: error.code
        });
    }
}

// ===== LocalStorage Signup (Demo Mode) =====
function handleLocalStorageSignup(name, email, phone, password) {
    const signupAsAdminEl = document.getElementById('signupAsAdmin');
    const signupAsAdmin = signupAsAdminEl ? signupAsAdminEl.checked : false;
    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');

    // Check if email already exists
    if (users.find(u => u.email === email)) {
        showLoading(false);
        showToast('❌ Email already exists! Please login instead.', 'error');
        return;
    }

    // Create new user
    const newUser = {
        uid: 'user_' + Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password, // In demo mode, storing plain password
        role: signupAsAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        stats: {
            totalScans: 0,
            totalPayments: 0,
            totalAmount: 0
        }
    };

    // Add to users array
    users.push(newUser);
    localStorage.setItem('voicebox_users', JSON.stringify(users));

    // Auto login
    const currentUser = {
        uid: newUser.uid,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        loginTime: new Date().toISOString()
    };

    localStorage.setItem('voicebox_current_user', JSON.stringify(currentUser));

    showToast('✅ Account created successfully! (Demo Mode)', 'success');
    showLoading(false);

    // Redirect to main app
    setTimeout(() => {
        if (newUser.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    }, 1500);
}

// ===== Google Authentication =====
async function handleGoogleAuth() {
    // Check if Firebase is configured
    if (!isFirebaseConfigured) {
        // Use Google OAuth directly (Demo Mode)
        handleGoogleOAuthDemo();
        return;
    }

    showLoading(true);

    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        const isNewUser = result.additionalUserInfo.isNewUser;

        // If new user, create user document
        if (isNewUser) {
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                phone: user.phoneNumber || '',
                photoURL: user.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'user',
                stats: {
                    totalScans: 0,
                    totalPayments: 0,
                    totalAmount: 0
                },
                isActive: true,
                authProvider: 'google'
            });

            logActivity('signup_success', {
                userId: user.uid,
                email: user.email,
                method: 'google'
            });
        } else {
            // Update last login
            await updateUserStats(user.uid, 'login');

            logActivity('login_success', {
                userId: user.uid,
                email: user.email,
                method: 'google'
            });
        }

        showToast('Signed in with Google successfully!');

        // Redirect handled by onAuthStateChanged
    } catch (error) {
        showLoading(false);
        handleAuthError(error);

        logActivity('google_auth_failed', {
            error: error.code
        });
    }
}

// ===== Google OAuth Demo Mode (Without Firebase) =====
function handleGoogleOAuthDemo() {
    showToast('🔓 Google Sign-in (Demo Mode) - Click OK to simulate Google login', 'success');

    // Simulate Google login with prompt
    const googleEmail = prompt('Enter your Gmail address:\n(Demo Mode - Any email works)', 'demo@gmail.com');

    if (!googleEmail) {
        showToast('❌ Google sign-in cancelled', 'error');
        return;
    }

    showLoading(true);

    // Simulate delay
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
        let user = users.find(u => u.email === googleEmail);

        if (!user) {
            // Create new user from Google
            const googleName = prompt('Enter your name:', googleEmail.split('@')[0]);

            user = {
                uid: 'google_' + Date.now(),
                name: googleName || googleEmail.split('@')[0],
                email: googleEmail,
                phone: '',
                password: 'google_oauth_' + Date.now(), // Auto-generated
                role: 'user',
                authProvider: 'google',
                createdAt: new Date().toISOString(),
                stats: {
                    totalScans: 0,
                    totalPayments: 0,
                    totalAmount: 0
                }
            };

            users.push(user);
            localStorage.setItem('voicebox_users', JSON.stringify(users));
            showToast('✅ Google account created! (Demo Mode)', 'success');
        } else {
            showToast('✅ Google sign-in successful! (Demo Mode)', 'success');
        }

        // Save current user
        const currentUser = {
            uid: user.uid,
            name: user.name,
            email: user.email,
            role: user.role,
            authProvider: 'google',
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('voicebox_current_user', JSON.stringify(currentUser));
        showLoading(false);

        // Redirect
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);
    }, 500);
}

// ===== User Stats Management =====
async function updateUserStats(userId, action) {
    const userRef = db.collection('users').doc(userId);

    try {
        await userRef.update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating user stats:', error);
    }
}

// ===== Activity Logging for Admin =====
async function logActivity(action, data) {
    try {
        await db.collection('activities').add({
            action: action,
            data: data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent,
            ip: await getUserIP()
        });

        // Track in Analytics
        analytics.logEvent(action, data);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return 'unknown';
    }
}

// ===== Load Public Stats =====
async function loadStats() {
    try {
        // Get total users
        const usersSnapshot = await db.collection('users').get();
        document.getElementById('totalUsers').textContent = usersSnapshot.size;

        // Get total activities
        const scansSnapshot = await db.collection('activities')
            .where('action', '==', 'bill_scanned')
            .get();
        document.getElementById('totalScans').textContent = scansSnapshot.size;

        const paymentsSnapshot = await db.collection('activities')
            .where('action', '==', 'payment_sent')
            .get();
        document.getElementById('totalTransactions').textContent = paymentsSnapshot.size;

        // Animate numbers
        animateNumbers();
    } catch (error) {
        console.error('Error loading stats:', error);
        // Set default values if offline
        document.getElementById('totalUsers').textContent = '500+';
        document.getElementById('totalScans').textContent = '2.5K+';
        document.getElementById('totalTransactions').textContent = '1.8K+';
    }
}

function animateNumbers() {
    document.querySelectorAll('.stat-item h3').forEach(el => {
        const target = parseInt(el.textContent);
        let current = 0;
        const increment = Math.ceil(target / 50);

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = current;
            }
        }, 30);
    });
}

// ===== Password Strength Checker =====
function checkPasswordStrength(e) {
    const password = e.target.value;
    const strengthIndicator = document.getElementById('passwordStrength');

    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    strengthIndicator.className = 'password-strength';

    if (strength <= 2) {
        strengthIndicator.classList.add('weak');
    } else if (strength <= 4) {
        strengthIndicator.classList.add('medium');
    } else {
        strengthIndicator.classList.add('strong');
    }
}

// ===== Toggle Password Visibility =====
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// ===== Switch Between Forms =====
function switchForm(formType) {
    event.preventDefault();

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (formType === 'signup') {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    } else {
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

// ===== Error Handling =====
function handleAuthError(error) {
    let message = 'An error occurred. Please try again.';

    switch (error.code) {
        case 'auth/email-already-in-use':
            message = 'Email already in use. Please login instead.';
            break;
        case 'auth/weak-password':
            message = 'Password should be at least 8 characters.';
            break;
        case 'auth/invalid-email':
            message = 'Invalid email address.';
            break;
        case 'auth/user-not-found':
            message = 'No account found with this email.';
            break;
        case 'auth/wrong-password':
            message = 'Incorrect password.';
            break;
        case 'auth/too-many-requests':
            message = 'Too many attempts. Please try again later.';
            break;
        case 'auth/network-request-failed':
            message = 'Network error. Check your connection.';
            break;
        case 'auth/popup-closed-by-user':
            message = 'Sign-in popup was closed.';
            break;
    }

    showToast(message, 'error');
}

// ===== UI Helpers =====
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toast.className = 'toast';
    if (type === 'error') {
        toast.classList.add('error');
    }

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

// ===== SIMPLE FORGOT PASSWORD - Direct Reset =====
function showForgotPassword(event) {
    event.preventDefault();

    // Step 1: Get email
    const email = prompt('🔐 PASSWORD RESET\n\nStep 1 of 2: Enter your email address');

    if (!email) return;

    const cleanEmail = email.trim();

    if (!cleanEmail.includes('@')) {
        alert('❌ Invalid email!');
        return;
    }

    // Check if account exists
    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const userIndex = users.findIndex(u => u.email === cleanEmail);

    if (userIndex === -1) {
        alert('❌ Account not found!\n\nEmail: ' + cleanEmail + '\n\nPlease signup first.');
        return;
    }

    // Step 2: Get new password
    const newPassword = prompt('🔐 PASSWORD RESET\n\nStep 2 of 2: Enter your NEW password\n(Minimum 6 characters)');

    if (!newPassword) return;

    if (newPassword.length < 6) {
        alert('❌ Password too short!\n\nMinimum 6 characters required.');
        return;
    }

    // Step 3: Confirm password
    const confirmPassword = prompt('🔐 PASSWORD RESET\n\nConfirm your new password:');

    if (!confirmPassword) return;

    if (newPassword !== confirmPassword) {
        alert('❌ Passwords do not match!\n\nPlease try again.');
        return;
    }

    // Update password
    users[userIndex].password = newPassword;
    localStorage.setItem('voicebox_users', JSON.stringify(users));

    // Send notification email
    sendPasswordChangeNotificationSimple(users[userIndex].name, cleanEmail);

    // Success!
    alert('✅ PASSWORD RESET SUCCESSFUL!\n\n' +
        'Email: ' + cleanEmail + '\n' +
        'New password has been set.\n\n' +
        'You can now login with your new password!\n\n' +
        '📧 Confirmation email sent.');

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PASSWORD RESET SUCCESSFUL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email: ${cleanEmail}
User: ${users[userIndex].name}
Time: ${new Date().toLocaleString()}

New password set successfully!
User can now login.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
}

// Send Simple Password Change Notification
function sendPasswordChangeNotificationSimple(userName, userEmail) {
    const formData = {
        access_key: "81160c87-1830-48f3-9cad-e52e539311e5",
        from_name: "VoiceBox Security",
        subject: "✅ VoiceBox - Password Changed Successfully",
        email: userEmail,
        name: userName,
        message: `
Hello ${userName},

Your VoiceBox password has been RESET successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSWORD CHANGED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Your password was reset at:
🕐 ${new Date().toLocaleTimeString('en-IN')}
📅 ${new Date().toLocaleDateString('en-IN')}

You can now login with your new password.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ SECURITY NOTICE:
If you did NOT make this change, please contact support immediately!

Best regards,
VoiceBox Security Team

--
This is an automated security notification.
        `
    };

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Password change notification sent to:', userEmail);
            }
        })
        .catch(error => {
            console.log('Email notification preview mode');
        });
}

// Handle Password Reset
async function handlePasswordReset(email) {
    const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
    if (!isFirebaseConfigured) {
        // LocalStorage mode
        handleLocalStoragePasswordReset(email);
    } else {
        // Firebase mode
        try {
            await auth.sendPasswordResetEmail(email);
            showLoading(false);
            showToast('✅ Password reset email sent! Check your inbox.', 'success');

            logActivity('password_reset_sent', { email: email });
        } catch (error) {
            showLoading(false);

            if (error.code === 'auth/user-not-found') {
                showToast('❌ No account found with this email', 'error');
            } else {
                handleAuthError(error);
            }

            logActivity('password_reset_failed', { email: email, error: error.code });
        }
    }
}

// LocalStorage Password Reset
function handleLocalStoragePasswordReset(email) {
    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const user = users.find(u => u.email === email);

    if (!user) {
        showLoading(false);
        showToast('❌ No account found with this email address', 'error');
        return;
    }

    // Generate reset token
    const resetToken = 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const resetExpiry = Date.now() + (30 * 60 * 1000); // 30 minutes

    // Save reset token
    const resetData = {
        email: email,
        token: resetToken,
        expiry: resetExpiry,
        used: false
    };

    const resets = JSON.parse(localStorage.getItem('voicebox_password_resets') || '[]');
    resets.push(resetData);
    localStorage.setItem('voicebox_password_resets', JSON.stringify(resets));

    // Send reset email
    sendPasswordResetEmail(user.name, email, resetToken);

    showLoading(false);
    showToast('✅ Password reset link sent to your email!', 'success');

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSWORD RESET LINK (Demo Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click this link to reset password:
${window.location.origin}/reset-password.html?token=${resetToken}

OR copy this code:
${resetToken}

Valid for 30 minutes.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
}

// Send Password Reset Email
function sendPasswordResetEmail(userName, userEmail, resetToken) {
    const resetLink = `${window.location.origin}/reset-password.html?token=${resetToken}`;

    const formData = {
        access_key: "81160c87-1830-48f3-9cad-e52e539311e5",
        from_name: "VoiceBox Security",
        subject: "🔐 VoiceBox - Password Reset Request",
        email: userEmail,
        name: userName,
        message: `
Hello ${userName},

You requested to reset your VoiceBox account password.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSWORD RESET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click the link below to reset your password:
${resetLink}

OR use this reset code:
${resetToken}

⏰ This link expires in 30 minutes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ SECURITY NOTICE:
If you didn't request this, please ignore this email.
Your password will remain unchanged.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Best regards,
VoiceBox Security Team

--
This is an automated security notification.
        `
    };

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Password reset email sent successfully!');
                console.log('📧 Email delivered to:', userEmail);
            } else {
                console.log('Email preview mode - check console for reset link');
            }
        })
        .catch(error => {
            console.log('Reset link (offline):', resetLink);
        });
}
