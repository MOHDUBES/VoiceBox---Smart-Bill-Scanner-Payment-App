// Auto-load account details when page loads
(function () {
    console.log('🔄 Account auto-loader initialized');

    // Wait for DOM and currentUser
    function initAccountAutoLoad() {
        if (typeof currentUser === 'undefined' || !currentUser) {
            console.log('⏳ Waiting for user login...');
            setTimeout(initAccountAutoLoad, 500);
            return;
        }

        console.log('✅ User logged in:', currentUser.email);

        // Load saved bank details automatically
        if (typeof loadBankDetailsSimple === 'function') {
            loadBankDetailsSimple();
            console.log('✅ Bank details auto-loaded');
        }

        // Generate QR if details exist
        const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
        const user = users.find(u => u.email === currentUser.email);

        if (user && user.bankDetails && user.bankDetails.upiId) {
            console.log('✅ Found saved bank details for:', currentUser.email);

            setTimeout(() => {
                if (typeof generatePersonalQRSimple === 'function') {
                    generatePersonalQRSimple();
                    console.log('✅ QR auto-generated');
                }
            }, 800);
        } else {
            console.log('ℹ️ No saved bank details found');
        }
    }

    // Start auto-load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initAccountAutoLoad, 1000);
        });
    } else {
        setTimeout(initAccountAutoLoad, 1000);
    }
})();

console.log('📥 Account auto-load module ready');
