// ===== USER PROFILE MANAGEMENT =====

// Initialize Profile Section
function initializeProfile() {
    loadUserProfile();
    setupProfilePhotoUpload();
    setupProfileEdit();
}

// Load User Profile
function loadUserProfile() {
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const user = users.find(u => u.email === currentUser.email);

    if (!user) return;

    // Display profile info
    document.getElementById('profileName').textContent = user.name || 'User';
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profilePhone').textContent = user.phone || 'Not set';
    document.getElementById('profileBio').textContent = user.bio || 'No bio yet';
    document.getElementById('profileJoined').textContent = user.createdAt ?
        new Date(user.createdAt).toLocaleDateString('en-IN') : 'Recently';

    // Load profile photo
    if (user.profilePhoto) {
        document.getElementById('profilePhoto').src = user.profilePhoto;
        document.getElementById('profilePhotoLarge').src = user.profilePhoto;
    }

    // Stats
    const bills = JSON.parse(localStorage.getItem('scannedBills') || '[]');
    document.getElementById('userScans').textContent = bills.length;
    document.getElementById('userPayments').textContent = user.stats?.totalPayments || 0;
    document.getElementById('userHistory').textContent = bills.length;
}

// Edit Profile
function editProfile() {
    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex === -1) {
        alert('❌ User not found!');
        return;
    }

    // Get new information
    const newName = prompt('Edit Your Name:', users[userIndex].name || '');
    if (newName && newName.trim()) {
        users[userIndex].name = newName.trim();
    }

    const newPhone = prompt('Edit Phone Number:', users[userIndex].phone || '');
    if (newPhone !== null) {
        users[userIndex].phone = newPhone.trim();
    }

    const newBio = prompt('Edit Bio/About:', users[userIndex].bio || '');
    if (newBio !== null) {
        users[userIndex].bio = newBio.trim();
    }

    // Save to localStorage
    localStorage.setItem('voicebox_users', JSON.stringify(users));

    // Update currentUser
    currentUser.name = users[userIndex].name;
    currentUser.displayName = users[userIndex].name;

    // Reload profile
    loadUserProfile();

    showToast('✅ Profile updated successfully!');
    console.log('Profile updated for:', currentUser.email);
}

// Upload Profile Photo
function uploadProfilePhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const photoData = event.target.result;

            // Save to user profile
            const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
            const userIndex = users.findIndex(u => u.email === currentUser.email);

            if (userIndex !== -1) {
                users[userIndex].profilePhoto = photoData;
                localStorage.setItem('voicebox_users', JSON.stringify(users));

                // Update display
                document.getElementById('profilePhoto').src = photoData;
                document.getElementById('profilePhotoLarge').src = photoData;

                showToast('✅ Profile photo updated!');
            }
        };

        reader.readAsDataURL(file);
    };

    input.click();
}

// Remove Profile Photo
function removeProfilePhoto() {
    const confirm = window.confirm('Remove profile photo?');
    if (!confirm) return;

    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex !== -1) {
        delete users[userIndex].profilePhoto;
        localStorage.setItem('voicebox_users', JSON.stringify(users));

        // Reset to default
        const defaultPhoto = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%236366f1"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="white" font-size="40" font-family="Arial">👤</text></svg>';
        document.getElementById('profilePhoto').src = defaultPhoto;
        document.getElementById('profilePhotoLarge').src = defaultPhoto;

        showToast('✅ Profile photo removed');
    }
}

// Setup functions
function setupProfilePhotoUpload() {
    // Will be called on button clicks
}

function setupProfileEdit() {
    // Will be called on button clicks
}

// ===== BANK ACCOUNT MODAL (PhonePe/Paytm Style) =====

// Open Modal
function addBankDetailsSimple() {
    const modal = document.getElementById('bankAccountModal');
    modal.classList.remove('hidden');

    // Load existing data if any
    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const user = users.find(u => u.email === currentUser.email);

    if (user && user.bankDetails) {
        document.getElementById('modalUpiId').value = user.bankDetails.upiId || '';
        document.getElementById('modalBankName').value = user.bankDetails.bankName || '';
        document.getElementById('modalAccountNumber').value = user.bankDetails.accountNumber || '';
        document.getElementById('modalIfscCode').value = user.bankDetails.ifscCode || '';
        document.getElementById('modalAccountHolder').value = user.bankDetails.accountHolder || user.name || '';
    } else {
        // Pre-fill name
        document.getElementById('modalAccountHolder').value = currentUser.name || '';
    }
}

// Close Modal
function closeBankModal() {
    document.getElementById('bankAccountModal').classList.add('hidden');
}

// Handle Form Submit
document.addEventListener('DOMContentLoaded', () => {
    const bankForm = document.getElementById('bankAccountForm');
    if (bankForm) {
        bankForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveBankDetailsFromModal();
        });
    }
});

// Save from Modal
function saveBankDetailsFromModal() {
    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex === -1) {
        alert('❌ User not found!');
        return;
    }

    // Get form values
    const upiId = document.getElementById('modalUpiId').value.trim();
    const bankName = document.getElementById('modalBankName').value.trim();
    const accountNumber = document.getElementById('modalAccountNumber').value.trim();
    const ifscCode = document.getElementById('modalIfscCode').value.trim().toUpperCase();
    const accountHolder = document.getElementById('modalAccountHolder').value.trim();

    // Validate UPI ID (required)
    if (!upiId) {
        alert('❌ UPI ID is required!\n\nPlease enter your UPI ID to continue.');
        document.getElementById('modalUpiId').focus();
        return;
    }

    // Save to localStorage
    users[userIndex].bankDetails = {
        upiId: upiId,
        bankName: bankName || 'Not specified',
        accountNumber: accountNumber || '',
        ifscCode: ifscCode || '',
        accountHolder: accountHolder || users[userIndex].name,
        addedAt: new Date().toISOString()
    };

    localStorage.setItem('voicebox_users', JSON.stringify(users));

    // Close modal
    closeBankModal();

    // Show details container
    document.getElementById('bankDetailsContainer').style.display = 'block';

    // Update display
    loadBankDetailsSimple();

    // Generate QR
    setTimeout(() => {
        generatePersonalQRSimple();
    }, 300);

    showToast('✅ Bank details saved successfully!');

    console.log('✅ Bank account added:', upiId);
}

// Load Bank Details - Simple Display
function loadBankDetailsSimple() {
    console.log('Loading bank details...');

    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const user = users.find(u => u.email === currentUser.email);

    if (user && user.bankDetails) {
        console.log('Found bank details:', user.bankDetails);

        // UPI ID
        const upiEl = document.getElementById('displayUpiId');
        if (upiEl) upiEl.textContent = user.bankDetails.upiId || '-';

        // Bank Name
        const bankEl = document.getElementById('displayBankName');
        if (bankEl) bankEl.textContent = user.bankDetails.bankName || 'Not specified';

        // Account Number (masked)
        const accountEl = document.getElementById('displayAccount');
        if (accountEl) {
            if (user.bankDetails.accountNumber) {
                const masked = '****' + user.bankDetails.accountNumber.slice(-4);
                accountEl.textContent = masked;
            } else {
                accountEl.textContent = 'Not added';
            }
        }

        // IFSC Code
        const ifscEl = document.getElementById('displayIfsc');
        if (ifscEl) ifscEl.textContent = user.bankDetails.ifscCode || 'Not added';

        // Account Holder
        const holderEl = document.getElementById('displayHolder');
        if (holderEl) holderEl.textContent = user.bankDetails.accountHolder || user.name || '-';

        // Show container
        const container = document.getElementById('bankDetailsContainer');
        if (container) {
            container.style.display = 'block';
            console.log('✅ Bank details container shown');
        }

        console.log('✅ All bank details loaded successfully');
    } else {
        console.log('⚠️ No bank details found for user');
    }
}

// Generate QR - Simple API Version (Always Works!)
function generatePersonalQRSimple() {
    console.log('🔄 Generating QR code...');

    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const user = users.find(u => u.email === currentUser.email);

    if (!user || !user.bankDetails || !user.bankDetails.upiId) {
        console.log('❌ No bank details or UPI ID found');
        return;
    }

    const upiId = user.bankDetails.upiId;
    const name = user.bankDetails.accountHolder || user.name || 'User';

    console.log('✅ UPI ID:', upiId);
    console.log('✅ Name:', name);

    // UPI payment string
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&cu=INR`;
    console.log('✅ UPI String:', upiString);

    // Get container
    const container = document.getElementById('personalQrContainer');
    if (!container) {
        console.error('❌ Container not found!');
        return;
    }

    // Show loading
    container.innerHTML = '<div style="color: #999;">⏳ Generating QR...</div>';

    // Use API to generate QR (always works!)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}&color=6366f1&bgcolor=ffffff`;

    // Create image
    const img = document.createElement('img');
    img.src = qrApiUrl;
    img.alt = 'Payment QR Code';
    img.style.cssText = 'max-width: 250px; height: auto; border-radius: 8px; margin: 10px auto; display: block;';

    img.onload = function () {
        container.innerHTML = '';
        container.appendChild(img);

        // Add UPI ID below QR
        const info = document.createElement('p');
        info.style.cssText = 'color: #6366f1; font-size: 0.9rem; margin-top: 1rem; font-weight: 600;';
        info.textContent = upiId;
        container.appendChild(info);

        // Add name
        const nameDiv = document.createElement('p');
        nameDiv.style.cssText = 'color: #666; font-size: 0.85rem; margin-top: 0.25rem;';
        nameDiv.textContent = name;
        container.appendChild(nameDiv);

        // Show download button
        const downloadBtn = document.getElementById('downloadPersonalQRBtn');
        if (downloadBtn) {
            downloadBtn.style.display = 'block';
        }

        console.log('✅ QR Code generated successfully!');
        showToast('✅ QR code ready!');
    };

    img.onerror = function () {
        container.innerHTML = `
            <div style="padding: 1rem; text-align: center;">
                <p style="color: #ef4444; margin-bottom: 0.5rem;">❌ Failed to load QR</p>
                <p style="color: #666; font-size: 0.8rem; word-break: break-all;">${upiId}</p>
            </div>
        `;
        console.error('❌ QR image failed to load');
    };
}

// ===== BANK ACCOUNT & PAYMENT DETAILS =====

// Add/Update Bank Details
function addBankDetails() {
    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex === -1) {
        alert('❌ User not found!');
        return;
    }

    // Get bank details via prompts
    const upiId = prompt('💳 Enter UPI ID:\n(Example: yourname@paytm)', users[userIndex].bankDetails?.upiId || '');
    if (upiId === null) return; // Cancelled

    const bankName = prompt('🏦 Enter Bank Name:\n(Example: State Bank of India)', users[userIndex].bankDetails?.bankName || '');
    if (bankName === null) return;

    const accountNumber = prompt('🔢 Enter Account Number:', users[userIndex].bankDetails?.accountNumber || '');
    if (accountNumber === null) return;

    const ifscCode = prompt('🏛️ Enter IFSC Code:\n(Example: SBIN0001234)', users[userIndex].bankDetails?.ifscCode || '');
    if (ifscCode === null) return;

    const accountHolder = prompt('👤 Enter Account Holder Name:', users[userIndex].bankDetails?.accountHolder || users[userIndex].name);
    if (accountHolder === null) return;

    // Save bank details
    users[userIndex].bankDetails = {
        upiId: upiId.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.toUpperCase().trim(),
        accountHolder: accountHolder.trim(),
        addedAt: new Date().toISOString()
    };

    localStorage.setItem('voicebox_users', JSON.stringify(users));

    // Update display
    loadBankDetails();

    // Auto-generate QR
    generatePersonalQR();

    showToast('✅ Bank details saved successfully!');

    console.log('Bank details updated for:', currentUser.email);
}

// Load Bank Details
function loadBankDetails() {
    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const user = users.find(u => u.email === currentUser.email);

    if (user && user.bankDetails) {
        document.getElementById('savedUpiId').textContent = user.bankDetails.upiId || 'Not set';
        document.getElementById('savedBankName').textContent = user.bankDetails.bankName || 'Not set';
        document.getElementById('savedAccountNumber').textContent = user.bankDetails.accountNumber ? '****' + user.bankDetails.accountNumber.slice(-4) : 'Not set';
        document.getElementById('savedIfscCode').textContent = user.bankDetails.ifscCode || 'Not set';
        document.getElementById('savedAccountHolder').textContent = user.bankDetails.accountHolder || 'Not set';
    }
}

// Generate Personal Payment QR Code
function generatePersonalQR() {
    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const user = users.find(u => u.email === currentUser.email);

    if (!user || !user.bankDetails || !user.bankDetails.upiId) {
        alert('❌ Please add UPI ID first!\n\nClick "Add/Update Bank Details" to add your payment information.');
        return;
    }

    const bankDetails = user.bankDetails;

    // Create UPI payment string
    const upiString = `upi://pay?pa=${bankDetails.upiId}&pn=${encodeURIComponent(bankDetails.accountHolder || user.name)}&cu=INR`;

    // Generate QR code
    const container = document.getElementById('personalQrContainer');
    container.innerHTML = ''; // Clear

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    if (typeof QRCode !== 'undefined') {
        QRCode.toCanvas(canvas, upiString, {
            width: 200,
            margin: 2,
            color: {
                dark: '#6366f1',
                light: '#ffffff'
            }
        }, (error) => {
            if (error) {
                console.error('QR generation error:', error);
                container.innerHTML = '<p style="color: #666;">Error generating QR</p>';
            } else {
                console.log('✅ Personal payment QR generated!');
                document.getElementById('downloadPersonalQRBtn').style.display = 'block';

                // Add info below QR
                const info = document.createElement('p');
                info.style.cssText = 'color: #666; font-size: 0.75rem; margin-top: 0.5rem;';
                info.textContent = `${bankDetails.upiId}`;
                container.appendChild(info);
            }
        });
    } else {
        container.innerHTML = `<p style="color: #666; padding: 1rem;">QR: ${upiString}</p>`;
    }

    showToast('✅ Payment QR generated!');
}

// Download Personal QR Code
function downloadPersonalQR() {
    const canvas = document.querySelector('#personalQrContainer canvas');

    if (!canvas) {
        alert('❌ Please generate QR first!');
        return;
    }

    const link = document.createElement('a');
    link.download = `payment-qr-${currentUser.email}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('📥 QR Code downloaded!');
}

// Load Account Profile (existing function - enhanced)
function loadAccountProfile() {
    if (currentUser) {
        // Basic info
        document.getElementById('profileName').textContent = currentUser.name || currentUser.displayName || 'User';
        document.getElementById('profileEmail').textContent = currentUser.email || 'Not available';

        const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
        const user = users.find(u => u.email === currentUser.email);

        if (user) {
            // Extended info
            if (user.phone) document.getElementById('profilePhone').textContent = user.phone;
            if (user.bio) document.getElementById('profileBio').textContent = user.bio;
            if (user.createdAt) {
                document.getElementById('profileCreated').textContent = new Date(user.createdAt).toLocaleDateString('en-IN');
                document.getElementById('profileJoined').textContent = new Date(user.createdAt).toLocaleDateString('en-IN');
            }

            // Profile photo
            if (user.profilePhoto) {
                document.getElementById('profilePhoto').src = user.profilePhoto;
                if (document.getElementById('profilePhotoLarge')) {
                    document.getElementById('profilePhotoLarge').src = user.profilePhoto;
                }
            }
        }

        // Load stats
        const bills = JSON.parse(localStorage.getItem('scannedBills') || '[]');
        document.getElementById('userScans').textContent = bills.length;
        document.getElementById('userPayments').textContent = user?.stats?.totalPayments || '0';
        document.getElementById('userHistory').textContent = bills.length;

        // Load bank details - Simple version
        loadBankDetailsSimple();

        // Auto-load QR if bank details exist
        if (user && user.bankDetails && user.bankDetails.upiId) {
            setTimeout(() => {
                generatePersonalQRSimple();
            }, 500);
        }
    }
}

// Password Management Functions (keep existing)
function changePasswordInApp() {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;

    const newPassword = prompt('Enter your new password (min 6 characters):');
    if (!newPassword) return;

    const confirmPassword = prompt('Confirm your new password:');
    if (!confirmPassword) return;

    if (newPassword !== confirmPassword) {
        alert('❌ Passwords do not match!');
        return;
    }

    if (newPassword.length < 6) {
        alert('❌ Password must be at least 6 characters!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const userEmail = currentUser.email;
    const userIndex = users.findIndex(u => u.email === userEmail);

    if (userIndex === -1) {
        alert('❌ User not found!');
        return;
    }

    if (users[userIndex].password !== currentPassword) {
        alert('❌ Current password is incorrect!');
        return;
    }

    users[userIndex].password = newPassword;
    localStorage.setItem('voicebox_users', JSON.stringify(users));

    sendPasswordChangeNotification(currentUser.name || currentUser.email, userEmail);

    showToast('✅ Password changed successfully!');

    console.log(`Password changed for: ${userEmail} at ${new Date().toLocaleString()}`);
}

function forgotPasswordInApp() {
    const confirm = window.confirm(
        '🔐 Reset your password?\n\n' +
        'A password reset link will be sent to your email:\n' +
        currentUser.email + '\n\n' +
        'Click OK to continue.'
    );

    if (!confirm) return;

    const userEmail = currentUser.email;
    const userName = currentUser.name || currentUser.email;

    const resetToken = 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const resetExpiry = Date.now() + (30 * 60 * 1000);

    const resetData = {
        email: userEmail,
        token: resetToken,
        expiry: resetExpiry,
        used: false
    };

    const resets = JSON.parse(localStorage.getItem('voicebox_password_resets') || '[]');
    resets.push(resetData);
    localStorage.setItem('voicebox_password_resets', JSON.stringify(resets));

    sendPasswordResetEmailFromApp(userName, userEmail, resetToken);

    showToast('✅ Password reset link sent to your email!');

    console.log(`Reset link sent to: ${userEmail}`);
}

function sendPasswordChangeNotification(userName, userEmail) {
    const formData = {
        access_key: "81160c87-1830-48f3-9cad-e52e539311e5",
        from_name: "VoiceBox Security",
        subject: "🔐 VoiceBox - Password Changed",
        email: userEmail,
        name: userName,
        message: `
Hello ${userName},

Your VoiceBox account password was changed successfully.

✅ Password Updated Successfully!

Change Details:
🕐 Time: ${new Date().toLocaleTimeString('en-IN')}
📅 Date: ${new Date().toLocaleDateString('en-IN')}

⚠️ If you didn't make this change, contact support immediately!

Best regards,
VoiceBox Security Team
        `
    };

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Password change notification sent!');
            }
        })
        .catch(() => console.log('Notification preview mode'));
}

function sendPasswordResetEmailFromApp(userName, userEmail, resetToken) {
    const resetLink = `${window.location.origin}/reset-password.html?token=${resetToken}`;

    const formData = {
        access_key: "81160c87-1830-48f3-9cad-e52e539311e5",
        from_name: "VoiceBox Security",
        subject: "🔐 VoiceBox - Password Reset Request",
        email: userEmail,
        name: userName,
        message: `
Hello ${userName},

Password reset link: ${resetLink}

Valid for 30 minutes.

Best regards,
VoiceBox Security Team
        `
    };

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) console.log('✅ Reset email sent!');
        })
        .catch(() => console.log('Reset link:', resetLink));
}
