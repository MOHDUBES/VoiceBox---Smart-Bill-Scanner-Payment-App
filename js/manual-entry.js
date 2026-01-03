// Manual Bill Entry Feature
(function () {
    console.log('📝 Manual Entry Module Loaded');

    // Show manual entry modal
    window.showManualEntryModal = function () {
        const modal = document.createElement('div');
        modal.id = 'manualEntryModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="color: #334155; margin: 0;">📝 Manual Bill Entry</h2>
                    <button id="closeManualEntry" style="background: #ef4444; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.2rem;">×</button>
                </div>

                <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="margin: 0; color: #64748b; font-size: 0.9rem;">
                        ℹ️ For handwritten bills or when OCR fails, enter bill details manually.
                    </p>
                </div>

                <form id="manualBillForm">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; color: #475569; font-weight: 600; margin-bottom: 0.5rem;">Bill Title/Shop Name:</label>
                        <input type="text" id="billTitle" placeholder="e.g., किराना दुकान, Grocery Store" style="width: 100%; padding: 0.8rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem;">
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; color: #475569; font-weight: 600; margin-bottom: 0.5rem;">Bill Number:</label>
                        <input type="text" id="billNumber" placeholder="e.g., 74, INV-001" style="width: 100%; padding: 0.8rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem;">
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; color: #475569; font-weight: 600; margin-bottom: 0.5rem;">Date:</label>
                        <input type="date" id="billDate" style="width: 100%; padding: 0.8rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem;">
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; color: #475569; font-weight: 600; margin-bottom: 0.5rem;">Items/Description:</label>
                        <textarea id="billItems" rows="4" placeholder="e.g., 
11 x 20 = 220
दूध - ₹60
ब्रेड - ₹40" style="width: 100%; padding: 0.8rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; font-family: inherit;"></textarea>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: #475569; font-weight: 600; margin-bottom: 0.5rem;">Total Amount (₹):</label>
                        <input type="number" id="billAmount" placeholder="e.g., 220" style="width: 100%; padding: 0.8rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem;">
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button type="button" id="saveManualBill" style="flex: 1; padding: 1rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                            💾 Save Bill
                        </button>
                        <button type="button" id="cancelManualEntry" style="flex: 1; padding: 1rem; background: #94a3b8; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                            ❌ Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('closeManualEntry').onclick = () => modal.remove();
        document.getElementById('cancelManualEntry').onclick = () => modal.remove();

        document.getElementById('saveManualBill').onclick = () => {
            const title = document.getElementById('billTitle').value.trim();
            const number = document.getElementById('billNumber').value.trim();
            const date = document.getElementById('billDate').value;
            const items = document.getElementById('billItems').value.trim();
            const amount = document.getElementById('billAmount').value.trim();

            if (!title && !items) {
                alert('Please enter at least bill title or items!');
                return;
            }

            // Create bill text
            let billText = '';
            if (title) billText += title + '\n';
            if (number) billText += 'Bill No: ' + number + '\n';
            if (date) billText += 'Date: ' + date + '\n';
            if (items) billText += '\n' + items + '\n';
            if (amount) billText += '\nTotal: ₹' + amount;

            // Save to localStorage
            const bills = JSON.parse(localStorage.getItem('scannedBills')) || [];
            const newBill = {
                id: 'manual_' + Date.now(),
                text: billText,
                timestamp: new Date().toISOString(),
                type: 'manual'
            };
            bills.push(newBill);
            localStorage.setItem('scannedBills', JSON.stringify(bills));

            // Update UI
            if (typeof displayBillHistoryReport === 'function') {
                displayBillHistoryReport();
            }

            showToast('✅ Bill saved successfully!');
            modal.remove();

            // Update last bill text for Replay functionality
            window.lastBillText = billText;

            // Speak the bill
            setTimeout(() => {
                if (typeof speakText === 'function') {
                    speakText(billText);
                }
            }, 500);
        };

        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    };

    console.log('✅ Manual Entry Module Ready');
})();
