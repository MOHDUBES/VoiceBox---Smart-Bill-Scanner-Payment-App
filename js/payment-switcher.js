// Helper function to switch to payment tab
function switchToPaymentTab() {
    console.log('🔄 Switching to Payment tab...');

    // Find the payment tab button
    const paymentBtn = document.querySelector('[data-section="payment"]');

    if (paymentBtn) {
        // Click the button to switch tabs
        paymentBtn.click();

        // Scroll to top smoothly
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Focus on amount input if exists
            setTimeout(() => {
                const amountInput = document.getElementById('amount');
                if (amountInput) {
                    amountInput.focus();
                }
            }, 500);
        }, 100);

        console.log('✅ Switched to Payment tab');
        showToast('💸 Ready to send payment!');
    } else {
        console.error('❌ Payment button not found!');
        alert('Payment section not found. Please refresh the page.');
    }
}

console.log('💸 Payment tab switcher ready');
