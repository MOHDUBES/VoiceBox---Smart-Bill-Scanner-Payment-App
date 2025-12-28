// ===== PAYMENT NOTIFICATION & HISTORY SYSTEM =====

// Initialize payment notification system
function initializePaymentNotifications() {
    console.log('💰 Payment notification system initialized');

    // Setup history tabs
    setupHistoryTabs();

    // Setup payment filter
    setupPaymentFilter();

    // Load payment history on page load
    loadPaymentHistory();

    // Hook into payment form submission
    setupPaymentFormHook();

    // Simulate UPI payment received (for demo)
    window.simulatePaymentReceived = function (amount, senderName, senderUpi) {
        const payment = {
            type: 'received',
            amount: amount || 800,
            sender: senderName || 'Customer',
            senderUpi: senderUpi || 'customer@upi',
            timestamp: new Date().toISOString(),
            id: 'REC' + Date.now()
        };

        handlePaymentReceived(payment);
    };

    // Add "Test Payment" button to payment section
    addTestPaymentButton();
}

// Setup history tabs switching
function setupHistoryTabs() {
    const tabBtns = document.querySelectorAll('[data-history-tab]');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.historyTab;

            // Update active button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show corresponding content
            document.getElementById('billsHistory').style.display = tab === 'bills' ? 'block' : 'none';
            document.getElementById('paymentsHistory').style.display = tab === 'payments' ? 'block' : 'none';

            if (tab === 'payments') {
                loadPaymentHistory();
            }
        });
    });
}

// Setup payment filter
function setupPaymentFilter() {
    const filter = document.getElementById('paymentFilter');
    if (filter) {
        filter.addEventListener('change', () => {
            loadPaymentHistory(filter.value);
        });
    }

    const clearBtn = document.getElementById('clearPaymentsBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Clear all payment history?')) {
                localStorage.removeItem('payment_history');
                loadPaymentHistory();
                showToast('Payment history cleared');
            }
        });
    }
}

// Hook into send payment form - REMOVED redundant hook (handled in app.js)
function setupPaymentFormHook() {
    console.log('🔗 Redundant payment hook disabled (using app.js logic)');
}

// Handle when payment is RECEIVED
function handlePaymentReceived(payment) {
    console.log('✅ Payment received:', payment);

    // Voice announcement
    const voiceMessage = `Payment received! Rupees ${payment.amount} from ${payment.sender}. Transaction successful.`;
    speakText(voiceMessage);

    // Show notification
    showPaymentNotification(payment, 'received');

    // Show professional receipt slip
    if (typeof showPaymentSlip === 'function') {
        setTimeout(() => {
            showPaymentSlip(payment);
        }, 800);
    }

    // Save to history
    saveToPaymentHistory(payment);

    // Update stats
    updatePaymentStats(payment.amount, 'received');

    // Reload history if on that tab
    loadPaymentHistory();
}

// Handle when payment is SENT
function handlePaymentSent(payment) {
    console.log('💸 Payment sent:', payment);

    // Voice announcement
    const voiceMessage = `Payment sent! Rupees ${payment.amount} to ${payment.recipient}. Transaction successful.`;
    speakText(voiceMessage);

    // Show notification
    showPaymentNotification(payment, 'sent');

    // Show professional receipt slip (New!)
    if (typeof showPaymentSlip === 'function') {
        setTimeout(() => {
            showPaymentSlip(payment);
        }, 800);
    }

    // Save to history
    saveToPaymentHistory(payment);

    // Update stats
    updatePaymentStats(payment.amount, 'sent');

    // Clear form
    document.getElementById('amount').value = '';
    document.getElementById('recipient').value = '';
    document.getElementById('note').value = '';

    // Reload history
    loadPaymentHistory();
}

// Show visual notification
function showPaymentNotification(payment, type) {
    const isReceived = type === 'received';
    const bgColor = isReceived ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    const icon = isReceived ? '💰' : '💸';
    const title = isReceived ? 'Payment Received!' : 'Payment Sent!';
    const subtitle = isReceived ? `From: ${payment.sender}` : `To: ${payment.recipient}`;

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        min-width: 300px;
        animation: slideInRight 0.5s ease;
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 40px;">${icon}</div>
            <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 18px; margin-bottom: 5px;">
                    ${title}
                </div>
                <div style="font-size: 16px; margin-bottom: 3px;">
                    Amount: ₹${payment.amount}
                </div>
                <div style="font-size: 14px; opacity: 0.9;">
                    ${subtitle}
                </div>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">
                    ${new Date(payment.timestamp).toLocaleTimeString('en-IN')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 6000);

    playPaymentSound();
}

// Save to payment history
function saveToPaymentHistory(payment) {
    const history = JSON.parse(localStorage.getItem('payment_history') || '[]');
    history.unshift(payment);

    if (history.length > 100) history.pop();

    localStorage.setItem('payment_history', JSON.stringify(history));
    console.log('💾 Payment saved to history');
}

// Load and display payment history
function loadPaymentHistory(filter = 'all') {
    const history = JSON.parse(localStorage.getItem('payment_history') || '[]');
    const container = document.getElementById('paymentHistoryList');
    const emptyState = document.getElementById('emptyPaymentState');

    console.log('📊 Loading payment history, found', history.length, 'transactions');
    console.log('Filter:', filter);

    if (!container) {
        console.error('❌ paymentHistoryList container not found!');
        return;
    }
    if (!emptyState) {
        console.error('❌ emptyPaymentState not found!');
        return;
    }

    let filtered = history;
    if (filter === 'received') {
        filtered = history.filter(p => p.type === 'received');
    } else if (filter === 'sent') {
        filtered = history.filter(p => p.type === 'sent');
    }

    console.log('Filtered results:', filtered.length);

    if (filtered.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'flex';
        console.log('No payments to display');
        return;
    }

    container.style.display = 'block';
    emptyState.style.display = 'none';

    // Calculate totals
    const totalReceived = history
        .filter(p => p.type === 'received')
        .reduce((sum, p) => sum + parseInt(p.amount || 0), 0);

    const totalSent = history
        .filter(p => p.type === 'sent')
        .reduce((sum, p) => sum + parseInt(p.amount || 0), 0);

    // Add summary card with FIXED COLORS
    const summaryHTML = `
        <div class="card" style="margin-bottom: 1.5rem; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);">
            <h4 style="margin: 0 0 1rem; font-size: 1.1rem; color: white;">💰 Payment Summary</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="text-align: center; padding: 1rem; background: rgba(255,255,255,0.2); border-radius: 8px; backdrop-filter: blur(10px);">
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Total Received</div>
                    <div style="font-size: 1.8rem; font-weight: bold; color: #6ee7b7;">₹${totalReceived}</div>
                </div>
                <div style="text-align: center; padding: 1rem; background: rgba(255,255,255,0.2); border-radius: 8px; backdrop-filter: blur(10px);">
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Total Sent</div>
                    <div style="font-size: 1.8rem; font-weight: bold; color: #fbbf24;">₹${totalSent}</div>
                </div>
            </div>
            <div style="margin-top: 1rem; text-align: center; padding: 0.75rem; background: rgba(255,255,255,0.25); border-radius: 6px; backdrop-filter: blur(10px);">
                <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9);">Net Balance</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: white;">₹${totalReceived - totalSent}</div>
            </div>
        </div>
    `;

    container.innerHTML = summaryHTML + filtered.map((payment, index) => {
        const isReceived = payment.type === 'received';
        const icon = isReceived ? '↓' : '↑';
        const color = isReceived ? '#10b981' : '#f59e0b';
        const label = isReceived ? 'Received from' : 'Sent to';
        const person = isReceived ? (payment.sender || 'Unknown') : (payment.recipientName || payment.recipient || 'Unknown');

        return `
            <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${color}; animation: slideInUp 0.3s ease ${index * 0.05}s both; position: relative; background: #1a1a2e; padding: 1.25rem; border-radius: 12px;">
                <button onclick="deleteTransaction('${payment.id}')" style="position: absolute; top: 12px; right: 12px; background: transparent; color: #6b6b7e; border: none; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; opacity: 0.6; padding: 0;" onmouseover="this.style.opacity='1'; this.querySelector('svg').style.fill='#ef4444'" onmouseout="this.style.opacity='0.6'; this.querySelector('svg').style.fill='#6b6b7e'" title="Delete">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b6b7e" style="transition: fill 0.15s;">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem; padding-right: 45px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <span style="font-size: 24px; color: ${color};">${icon}</span>
                            <div>
                                <div style="font-weight: bold; color: ${color}; font-size: 0.9rem;">${payment.type.toUpperCase()}</div>
                                <div style="font-size: 0.85rem; color: #a0a0b8;">${label}</div>
                            </div>
                        </div>
                        <div style="font-size: 1rem; font-weight: 600; margin-bottom: 4px; color: #ffffff;">${person}</div>
                        ${payment.senderUpi || payment.recipient ? `
                            <div style="font-size: 0.75rem; color: #6b6b7e; margin-bottom: 4px;">
                                ${payment.senderUpi || payment.recipient}
                            </div>
                        ` : ''}
                        <div style="font-size: 0.8rem; color: #a0a0b8;">
                            ${new Date(payment.timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}
                        </div>
                        ${payment.note ? `<div style="font-size: 0.85rem; color: #a0a0b8; margin-top: 6px; padding: 8px; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">${payment.note}</div>` : ''}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.8rem; font-weight: bold; color: ${color};">
                            ₹${payment.amount}
                        </div>
                        <div style="font-size: 0.7rem; color: #6b6b7e; margin-top: 4px; font-family: monospace;">
                            ${payment.id}
                        </div>
                        <button onclick="viewHistorySlip('${payment.id}')" style="margin-top: 10px; padding: 6px 12px; font-size: 0.8rem; border-radius: 6px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.2s; white-space: nowrap; width: 100%;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            View Slip
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Global helper for viewing history slips
window.viewHistorySlip = function (id) {
    const history = JSON.parse(localStorage.getItem('payment_history') || '[]');
    const transaction = history.find(p => p.id === id);
    if (transaction && typeof showPaymentSlip === 'function') {
        showPaymentSlip(transaction);
    } else {
        showToast('❌ Unable to find transaction slip');
    }
};

console.log('✅ Payment history displayed successfully');

// Download payment history as CSV
window.downloadPaymentHistory = function () {
    const history = JSON.parse(localStorage.getItem('payment_history') || '[]');

    if (history.length === 0) {
        alert('No transactions to download');
        return;
    }

    // Add BOM for Excel UTF-8 encoding
    const BOM = '\uFEFF';

    // Create CSV with simple, readable format
    let csv = BOM + 'Date,Time,Type,Amount,Person,UPI_ID,Note,Transaction_ID\r\n';

    history.forEach(payment => {
        const date = new Date(payment.timestamp);

        // Simple date format: DD-MM-YYYY (no slashes to avoid Excel formula issues)
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dateStr = `${day}-${month}-${year}`;

        // Simple time format: HH:MM
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        const type = payment.type.toUpperCase();
        const amount = payment.amount;
        const person = payment.type === 'received' ?
            (payment.sender || 'Unknown') :
            (payment.recipientName || payment.recipient || 'Unknown');
        const upi = (payment.senderUpi || payment.recipient || 'N/A').replace(/,/g, ' ');
        const note = (payment.note || '').replace(/,/g, ' ');
        const id = payment.id;

        csv += `${dateStr},${timeStr},${type},${amount},${person},${upi},${note},${id}\r\n`;
    });

    // Add summary
    const totalReceived = history.filter(p => p.type === 'received').reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
    const totalSent = history.filter(p => p.type === 'sent').reduce((sum, p) => sum + parseInt(p.amount || 0), 0);

    csv += '\r\n';
    csv += `SUMMARY,,,,,,\r\n`;
    csv += `Total Transactions,${history.length},,,,\r\n`;
    csv += `Total Received,Rs ${totalReceived},,,,\r\n`;
    csv += `Total Sent,Rs ${totalSent},,,,\r\n`;
    csv += `Net Balance,Rs ${totalReceived - totalSent},,,,\r\n`;

    // Create download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `payment-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✅ Payment history downloaded!');
    console.log('📥 Downloaded', history.length, 'transactions');
    console.log('✅ Date format: DD-MM-YYYY, Time format: HH:MM');
};

// Alias for CSV download (same function, different name for button)
window.downloadPaymentHistoryCSV = window.downloadPaymentHistory;

// Download payment history as PDF
window.downloadPaymentHistoryPDF = function () {
    const history = JSON.parse(localStorage.getItem('payment_history') || '[]');

    if (history.length === 0) {
        alert('No transactions to download');
        return;
    }

    const totalReceived = history.filter(p => p.type === 'received').reduce((s, p) => s + parseInt(p.amount || 0), 0);
    const totalSent = history.filter(p => p.type === 'sent').reduce((s, p) => s + parseInt(p.amount || 0), 0);

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Payment History - VoiceBox</title>
<style>
body{font-family:Arial,sans-serif;padding:20px;font-size:12px}
.header{text-align:center;margin-bottom:20px;border-bottom:3px solid #3b82f6;padding-bottom:15px}
h1{color:#1e40af;margin:0;font-size:24px}
.summary{background:#f0f9ff;padding:15px;border-radius:8px;margin:20px 0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;text-align:center}
.summary div{font-size:10px;color:#666}
.val{font-size:20px;font-weight:bold;margin-top:5px}
.green{color:#10b981}.orange{color:#f59e0b}.blue{color:#3b82f6}
table{width:100%;border-collapse:collapse;margin-top:10px}
th{background:#3b82f6;color:white;padding:10px 8px;text-align:left;font-size:11px}
td{padding:8px 6px;border-bottom:1px solid #e5e7eb;font-size:11px}
tr:nth-child(even){background:#f9fafb}
.badge{padding:3px 8px;border-radius:4px;font-size:10px;font-weight:bold}
.rec{background:#d1fae5;color:#065f46}.sent{background:#fed7aa;color:#92400e}
.amt{font-weight:bold;font-size:12px}
.footer{margin-top:30px;text-align:center;color:#999;font-size:10px;border-top:1px solid #e5e7eb;padding-top:15px}
@media print{body{padding:15mm}}
</style></head><body>
<div class="header">
<h1>💰 VoiceBox Payment History</h1>
<p style="margin:5px 0;color:#666;">Generated: ${new Date().toLocaleString('en-IN')}</p>
<p style="margin:5px 0;color:#666;">Total Transactions: ${history.length}</p>
</div>
<div class="summary">
<div>Total Received<div class="val green">₹${totalReceived}</div></div>
<div>Total Sent<div class="val orange">₹${totalSent}</div></div>
<div>Net Balance<div class="val blue">₹${totalReceived - totalSent}</div></div>
</div>
<table><thead><tr><th>#</th><th>Date</th><th>Time</th><th>Type</th><th>Amount</th><th>Person</th><th>UPI/ID</th><th>Note</th></tr></thead><tbody>
${history.map((p, i) => {
        const d = new Date(p.timestamp);
        const dateStr = d.toLocaleDateString('en-IN');
        const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const isRec = p.type === 'received';
        const person = isRec ? p.sender : (p.recipientName || p.recipient) || 'Unknown';
        const upi = p.senderUpi || p.recipient || 'N/A';
        return `<tr><td>${i + 1}</td><td>${dateStr}</td><td>${timeStr}</td><td><span class="badge ${isRec ? 'rec' : 'sent'}">${p.type.toUpperCase()}</span></td><td class="amt">₹${p.amount}</td><td>${person}</td><td style="font-size:9px">${upi}</td><td>${p.note || '-'}</td></tr>`;
    }).join('')}
</tbody></table>
<div class="footer">
<p>This is a computer-generated document. No signature required.</p>
<p>© VoiceBox Payment System - Secure Transaction Records</p>
</div></body></html>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) {
        alert('⚠️ Please allow popups to download PDF!\n\nClick PDF button again after allowing popups.');
        return;
    }
    w.document.write(html);
    w.document.close();
    w.onload = () => {
        setTimeout(() => {
            w.print();
            showToast('✅ PDF ready! Select "Save as PDF" in print dialog');
        }, 300);
    };

    console.log('📄 PDF print dialog opened for', history.length, 'transactions');
}


// Delete individual transaction
window.deleteTransaction = function (transactionId) {
    if (typeof requirePaymentPIN === 'function') {
        requirePaymentPIN(() => {
            if (confirm('Delete this transaction?')) {
                performDeletion(transactionId);
            }
        });
    } else {
        if (confirm('Delete this transaction?')) {
            performDeletion(transactionId);
        }
    }
};

function performDeletion(transactionId) {
    let history = JSON.parse(localStorage.getItem('payment_history') || '[]');
    const before = history.length;

    history = history.filter(p => p.id !== transactionId);

    if (history.length < before) {
        localStorage.setItem('payment_history', JSON.stringify(history));
        loadPaymentHistory();
        showToast('✅ Transaction deleted');
        console.log('🗑️ Deleted transaction:', transactionId);
    } else {
        alert('Transaction not found');
    }
}

// Add slideInUp animation
const historyStyle = document.createElement('style');
historyStyle.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(historyStyle);


// Update payment statistics
function updatePaymentStats(amount, type) {
    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex !== -1) {
        if (!users[userIndex].stats) {
            users[userIndex].stats = {};
        }

        const currentTotal = parseInt(users[userIndex].stats.totalPayments || 0);
        const newTotal = type === 'received' ? currentTotal + parseInt(amount) : currentTotal;
        users[userIndex].stats.totalPayments = newTotal.toString();
        users[userIndex].stats.lastPaymentDate = new Date().toISOString();

        localStorage.setItem('voicebox_users', JSON.stringify(users));
        console.log('📊 Stats updated');
    }
}

// Play payment received sound
function playPaymentSound() {
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContextClass();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not available');
        }
    }
}

// Add test payment button
function addTestPaymentButton() {
    setTimeout(() => {
        const qrDisplay = document.getElementById('qrDisplay');
        if (!qrDisplay || document.getElementById('testPaymentBtn')) return;

        const testBtn = document.createElement('button');
        testBtn.id = 'testPaymentBtn';
        testBtn.className = 'btn-secondary';
        testBtn.style.cssText = 'margin-top: 10px; width: 100%; background: #f59e0b; color: white;';
        testBtn.innerHTML = '🧪 Simulate Payment Received';
        testBtn.onclick = function () {
            const amount = document.getElementById('qrAmount')?.value || '100';
            const customerName = prompt('Customer name:', 'Rajesh Kumar') || 'Customer';
            const customerUpi = prompt('Customer UPI (optional):', '9876543210@paytm') || 'customer@upi';

            simulatePaymentReceived(amount, customerName, customerUpi);
        };

        qrDisplay.appendChild(testBtn);
        console.log('🧪 Test payment button added');
    }, 1000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePaymentNotifications);
} else {
    initializePaymentNotifications();
}

console.log('💳 Payment notification module loaded');
