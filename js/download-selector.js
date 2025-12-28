// Handle download format selection
window.handleDownloadSelection = function (selectElement) {
    const format = selectElement.value;

    if (format === 'csv') {
        downloadPaymentHistoryCSV();
    } else if (format === 'pdf') {
        downloadPaymentHistoryPDF();
    }

    // Reset dropdown
    setTimeout(() => {
        selectElement.value = '';
    }, 100);
};

console.log('📥 Download selector ready');
