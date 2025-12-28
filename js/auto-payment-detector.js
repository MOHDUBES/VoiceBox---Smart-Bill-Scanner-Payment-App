// ===== AUTOMATIC PAYMENT DETECTION SYSTEM =====
// Simulates real UPI payment notifications

// Start monitoring for payments after QR generation
function startPaymentMonitoring(qrAmount, qrUpiId) {
    console.log('📡 Payment monitoring started for ₹' + qrAmount);

    // Store current QR details
    window.currentQR = {
        amount: qrAmount,
        upiId: qrUpiId,
        timestamp: Date.now()
    };

    // Simulate real-world: Random payment after 5-15 seconds
    const randomDelay = 5000 + Math.random() * 10000; // 5-15 seconds

    setTimeout(() => {
        // Simulate real UPI payment from random customer
        simulateRealPayment(qrAmount);
    }, randomDelay);

    showToast('💰 Waiting for payment... QR active');
}

// Simulate realistic payment from customer
function simulateRealPayment(amount) {
    // Random customer names (realistic Indian names)
    const customers = [
        { name: 'Rajesh Kumar', upi: '9876543210@paytm' },
        { name: 'Priya Sharma', upi: '9123456789@phonepe' },
        { name: 'Amit Patel', upi: '9988776655@paytm' },
        { name: 'Sneha Singh', upi: '9876123450@gpay' },
        { name: 'Vikram Reddy', upi: '9012345678@paytm' },
        { name: 'Rahul Verma', upi: '9898989898@phonepe' },
        { name: 'Anjali Gupta', upi: '9765432101@paytm' },
        { name: 'Karan Mehta', upi: '9123987654@gpay' },
        { name: 'Pooja Iyer', upi: '9845612378@paytm' },
        { name: 'Arjun Nair', upi: '9009876543@phonepe' }
    ];

    // Pick random customer
    const customer = customers[Math.floor(Math.random() * customers.length)];

    console.log('💰 Payment detected from:', customer.name);

    // Auto-trigger payment received
    if (typeof simulatePaymentReceived === 'function') {
        simulatePaymentReceived(amount, customer.name, customer.upi);
    }
}

// Monitor send payments too
function monitorSendPayment(amount, recipient) {
    console.log('📡 Monitoring send payment to:', recipient);

    // After 3 seconds, auto-mark as paid (simulate customer scanning and paying)
    setTimeout(() => {
        showToast('💳 Payment detected! Customer has paid ₹' + amount);
        console.log('Payment received from customer');
    }, 3000);
}

// Export functions
window.startPaymentMonitoring = startPaymentMonitoring;
window.monitorSendPayment = monitorSendPayment;

console.log('📡 Auto payment monitoring system loaded');
