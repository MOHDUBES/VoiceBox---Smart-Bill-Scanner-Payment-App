
// ========== INDIVIDUAL DOWNLOAD FUNCTIONS ==========

// Download single scan as PDF
function downloadScanPDF(scanId) {
    try {
        console.log('Downloading scan PDF for:', scanId);

        const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

        if (isFirebaseConfigured) {
            // Firebase mode
            db.collection('billScans').doc(scanId).get().then(doc => {
                if (!doc.exists) {
                    alert('Scan not found');
                    return;
                }
                const scan = doc.data();
                generateSingleScanPDF(scan);
            });
        } else {
            // localStorage mode
            const scans = JSON.parse(localStorage.getItem('scannedBills') || '[]');
            let scan = scans.find(s => s.id === scanId);

            if (!scan && !isNaN(scanId)) {
                scan = scans[parseInt(scanId, 10)];
            }

            if (!scan) {
                alert('Scan not found');
                return;
            }

            generateSingleScanPDF(scan);
        }
    } catch (err) {
        console.error('Error downloading scan PDF:', err);
        alert('Error: ' + err.message);
    }
}

// Generate PDF for single scan
function generateSingleScanPDF(scan) {
    try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('PDF library not loaded. Please refresh the page.');
            return;
        }

        const jsPDFClass = window.jspdf.jsPDF;
        const pdf = new jsPDFClass('p', 'mm', 'a4');
        let yPos = 20;
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        const checkPageBreak = (requiredSpace) => {
            if (yPos + requiredSpace > pageHeight - 20) {
                pdf.addPage();
                yPos = 20;
                return true;
            }
            return false;
        };

        // Header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text('Bill Scan Report', margin, yPos);

        yPos += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Generated: ' + new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN'), margin, yPos);

        yPos += 10;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        // Scan header
        pdf.setFillColor(16, 185, 129);
        pdf.rect(margin, yPos - 8, contentWidth, 12, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text('Scan Details', margin + 3, yPos);
        yPos += 12;

        pdf.setTextColor(50, 50, 50);

        // User Information
        yPos += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('USER INFORMATION', margin + 3, yPos);
        yPos += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('User Email:', margin + 8, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(scan.userEmail || 'Unknown', margin + 45, yPos);
        yPos += 10;

        // Scan Information
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('SCAN INFORMATION', margin + 3, yPos);
        yPos += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        const scanInfo = [
            ['Language:', scan.language || 'N/A'],
            ['Scan Date:', formatDate(scan.scanDate) || 'Today']
        ];

        scanInfo.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label, margin + 8, yPos);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 45, yPos);
            yPos += 6;
        });

        // Scanned Text
        yPos += 5;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('SCANNED TEXT', margin + 3, yPos);
        yPos += 10;

        pdf.setFillColor(245, 247, 250);

        // Get scanned text and ensure it's properly encoded
        let scanText = scan.text || scan.originalText || 'No text available';

        // Try to clean the text - remove any problematic characters
        try {
            // Convert to ASCII-safe text if possible, or mark as binary data
            const encoder = new TextEncoder();
            const decoder = new TextDecoder('utf-8', { fatal: false });
            const bytes = encoder.encode(scanText);
            scanText = decoder.decode(bytes);
        } catch (e) {
            console.warn('Text encoding issue:', e);
        }

        // Split text into lines that will fit in PDF
        const textLines = pdf.splitTextToSize(scanText, contentWidth - 20);
        const maxLines = 40; // Limit to 40 lines to avoid very long PDFs
        const displayLines = textLines.slice(0, maxLines);
        const textBoxHeight = Math.min(displayLines.length * 5 + 10, pageHeight - yPos - 30);

        pdf.rect(margin + 5, yPos - 5, contentWidth - 10, textBoxHeight, 'F');

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        displayLines.forEach((line) => {
            checkPageBreak(6);
            try {
                // Try to add text, catch any encoding errors
                pdf.text(line, margin + 10, yPos);
            } catch (err) {
                // If text has unsupported characters, show placeholder
                pdf.text('[Text contains unsupported characters]', margin + 10, yPos);
                console.warn('Error adding text to PDF:', err);
            }
            yPos += 5;
        });

        if (textLines.length > maxLines) {
            pdf.setTextColor(120, 120, 120);
            pdf.text('... (text truncated - showing first ' + maxLines + ' lines)', margin + 10, yPos);
            pdf.setTextColor(50, 50, 50);
            yPos += 5;
        }

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Generated by VoiceBox Admin Panel', margin, pageHeight - 10);

        const fileName = 'VoiceBox_Scan_' + (scan.userEmail || 'user').replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now() + '.pdf';
        pdf.save(fileName);

    } catch (err) {
        console.error('Error generating scan PDF:', err);
        alert('PDF Error: ' + err.message);
    }
}

// Download single payment as PDF
function downloadPaymentPDF(paymentId) {
    try {
        console.log('Downloading payment PDF for:', paymentId);

        const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

        if (isFirebaseConfigured) {
            // Firebase mode
            db.collection('payments').doc(paymentId).get().then(doc => {
                if (!doc.exists) {
                    alert('Payment not found');
                    return;
                }
                const payment = doc.data();
                generateSinglePaymentPDF(payment);
            });
        } else {
            // localStorage mode - find payment in user's payment history
            const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
            let foundPayment = null;

            users.forEach((user, userIndex) => {
                if (user.paymentHistory && Array.isArray(user.paymentHistory)) {
                    user.paymentHistory.forEach((payment, payIndex) => {
                        const id = payment.id || `${userIndex}-${payIndex}`;
                        if (id === paymentId || payIndex.toString() === paymentId) {
                            foundPayment = {
                                ...payment,
                                userEmail: user.email,
                                userName: user.name
                            };
                        }
                    });
                }
            });

            if (!foundPayment) {
                alert('Payment not found');
                return;
            }

            generateSinglePaymentPDF(foundPayment);
        }
    } catch (err) {
        console.error('Error downloading payment PDF:', err);
        alert('Error: ' + err.message);
    }
}

// Generate PDF for single payment
function generateSinglePaymentPDF(payment) {
    try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('PDF library not loaded. Please refresh the page.');
            return;
        }

        const jsPDFClass = window.jspdf.jsPDF;
        const pdf = new jsPDFClass('p', 'mm', 'a4');
        let yPos = 20;
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        // Header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text('Payment Receipt', margin, yPos);

        yPos += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Generated: ' + new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN'), margin, yPos);

        yPos += 10;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        // Payment header
        pdf.setFillColor(245, 158, 11);
        pdf.rect(margin, yPos - 8, contentWidth, 12, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text('Transaction Details', margin + 3, yPos);
        yPos += 12;

        pdf.setTextColor(50, 50, 50);

        // Transaction ID
        yPos += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('Transaction ID:', margin + 3, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text('#' + (payment.id || 'N/A').toString().substring(0, 12), margin + 55, yPos);
        yPos += 10;

        // User Information
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('CUSTOMER INFORMATION', margin + 3, yPos);
        yPos += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        const userInfo = [
            ['Name:', payment.userName || 'N/A'],
            ['Email:', payment.userEmail || 'N/A']
        ];

        userInfo.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label, margin + 8, yPos);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 35, yPos);
            yPos += 6;
        });

        // Payment Details
        yPos += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('PAYMENT DETAILS', margin + 3, yPos);
        yPos += 10;

        pdf.setFillColor(245, 247, 250);
        pdf.rect(margin + 5, yPos - 5, contentWidth - 10, 32, 'F');

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        const paymentDetails = [
            ['Amount:', 'Rs. ' + (payment.amount || 0).toLocaleString('en-IN')],
            ['Type:', payment.type || 'N/A'],
            ['Payment Method:', payment.method || 'N/A'],
            ['Date:', formatDate(payment.date) || 'Today']
        ];

        paymentDetails.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label, margin + 10, yPos);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 55, yPos);
            yPos += 7;
        });

        // Status
        yPos += 5;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Status:', margin + 10, yPos);

        const statusColors = {
            'success': [16, 185, 129],
            'pending': [245, 158, 11],
            'failed': [239, 68, 68]
        };
        const statusColor = statusColors[payment.status] || [100, 100, 100];
        pdf.setTextColor(...statusColor);
        pdf.setFont('helvetica', 'bold');
        pdf.text((payment.status || 'pending').toUpperCase(), margin + 55, yPos);
        pdf.setTextColor(50, 50, 50);

        // Footer
        yPos = pageHeight - 30;
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Thank you for using VoiceBox!', margin, yPos);

        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Generated by VoiceBox Admin Panel', margin, pageHeight - 10);

        const fileName = 'VoiceBox_Payment_' + (payment.id || Date.now()).toString().substring(0, 8) + '.pdf';
        pdf.save(fileName);

    } catch (err) {
        console.error('Error generating payment PDF:', err);
        alert('PDF Error: ' + err.message);
    }
}
