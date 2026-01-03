// Enhanced History with Reporting & Download
(function () {
    console.log('📊 Enhanced History Module Loaded');

    // Enhanced display function for reporting style
    window.displayBillHistoryReport = function () {
        const historyContainer = document.getElementById('historyContainer');
        if (!historyContainer) {
            console.warn('History container not found');
            return;
        }

        const bills = JSON.parse(localStorage.getItem('scannedBills')) || [];

        if (bills.length === 0) {
            historyContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #94a3b8;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin: 0 auto 1rem;">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h3 style="color: #64748b; margin-bottom: 0.5rem;">No Bills Yet</h3>
                    <p>Scan your first bill to see history</p>
                </div>
            `;
            return;
        }

        // Create report header with download button
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem;">📊 Bill History Report</h2>
                    <p style="margin: 0.5rem 0 0 0; opacity: 0.9; font-size: 0.9rem;">Total Bills: ${bills.length}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="downloadHistoryCSV()" style="padding: 0.7rem 1.2rem; background: white; color: #667eea; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        📥 Download CSV
                    </button>
                    <button onclick="downloadHistoryPDF()" style="padding: 0.7rem 1.2rem; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        📄 Download PDF
                    </button>
                </div>
            </div>

            <div style="overflow-x: auto; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #475569;">#</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #475569;">Bill ID</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #475569;">Date</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #475569;">Preview</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #475569;">Amount</th>
                            <th style="padding: 1rem; text-align: center; font-weight: 600; color: #475569;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Loop backwards to show newest first, but keep stable IDs based on original index
        for (let i = bills.length - 1; i >= 0; i--) {
            const bill = bills[i];
            // Use consistent ID format: scan_1, scan_2 etc. (based on original index)
            const billId = bill.id || `scan_${i + 1}`;

            const date = bill.timestamp ? new Date(bill.timestamp).toLocaleString() : 'Invalid Date';
            const preview = bill.text ? bill.text.substring(0, 80) + '...' : 'No text';

            // Extract amount
            let amount = 'N/A';
            const amountMatch = bill.text?.match(/(?:₹|Rs\.?|INR)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
            if (amountMatch) {
                amount = '₹' + amountMatch[1];
            }

            html += `
                <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                    <td style="padding: 1rem; color: #64748b;">${i + 1}</td>
                    <td style="padding: 1rem; font-weight: 600; color: #334155;">${billId}</td>
                    <td style="padding: 1rem; color: #64748b; font-size: 0.9rem;">${date}</td>
                    <td style="padding: 1rem; color: #64748b; font-size: 0.85rem; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${preview}</td>
                    <td style="padding: 1rem; font-weight: 600; color: #10b981;">${amount}</td>
                    <td style="padding: 1rem; text-align: center;">
                        <button onclick="viewBillDetails('${billId}')" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 5px; font-size: 0.85rem;">
                            👁️ View
                        </button>
                        <button onclick="deleteBill('${billId}')" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                            🗑️ Delete
                        </button>
                    </td>
                </tr>
            `;
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        historyContainer.innerHTML = html;
    };

    // Download as CSV
    window.downloadHistoryCSV = function () {
        const bills = JSON.parse(localStorage.getItem('scannedBills')) || [];
        if (bills.length === 0) {
            alert('No bills to download!');
            return;
        }

        let csv = 'Bill ID,Date,Text,Amount\n';

        bills.forEach((bill, index) => {
            const billId = bill.id || `scan_${index + 1}`;
            const date = bill.timestamp ? new Date(bill.timestamp).toLocaleString() : 'Invalid Date';
            const text = (bill.text || '').replace(/"/g, '""').replace(/\n/g, ' ');

            // Extract amount
            let amount = 'N/A';
            const amountMatch = bill.text?.match(/(?:₹|Rs\.?|INR)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
            if (amountMatch) {
                amount = amountMatch[1];
            }

            csv += `"${billId}","${date}","${text}","${amount}"\n`;
        });

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bill_history_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('✅ CSV Downloaded!');
    };

    // Download as PDF (simple text-based)
    window.downloadHistoryPDF = function () {
        const bills = JSON.parse(localStorage.getItem('scannedBills')) || [];
        if (bills.length === 0) {
            alert('No bills to download!');
            return;
        }

        let pdfContent = 'BILL HISTORY REPORT\n';
        pdfContent += '='.repeat(80) + '\n\n';
        pdfContent += `Generated: ${new Date().toLocaleString()}\n`;
        pdfContent += `Total Bills: ${bills.length}\n\n`;

        bills.forEach((bill, index) => {
            const billId = bill.id || `scan_${index + 1}`;
            const date = bill.timestamp ? new Date(bill.timestamp).toLocaleString() : 'Invalid Date';

            pdfContent += '-'.repeat(80) + '\n';
            pdfContent += `Bill #${index + 1}: ${billId}\n`;
            pdfContent += `Date: ${date}\n`;
            pdfContent += `Content:\n${bill.text || 'No text'}\n\n`;
        });

        // Download as text file (PDF generation requires library)
        const blob = new Blob([pdfContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bill_history_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('✅ Report Downloaded!');
    };

    // View bill details
    window.viewBillDetails = function (billId) {
        const bills = JSON.parse(localStorage.getItem('scannedBills')) || [];
        // Consistent lookup: manual ID OR scan_{index+1} (String comparison)
        const bill = bills.find((b, i) => String(b.id || `scan_${i + 1}`) === String(billId));

        if (!bill) {
            alert('Bill not found!');
            return;
        }

        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;

        const date = bill.timestamp ? new Date(bill.timestamp).toLocaleString() : 'Unknown';

        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 2rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="color: #334155; margin: 0;">📄 Bill Details</h2>
                    <button onclick="this.closest('div[style*=fixed]').remove()" style="background: #ef4444; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.2rem;">×</button>
                </div>
                
                <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <p style="margin: 0.5rem 0; color: #64748b;"><strong>Bill ID:</strong> ${billId}</p>
                    <p style="margin: 0.5rem 0; color: #64748b;"><strong>Date:</strong> ${date}</p>
                </div>

                <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <h3 style="color: #475569; margin-bottom: 0.5rem;">Bill Content:</h3>
                    <pre style="white-space: pre-wrap; font-family: inherit; color: #334155; line-height: 1.6;">${bill.text || 'No text available'}</pre>
                </div>

                ${bill.image ? `
                    <div style="margin-bottom: 1rem;">
                        <h3 style="color: #475569; margin-bottom: 0.5rem;">Bill Image:</h3>
                        <img src="${bill.image}" style="width: 100%; border-radius: 8px; border: 2px solid #e2e8f0;">
                    </div>
                ` : ''}

                <div style="display: flex; gap: 10px;">
                    <button id="readAloudModalBtn" style="flex: 1; padding: 0.8rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        🔊 Read Aloud
                    </button>
                    <button id="downloadModalBtn" style="flex: 1; padding: 0.8rem; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        📥 Download
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners after modal is in DOM
        const readBtn = modal.querySelector('#readAloudModalBtn');
        const downloadBtn = modal.querySelector('#downloadModalBtn');

        readBtn.onclick = () => {
            console.log('🔊 READ ALOUD CLICKED');
            console.log('📝 Bill ID:', billId);
            console.log('📄 Bill text length:', bill.text?.length || 0);
            console.log('📄 Bill text preview:', bill.text?.substring(0, 200) || 'NO TEXT');
            console.log('🌐 Current language:', window.currentLanguage);

            showToast('🔊 Reading bill...');
            const currentLang = window.currentLanguage || 'hi-IN';

            console.log('🎤 About to call speakText with:', {
                textLength: bill.text?.length,
                language: currentLang
            });

            if (typeof window.speakText === 'function') {
                console.log('✅ Using window.speakText');
                window.speakText(bill.text, currentLang);
            } else if (typeof speakText === 'function') {
                console.log('✅ Using speakText');
                speakText(bill.text, currentLang);
            } else {
                console.log('⚠️ Using fallback speech');
                const utterance = new SpeechSynthesisUtterance(bill.text);
                utterance.lang = currentLang;
                window.speechSynthesis.speak(utterance);
            }
        };

        downloadBtn.onclick = () => downloadSingleBill(billId);

        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    };

    // Delete bill
    window.deleteBill = function (billId) {
        if (!confirm('Are you sure you want to delete this bill?')) {
            return;
        }

        let bills = JSON.parse(localStorage.getItem('scannedBills')) || [];
        const originalLength = bills.length;

        // Consistent lookup
        bills = bills.filter((b, i) => {
            const id = b.id || `scan_${i + 1}`;
            return String(id) !== String(billId);
        });

        if (bills.length < originalLength) {
            localStorage.setItem('scannedBills', JSON.stringify(bills));
            showToast('✅ Bill deleted successfully!');
            displayBillHistoryReport(); // Refresh the view
        } else {
            showToast('❌ Bill not found!');
        }
    };

    // Download single bill
    window.downloadSingleBill = function (billId) {
        const bills = JSON.parse(localStorage.getItem('scannedBills')) || [];
        // Consistent lookup
        const bill = bills.find((b, i) => String(b.id || `scan_${i + 1}`) === String(billId));

        if (!bill) {
            alert('Bill not found!');
            return;
        }

        const date = bill.timestamp ? new Date(bill.timestamp).toLocaleString() : 'Unknown';
        const content = `BILL DETAILS\n${'='.repeat(50)}\n\nBill ID: ${billId}\nDate: ${date}\n\nContent:\n${bill.text || 'No text'}\n`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${billId}_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('✅ Bill downloaded!');
    };

    console.log('✅ Enhanced History Module Ready');

    // Auto-load when history section is active
    function checkAndLoadHistory() {
        const historySection = document.getElementById('history');
        if (historySection && historySection.classList.contains('active')) {
            displayBillHistoryReport();
        }
    }

    // Check on page load
    setTimeout(checkAndLoadHistory, 1000);

    // Listen for section changes
    // Listen for section changes - Enhanced for Mobile
    document.addEventListener('click', function (e) {
        // Use closest() to handle mobile touches on icons
        if (e.target.closest('[data-section="history"]')) {
            console.log('📱 Mobile History Navigation');
            setTimeout(displayBillHistoryReport, 300);
        }
        // Also handle tab clicks
        if (e.target.closest('[data-history-tab="bills"]')) {
            setTimeout(displayBillHistoryReport, 100);
        }
    });
})();
