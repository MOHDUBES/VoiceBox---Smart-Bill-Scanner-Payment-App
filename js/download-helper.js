// ===== IMPROVED DOWNLOAD WITH EXCEL SUPPORT =====

// Download payment history as properly formatted CSV/Excel file
window.downloadPaymentHistory = function () {
    const history = JSON.parse(localStorage.getItem('payment_history') || '[]');

    if (history.length === 0) {
        alert('❌ No transactions to download!\n\nMake some payments first.');
        return;
    }

    console.log('📥 Preparing download for', history.length, 'transactions');

    // Add BOM for Excel UTF-8 support (makes ₹ symbol work in Excel)
    const BOM = '\uFEFF';

    // Create detailed CSV with clear headers
    let csv = BOM;
    csv += 'Sr No,Date,Time,Transaction Type,Amount (INR),Person NameUPI/Phone,Description,Transaction ID\n';

    history.forEach((payment, index) => {
        const date = new Date(payment.timestamp);
        const dateStr = date.toLocaleDateString('en-IN');
        const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const srNo = index + 1;
        const type = payment.type === 'received' ? 'RECEIVED' : 'SENT';
        const amount = payment.amount;
        const person = payment.type === 'received' ?
            (payment.sender || 'Unknown') :
            (payment.recipientName || payment.recipient || 'Unknown');
        const upi = payment.senderUpi || payment.recipient || 'N/A';
        const note = (payment.note || 'No description').replace(/"/g, '""'); // Escape quotes
        const id = payment.id;

        csv += `${srNo},"${dateStr}","${timeStr}","${type}","${amount}","${person}","${upi}","${note}","${id}"\n`;
    });

    // Add summary
    const totalReceived = history.filter(p => p.type === 'received').reduce((s, p) => s + parseInt(p.amount || 0), 0);
    const totalSent = history.filter(p => p.type === 'sent').reduce((s, p) => s + parseInt(p.amount || 0), 0);

    csv += '\n';
    csv += ',,,,SUMMARY,,,,\n';
    csv += `,,,,Total Transactions,"${history.length}",,,,\n`;
    csv += `,,,,Total Received,"${totalReceived}",,,,\n`;
    csv += `,,,,Total Sent,"${totalSent}",,,,\n`;
    csv += `,,,,Net Balance,"${totalReceived - totalSent}",,,,\n`;

    try {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = `VoiceBox-Payments-${new Date().toISOString().split('T')[0]}.csv`;

        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

        showToast(`✅ Downloaded ${history.length} transactions!`);
        console.log('✅ Download successful:', filename);

    } catch (error) {
        console.error('❌ Download error:', error);
        alert('Download failed: ' + error.message);
    }
};

console.log('📥 Download module ready');
