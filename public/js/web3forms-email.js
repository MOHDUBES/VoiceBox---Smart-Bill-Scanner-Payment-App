// ===== Email Notification (Web3Forms - No Setup Required!) =====
function sendEmailNotification(userName, userEmail) {
    // Using Web3Forms - Free, no account needed!
    const formData = {
        access_key: "4e8f7c2d-1a3b-4f5e-9d2c-6b8a1e3f7c9d", // Demo key - replace with yours
        to_email: userEmail,
        subject: "🔐 VoiceBox - Login Alert",
        message: `
Hello ${userName},

✅ Your VoiceBox account login was successful!

Login Details:
🕐 Time: ${new Date().toLocaleTimeString('en-IN')}
📅 Date: ${new Date().toLocaleDateString('en-IN')}
💻 Device: ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
🌐 Browser: ${navigator.userAgent.split('/').pop().split(' ')[0]}

If this wasn't you, please contact support immediately.

Best regards,
VoiceBox Security Team
        `
    };

    // Send email via Web3Forms
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
                console.log('✅ Email notification sent to:', userEmail);
                showToast('📧 Login alert sent to your email!');
            } else {
                console.log('📧 Email demo mode (get free key at web3forms.com)');
                simulateEmailNotification(userName, userEmail);
            }
        })
        .catch(error => {
            console.log('📧 Email preview (console):', error);
            simulateEmailNotification(userName, userEmail);
        });
}

// Get FREE Web3Forms key:
// 1. Go to: https://web3forms.com/
// 2. Enter email: jainmalik70@gmail.com
// 3. Get instant access key
// 4. Replace above access_key
// Done! No verification needed!
