// ===== PDF DOWNLOAD FUNCTION =====

// Rename existing function
window.downloadPaymentHistoryCSV = window.downloadPaymentHistory || function () {
    alert('CSV download not available');
};

// Add PDF download
window.downloadPaymentHistoryPDF = function () {
    const history = JSON.parse(localStorage.getItem('payment_history') || '[]');

    if (history.length === 0) {
        alert('No transactions to download');
        return;
    }

    const totalReceived = history.filter(p => p.type === 'received').reduce((s, p) => s + parseInt(p.amount || 0), 0);
    const totalSent = history.filter(p => p.type === 'sent').reduce((s, p) => s + parseInt(p.amount || 0), 0);

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Payment History</title>
<style>
body{font-family:Arial,sans-serif;margin:20px;font-size:12px}
.header{text-align:center;margin-bottom:20px;border-bottom:3px solid #3b82f6;padding-bottom:10px}
h1{color:#1e40af;margin:0 0 10px}
.summary{background:#f0f9ff;padding:15px;border-radius:8px;margin:20px 0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;text-align:center}
.summary div{font-size:10px;color:#666}
.summary .val{font-size:18px;font-weight:bold;margin-top:5px}
.green{color:#10b981}.orange{color:#f59e0b}.blue{color:#3b82f6}
table{width:100%;border-collapse:collapse;margin-top:10px}
th{background:#3b82f6;color:white;padding:8px;text-align:left;font-size:10px}
td{padding:6px;border-bottom:1px solid #e5e7eb;font-size:10px}
.badge{padding:2px 6px;border-radius:3px;font-size:9px;font-weight:bold}
.rec{background:#d1fae5;color:#065f46}.sent{background:#fed7aa;color:#92400e}
@media print{body{margin:0;padding:10mm}}
</style></head><body>
<div class="header">
<h1>💰 VoiceBox Payment History</h1>
<p>Generated: ${new Date().toLocaleString('en-IN')}</ | Transactions: ${history.length}</p>
</div>
<div class="summary">
<div>Total Received<div class="val green">₹${totalReceived}</div></div>
<div>Total Sent<div class="val orange">₹${totalSent}</div></div>
<div>Net Balance<div class="val blue">₹${totalReceived - totalSent}</div></div>
</div>
<table><thead><tr><th>#</th><th>Date</th><th>Time</th><th>Type</th><th>Amount</th><th>Person</th><th>UPI</th><th>Note</th></tr></thead><tbody>
${history.map((p, i) => {
        const d = new Date(p.timestamp);
        return `<tr><td>${i + 1}</td><td>${d.toLocaleDateString('en-IN')}</td><td>${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td><td><span class="badge ${p.type == 'received' ? 'rec' : 'sent'}">${p.type.toUpperCase()}</span></td><td><b>₹${p.amount}</b></td><td>${p.type == 'received' ? p.sender : (p.recipientName || p.recipient) || 'Unknown'}</td><td>${p.senderUpi || p.recipient || 'N/A'}</td><td>${p.note || '-'}</td></tr>`;
    }).join('')}
</tbody></table>
<div style="margin-top:20px;text-align:center;color:#999;font-size:9px;border-top:1px solid #eee;padding-top:10px">
© VoiceBox Payment System - Computer Generated Document
</div></body></html>`;

    const w = window.open('', '_blank', 'width=800,height=600');
    w.document.write(html);
    w.document.close();
    w.onload = () => setTimeout(() => w.print(), 200);

    showToast('✅ PDF ready! Save as PDF in print dialog');
    console.log('📄 PDF ready for', history.length, 'transactions');
};

console.log('📄 PDF download module loaded');
