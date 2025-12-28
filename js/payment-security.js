// Payment Security - PIN Protection System
const PaymentSecurity = {
    get PIN() {
        return localStorage.getItem('paymentPIN');
    },
    set PIN(val) {
        localStorage.setItem('paymentPIN', val);
    },

    init() {
        this.setupPinInputs();
        console.log('🔐 Payment security initialized');
    },

    setupPinInputs() {
        const inputs = document.querySelectorAll('.pin-input');
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });
    },

    clearInputs() {
        document.querySelectorAll('.pin-input').forEach(input => input.value = '');
        document.getElementById('pinError').style.display = 'none';
    },

    getEnteredPIN() {
        let pin = '';
        document.querySelectorAll('.pin-input').forEach(input => pin += input.value);
        return pin;
    },

    verifyAction(callback) {
        const modal = document.getElementById('paymentPinModal');
        const title = document.getElementById('pinModalTitle');
        const desc = document.getElementById('pinModalDesc');
        const submitBtn = document.getElementById('pinSubmitBtn');

        this.clearInputs();
        modal.classList.remove('hidden');
        document.getElementById('pin1').focus();

        if (!this.PIN) {
            // First time setup
            title.textContent = '🆕 Set Payment PIN';
            desc.textContent = 'Set a 4-digit security PIN for payments';
            submitBtn.textContent = 'Set PIN';

            submitBtn.onclick = () => {
                const pin = this.getEnteredPIN();
                if (pin.length === 4) {
                    this.PIN = pin;
                    showToast('✅ Security PIN set successfully!');
                    modal.classList.add('hidden');
                    if (callback) callback();
                } else {
                    document.getElementById('pinError').textContent = '⚠️ Please enter 4 digits';
                    document.getElementById('pinError').style.display = 'block';
                }
            };
        } else {
            // Verify existing
            title.textContent = '🔐 Security Verification';
            desc.textContent = 'Enter your 4-digit PIN to continue';
            submitBtn.textContent = 'Verify';

            submitBtn.onclick = () => {
                const entered = this.getEnteredPIN();
                if (entered === this.PIN) {
                    modal.classList.add('hidden');
                    if (callback) callback();
                } else {
                    document.getElementById('pinError').textContent = '❌ Incorrect PIN. Try again.';
                    document.getElementById('pinError').style.display = 'block';
                    this.clearInputs();
                    document.getElementById('pin1').focus();
                }
            };
        }
    }
};

// Global helpers
window.closePinModal = () => {
    document.getElementById('paymentPinModal').classList.add('hidden');
};

// Export verify function globally
window.requirePaymentPIN = (callback) => {
    PaymentSecurity.verifyAction(callback);
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    PaymentSecurity.init();
});
