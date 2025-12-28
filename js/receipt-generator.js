// Receipt Generator for successful payments
function showPaymentSlip(payment) {
    console.log('📄 Generating payment slip:', payment);

    const modal = document.getElementById('receiptModal');
    if (!modal) return;

    // Fill data
    document.getElementById('receiptId').textContent = '#' + (payment.id || Date.now().toString().slice(-6));
    document.getElementById('receiptAmount').textContent = payment.amount;

    const isReceived = payment.type === 'received';
    const personName = isReceived ? (payment.sender || 'Sender') : (payment.recipientName || payment.recipient || 'Recipient');

    document.getElementById('receiptRecipient').textContent = personName;
    document.getElementById('receiptTime').textContent = new Date(payment.timestamp || Date.now()).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('receiptNote').textContent = payment.note || 'No notes added';

    // Store current payment for download
    window.currentReceipt = payment;

    // Show modal
    modal.classList.remove('hidden');

    // Play success sound
    if (typeof playPaymentSound === 'function') playPaymentSound();
}

function closeReceiptModal() {
    const modal = document.getElementById('receiptModal');
    if (modal) modal.classList.add('hidden');
}

function downloadReceipt() {
    const payment = window.currentReceipt;
    if (!payment) return;

    // Simple text receipt download
    const receiptText = `
------------------------------------------
         VOICEBOX PAYMENT RECEIPT
------------------------------------------
Transaction ID: #${payment.id}
Date: ${new Date(payment.timestamp).toLocaleString()}
Status: SUCCESSFUL
------------------------------------------
${isReceived ? 'Sender' : 'Recipient'}: ${personName}
Amount: ₹ ${payment.amount}
Note: ${payment.note || '-'}
------------------------------------------
   Thank you for using VoiceBox!
------------------------------------------
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${payment.id}.txt`;
    link.click();

    showToast('✅ Receipt downloaded!');
}

// Export to window
window.showPaymentSlip = showPaymentSlip;
window.closeReceiptModal = closeReceiptModal;
window.downloadReceipt = downloadReceipt;

console.log('📄 Receipt generator loaded');
