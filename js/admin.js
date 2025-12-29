// Firebase Configuration (same as auth.js)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

// NOTE: demo/sample data removed — admin panel will show only real app data

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Remove any leftover modal overlays that could block clicks
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    // Ensure loading overlay hidden
    document.getElementById('loadingOverlay')?.classList.add('hidden');

    checkAdminAuth();
    initializeNavigation();
    initializeRefreshButton();
    initializeLogout();
    initializeSearch(); // Initialize search functionality

    // No demo toggle — admin shows real data only
});

// Check if user is admin
function checkAdminAuth() {
    showLoading(true);

    const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

    if (!isFirebaseConfigured) {
        // Demo Mode - Check localStorage
        const currentUser = localStorage.getItem('voicebox_current_user') ||
            sessionStorage.getItem('voicebox_current_user');

        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        const user = JSON.parse(currentUser);

        if (user.role !== 'admin') {
            alert('❌ Access denied. Admin only.\n\nCurrent role: ' + user.role + '\n\nCheck HOW_TO_ADMIN.md to become admin.');
            window.location.href = 'index.html';
            return;
        }

        // Admin verified!
        document.getElementById('adminName').textContent = user.name;
        document.getElementById('adminEmail').textContent = user.email;

        loadDashboard();
        showLoading(false);
        return;
    }

    // Firebase Mode
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();

            if (userData.role !== 'admin') {
                alert('Access denied. Admin only.');
                await auth.signOut();
                window.location.href = 'login.html';
                return;
            }

            currentUser = user;
            document.getElementById('adminName').textContent = user.displayName || 'Admin';
            document.getElementById('adminEmail').textContent = user.email;

            loadDashboard();
            showLoading(false);
        } catch (error) {
            console.error('Error checking admin:', error);
            window.location.href = 'login.html';
        }
    });
}

// Show export format choice modal
function showExportChoice(onCSV, onPDF) {
    const modal = document.getElementById('exportChoiceModal');
    if (!modal) {
        console.error('Export choice modal not found');
        return;
    }
    
    // Show modal
    modal.style.display = 'flex';
    
    // Remove old listeners to avoid duplicates
    const csvBtn = document.getElementById('exportCSVChoiceBtn');
    const pdfBtn = document.getElementById('exportPDFChoiceBtn');
    const cancelBtn = document.getElementById('exportCancelBtn');
    
    csvBtn.onclick = () => {
        modal.style.display = 'none';
        onCSV();
    };
    
    pdfBtn.onclick = () => {
        modal.style.display = 'none';
        onPDF();
    };
    
    cancelBtn.onclick = () => {
        modal.style.display = 'none';
    };
    
    // Close modal if clicking outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;

            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Switch page
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(page).classList.add('active');

            // Update page title
            document.getElementById('pageTitle').textContent =
                item.textContent.trim();

            // Load page data
            loadPageData(page);
        });
    });
}

// Refresh Button
function initializeRefreshButton() {
    document.getElementById('refreshBtn').addEventListener('click', () => {
        const activePage = document.querySelector('.page.active').id;
        loadPageData(activePage);
    });
}

// Logout
function initializeLogout() {
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to logout?')) {
            await auth.signOut();
            window.location.href = 'login.html';
        }
    });
}

// Load Dashboard Data
async function loadDashboard() {
    const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

    if (!isFirebaseConfigured) {
        // Demo Mode - Load from localStorage
        loadDashboardDemoMode();
        return;
    }

    // Firebase Mode
    try {
        // Get all users
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        document.getElementById('dashTotalUsers').textContent = totalUsers;

        // Get all scans
        const scansSnapshot = await db.collection('billScans').get();
        const totalScans = scansSnapshot.size;
        document.getElementById('dashTotalScans').textContent = totalScans;

        // Get all payments
        const paymentsSnapshot = await db.collection('payments').get();
        const totalPayments = paymentsSnapshot.size;
        document.getElementById('dashTotalPayments').textContent = totalPayments;

        // Calculate total revenue
        let totalRevenue = 0;
        paymentsSnapshot.forEach(doc => {
            const payment = doc.data();
            if (payment.amount) {
                totalRevenue += parseFloat(payment.amount);
            }
        });
        document.getElementById('dashTotalRevenue').textContent =
            totalRevenue.toLocaleString('en-IN');

        // Load recent activities
        loadRecentActivities();

        // Load active users
        loadActiveUsers();

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load Dashboard (Demo Mode)
function loadDashboardDemoMode() {
    let users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    let bills = JSON.parse(localStorage.getItem('scannedBills') || '[]');
    // Only real/localStorage data — filter out admin users
    users = (users || []).filter(u => u.role !== 'admin');

    // Total Users
    document.getElementById('dashTotalUsers').textContent = users.length;

    // Total Scans
    let totalScans = 0;
    users.forEach(u => {
        if (u.stats && u.stats.totalScans) {
            totalScans += u.stats.totalScans;
        }
    });
    document.getElementById('dashTotalScans').textContent = totalScans || bills.length;

    // Total Payments
    let totalPayments = 0;
    users.forEach(u => {
        if (u.stats && u.stats.totalPayments) {
            totalPayments += u.stats.totalPayments;
        }
    });
    document.getElementById('dashTotalPayments').textContent = totalPayments;

    // Total Revenue
    let totalRevenue = 0;
    users.forEach(u => {
        if (u.stats && u.stats.totalAmount) {
            totalRevenue += u.stats.totalAmount;
        }
    });
    document.getElementById('dashTotalRevenue').textContent =
        totalRevenue.toLocaleString('en-IN');

    // Recent Activities (Demo)
    loadRecentActivitiesDemoMode(users);

    // Active Users (Demo)
    loadActiveUsersDemoMode(users);
}

// Load Recent Activities
async function loadRecentActivities() {
    try {
        const activitiesSnapshot = await db.collection('activities')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        const container = document.getElementById('recentActivities');
        container.innerHTML = '';

        if (activitiesSnapshot.empty) {
            container.innerHTML = '<p style="text-align:center;">No activities yet</p>';
            return;
        }

        activitiesSnapshot.forEach(doc => {
            const activity = doc.data();
            const activityEl = document.createElement('div');
            activityEl.className = 'activity-item';
            activityEl.innerHTML = `
                <div>
                    <strong>${activity.action}</strong>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">
                        ${activity.data?.email || 'Unknown user'}
                    </p>
                </div>
                <span style="font-size: 0.8rem; color: var(--text-secondary);">
                    ${formatTime(activity.timestamp)}
                </span>
            `;
            container.appendChild(activityEl);
        });
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

// Load Active Users
async function loadActiveUsers() {
    try {
        const usersSnapshot = await db.collection('users')
            .where('isActive', '==', true)
            .orderBy('lastLogin', 'desc')
            .limit(5)
            .get();

        const container = document.getElementById('activeUsers');
        container.innerHTML = '';

        if (usersSnapshot.empty) {
            container.innerHTML = '<p style="text-align:center;">No active users</p>';
            return;
        }

        usersSnapshot.forEach(doc => {
            const user = doc.data();
            // exclude admin users from active list
            if (user.role === 'admin') return;
            const userEl = document.createElement('div');
            userEl.className = 'activity-item';
            userEl.innerHTML = `
                <div>
                    <strong>${user.name}</strong>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">
                        ${user.email}
                    </p>
                </div>
                <span class="badge success">Active</span>
            `;
            container.appendChild(userEl);
        });
    } catch (error) {
        console.error('Error loading active users:', error);
    }
}

// Utility Functions
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';

    try {
        let date;
        if (timestamp.toDate) {
            // Firebase Timestamp
            date = timestamp.toDate();
        } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
            date = new Date(timestamp);
        } else {
            return 'N/A';
        }

        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
    }
}

function formatTime(timestamp) {
    if (!timestamp) return 'Just now';

    try {
        let date;
        if (timestamp.toDate) {
            // Firebase Timestamp
            date = timestamp.toDate();
        } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
            date = new Date(timestamp);
        } else {
            return 'Recently';
        }

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Recently';
    }
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
}

// Load Page Data
async function loadPageData(page) {
    showLoading(true);

    switch (page) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'users':
            await loadUsers();
            break;
        case 'scans':
            await loadScans();
            break;
        case 'payments':
            await loadPayments();
            break;
        case 'analytics':
            await loadAnalytics();
            break;
    }

    showLoading(false);
}

// Load All Users
async function loadUsers() {
    try {
        const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        if (isFirebaseConfigured) {
            // Firebase Mode
            const usersSnapshot = await db.collection('users').get();

            if (usersSnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No users found</td></tr>';
                return;
            }

            usersSnapshot.forEach(doc => {
                const user = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${user.stats?.totalScans || 0}</td>
                    <td>${user.stats?.totalPayments || 0}</td>
                    <td>${formatDate(user.createdAt)}</td>
                    <td><span class="badge ${user.isActive ? 'success' : 'danger'}">
                        ${user.isActive ? 'Active' : 'Inactive'}
                    </span></td>
                    <td>
                        <button onclick="viewUser('${doc.id}')" style="padding: 0.5rem; background: var(--primary); border: none; border-radius: 6px; color: white; cursor: pointer; margin-right:0.4rem;">View</button>
                        <button onclick="downloadUserPDF('${doc.id}')" style="padding: 0.45rem; background: var(--bg-card); border: none; border-radius: 6px; color: var(--primary); cursor: pointer;">Download</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Export button with modal choice
            document.getElementById('exportUsersBtn').onclick = () => {
                showExportChoice(
                    () => exportUsersCSVFromSnapshot(usersSnapshot),
                    () => exportUsersPDFFromSnapshot(usersSnapshot)
                );
            };
        } else {
            // Demo Mode - Load from localStorage (real app data only)
            let users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
            users = (users || []).filter(u => u.role !== 'admin');

            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No users found</td></tr>';
                return;
            }

            users.forEach((user, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${user.stats?.totalScans || 0}</td>
                    <td>${user.stats?.totalPayments || 0}</td>
                    <td>${formatDate(user.createdAt) || 'Today'}</td>
                    <td><span class="badge ${user.isActive !== false ? 'success' : 'danger'}">
                        ${user.isActive !== false ? 'Active' : 'Inactive'}
                    </span></td>
                    <td>
                        <button onclick="viewUser('${user.id || index}')" style="padding: 0.5rem; background: var(--primary); border: none; border-radius: 6px; color: white; cursor: pointer; margin-right:0.4rem;">View</button>
                        <button onclick="downloadUserPDF('${user.id || index}')" style="padding: 0.45rem; background: var(--bg-card); border: none; border-radius: 6px; color: var(--primary); cursor: pointer;">Download</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            // Export button with modal choice for localStorage users
            document.getElementById('exportUsersBtn').onclick = () => {
                showExportChoice(
                    () => exportUsersCSVFromArray(users),
                    () => exportUsersPDFFromArray(users)
                );
            };
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load All Scans
async function loadScans() {
    try {
        const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
        const tbody = document.getElementById('scansTableBody');
        tbody.innerHTML = '';

        if (isFirebaseConfigured) {
            // Firebase Mode
            const scansSnapshot = await db.collection('billScans').get();

            if (scansSnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No scans found</td></tr>';
                return;
            }

            scansSnapshot.forEach(doc => {
                const scan = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${scan.userEmail || 'Unknown'}</td>
                    <td>${scan.language || 'N/A'}</td>
                    <td>${formatDate(scan.scanDate)}</td>
                    <td>${(scan.text || '').substring(0, 50)}...</td>
                    <td>
                        <button onclick="viewScan('${doc.id}')" style="padding: 0.5rem; background: var(--primary); border: none; border-radius: 6px; color: white; cursor: pointer; margin-right:0.4rem;">View</button>
                        <button onclick="downloadScanPDF('${doc.id}')" style="padding: 0.45rem; background: var(--bg-card); border: none; border-radius: 6px; color: var(--primary); cursor: pointer;">Download</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Export button with modal choice for Firebase scans
            document.getElementById('exportScansBtn').onclick = () => {
                const scansArray = [];
                scansSnapshot.forEach(doc => scansArray.push(doc.data()));
                showExportChoice(
                    () => exportScansCSV(scansArray),
                    () => exportScansPDF(scansArray)
                );
            };
        } else {
            // Demo Mode - Load from localStorage (real app data only)
            let scans = JSON.parse(localStorage.getItem('scannedBills') || '[]');

            if (scans.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No scans found</td></tr>';
                return;
            }

            scans.forEach((scan, index) => {
                const row = document.createElement('tr');
                const textPreview = (scan.text || scan.originalText || '').substring(0, 50);
                row.innerHTML = `
                    <td>${scan.userEmail || 'Unknown'}</td>
                    <td>${scan.language || 'N/A'}</td>
                    <td>${formatDate(scan.scanDate) || 'Today'}</td>
                    <td>${textPreview}${textPreview.length > 0 ? '...' : 'No text'}</td>
                    <td>
                        <button onclick="viewScan('${scan.id || index}')" style="padding: 0.5rem; background: var(--primary); border: none; border-radius: 6px; color: white; cursor: pointer; margin-right:0.4rem;">View</button>
                        <button onclick="downloadScanPDF('${scan.id || index}')" style="padding: 0.45rem; background: var(--bg-card); border: none; border-radius: 6px; color: var(--primary); cursor: pointer;">Download</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Export button with modal choice for localStorage scans
            document.getElementById('exportScansBtn').onclick = () => {
                showExportChoice(
                    () => exportScansCSV(scans),
                    () => exportScansPDF(scans)
                );
            };
        }
    } catch (error) {
        console.error('Error loading scans:', error);
    }
}

// Load All Payments
async function loadPayments() {
    try {
        const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
        const tbody = document.getElementById('paymentsTableBody');
        tbody.innerHTML = '';

        if (isFirebaseConfigured) {
            // Firebase Mode
            const paymentsSnapshot = await db.collection('payments').get();

            if (paymentsSnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No payments found</td></tr>';
                return;
            }

            paymentsSnapshot.forEach(doc => {
                const payment = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${doc.id.substring(0, 8)}</td>
                    <td>${payment.userEmail || 'Unknown'}</td>
                    <td>₹${payment.amount?.toLocaleString('en-IN') || 0}</td>
                    <td>${payment.type || 'N/A'}</td>
                    <td><span class="badge ${payment.status === 'success' ? 'success' : 'danger'}">
                        ${payment.status || 'pending'}
                    </span></td>
                    <td>${formatDate(payment.date)}</td>
                    <td>
                        <button onclick="viewPayment('${doc.id}')" style="padding: 0.5rem; background: var(--primary); border: none; border-radius: 6px; color: white; cursor: pointer; margin-right:0.4rem;">View</button>
                        <button onclick="downloadPaymentPDF('${doc.id}')" style="padding: 0.45rem; background: var(--bg-card); border: none; border-radius: 6px; color: var(--primary); cursor: pointer;">Download</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Export button with modal choice for Firebase payments
            document.getElementById('exportPaymentsBtn').onclick = () => {
                const paymentsArray = [];
                paymentsSnapshot.forEach(doc => paymentsArray.push(doc.data()));
                showExportChoice(
                    () => exportPaymentsCSV(paymentsArray),
                    () => exportPaymentsPDF(paymentsArray)
                );
            };
        } else {
            // LocalStorage mode - build payments from stored users (real app data only)
            let payments = [];
            let users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
            users = (users || []).filter(u => u.role !== 'admin');

            users.forEach((user, userIndex) => {
                if (user.paymentHistory && Array.isArray(user.paymentHistory)) {
                    user.paymentHistory.forEach((payment, payIndex) => {
                        payments.push({
                            ...payment,
                            userEmail: user.email,
                            id: payment.id || `${userIndex}-${payIndex}`
                        });
                    });
                }
            });

            if (payments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No payments found</td></tr>';
                return;
            }

            payments.forEach((payment, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${(payment.id || index).toString().substring(0, 8)}</td>
                    <td>${payment.userEmail || 'Unknown'}</td>
                    <td>₹${(payment.amount || 0).toLocaleString('en-IN')}</td>
                    <td>${payment.type || 'N/A'}</td>
                    <td><span class="badge ${payment.status === 'success' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'}">
                        ${payment.status || 'pending'}
                    </span></td>
                    <td>${formatDate(payment.date) || 'Today'}</td>
                    <td>
                        <button onclick="viewPayment('${payment.id || index}')" style="padding: 0.5rem; background: var(--primary); border: none; border-radius: 6px; color: white; cursor: pointer; margin-right:0.4rem;">View</button>
                        <button onclick="downloadPaymentPDF('${payment.id || index}')" style="padding: 0.45rem; background: var(--bg-card); border: none; border-radius: 6px; color: var(--primary); cursor: pointer;">Download</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Export button with modal choice for localStorage payments
            document.getElementById('exportPaymentsBtn').onclick = () => {
                showExportChoice(
                    () => exportPaymentsCSV(payments),
                    () => exportPaymentsPDF(payments)
                );
            };
        }
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

// Load Analytics
async function loadAnalytics() {
    const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

    if (isFirebaseConfigured) {
        // Firebase Mode Analytics
        try {
            // Get users for most active users
            const usersSnapshot = await db.collection('users').get();
            const users = [];
            usersSnapshot.forEach(doc => {
                const user = doc.data();
                // exclude admins from analytics
                if (user.role === 'admin') return;
                users.push({ name: user.name, totalScans: user.stats?.totalScans || 0 });
            });

            // Get scans for language distribution
            const scansSnapshot = await db.collection('billScans').get();
            const languageCount = {};
            scansSnapshot.forEach(doc => {
                const scan = doc.data();
                const lang = scan.language || 'Unknown';
                languageCount[lang] = (languageCount[lang] || 0) + 1;
            });

            createCharts(users, languageCount);
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    } else {
        // Demo Mode Analytics
        const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
        const scans = JSON.parse(localStorage.getItem('scannedBills') || '[]');

        // Get top active users
        const topUsers = users
            .filter(u => u.role === 'user')
            .sort((a, b) => (b.stats?.totalScans || 0) - (a.stats?.totalScans || 0))
            .slice(0, 5)
            .map(u => ({
                name: u.name,
                totalScans: u.stats?.totalScans || 0
            }));

        // Get language distribution
        const languageCount = {};
        scans.forEach(scan => {
            const lang = scan.language || 'Unknown';
            languageCount[lang] = (languageCount[lang] || 0) + 1;
        });

        createCharts(topUsers, languageCount);
    }
}

function createCharts(users, languageCount) {
    // Chart.js colors
    const chartColors = {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        blue: '#3b82f6',
        pink: '#ec4899',
        cyan: '#06b6d4'
    };

    // Destroy existing charts if they exist
    if (window.topUsersChartInstance) window.topUsersChartInstance.destroy();
    if (window.languageChartInstance) window.languageChartInstance.destroy();
    if (window.activityChartInstance) window.activityChartInstance.destroy();

    // 1. Most Active Users - Bar Chart
    const topUsersCtx = document.getElementById('topUsersChart');
    if (topUsersCtx && topUsersCtx.parentElement) {
        const canvas = document.createElement('canvas');
        topUsersCtx.innerHTML = '';
        topUsersCtx.appendChild(canvas);

        const topUsersData = {
            labels: users.map(u => u.name),
            datasets: [{
                label: 'Bill Scans',
                data: users.map(u => u.totalScans),
                backgroundColor: [
                    chartColors.primary,
                    chartColors.secondary,
                    chartColors.success,
                    chartColors.warning,
                    chartColors.danger
                ],
                borderRadius: 8,
                borderSkipped: false
            }]
        };

        window.topUsersChartInstance = new Chart(canvas, {
            type: 'bar',
            data: topUsersData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#a0a0b8',
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#a0a0b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a0a0b8' }
                    }
                }
            }
        });
    }

    // 2. Scans by Language - Pie Chart
    const languageCtx = document.getElementById('languageChart');
    if (languageCtx && languageCtx.parentElement) {
        const canvas = document.createElement('canvas');
        languageCtx.innerHTML = '';
        languageCtx.appendChild(canvas);

        const colors = Object.keys(chartColors).map(key => chartColors[key]);
        const languageData = {
            labels: Object.keys(languageCount),
            datasets: [{
                data: Object.values(languageCount),
                backgroundColor: colors.slice(0, Object.keys(languageCount).length),
                borderColor: '#1a1a2e',
                borderWidth: 2
            }]
        };

        window.languageChartInstance = new Chart(canvas, {
            type: 'doughnut',
            data: languageData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#a0a0b8',
                            font: { size: 12 },
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    // 3. Daily Activity - Line Chart
    const activityCtx = document.getElementById('activityChart');
    if (activityCtx && activityCtx.parentElement) {
        const canvas = document.createElement('canvas');
        activityCtx.innerHTML = '';
        activityCtx.appendChild(canvas);

        // Generate last 7 days data
        const last7Days = [];
        const activityData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            last7Days.push(dayName);
            activityData.push(Math.floor(Math.random() * 20) + 5);
        }

        const activityChartData = {
            labels: last7Days,
            datasets: [{
                label: 'Daily Scans',
                data: activityData,
                borderColor: chartColors.primary,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: chartColors.primary,
                pointBorderColor: '#1a1a2e',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        };

        window.activityChartInstance = new Chart(canvas, {
            type: 'line',
            data: activityChartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#a0a0b8',
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#a0a0b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a0a0b8' }
                    }
                }
            }
        });
    }
}

// Show Export Choice Modal
function showExportChoice(csvCallback, pdfCallback) {
    const modal = document.getElementById('exportChoiceModal');
    const csvBtn = document.getElementById('exportCSVChoiceBtn');
    const pdfBtn = document.getElementById('exportPDFChoiceBtn');
    const cancelBtn = document.getElementById('exportCancelBtn');

    // Show modal
    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    // Remove any previous event listeners by cloning buttons
    const newCsvBtn = csvBtn.cloneNode(true);
    const newPdfBtn = pdfBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);

    csvBtn.parentNode.replaceChild(newCsvBtn, csvBtn);
    pdfBtn.parentNode.replaceChild(newPdfBtn, pdfBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    // Close modal function
    const closeModal = () => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    };

    // CSV button handler
    newCsvBtn.addEventListener('click', () => {
        closeModal();
        csvCallback();
    });

    // PDF button handler
    newPdfBtn.addEventListener('click', () => {
        closeModal();
        pdfCallback();
    });

    // Cancel button handler
    newCancelBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Export Data to CSV
function exportData(snapshot, type) {
    let csv = '';
    const data = [];

    snapshot.forEach(doc => {
        data.push(doc.data());
    });

    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    // Create CSV headers
    const headers = Object.keys(data[0]);
    csv = headers.join(',') + '\n';

    // Add data rows
    data.forEach(row => {
        const values = headers.map(header => {
            const val = row[header];
            return typeof val === 'object' ? JSON.stringify(val) : val;
        });
        csv += values.join(',') + '\n';
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_export_${Date.now()}.csv`;
    a.click();
}

// Export users CSV from array (localStorage) - IMPROVED: clean, readable format
function exportUsersCSVFromArray(users) {
    if (!users || users.length === 0) {
        alert('No users to export');
        return;
    }

    let csv = 'Name,Email,Phone,Address,Status,Joined Date,Total Scans,Total Payments,Total Amount Paid\n';

    users.forEach(u => {
        const row = [
            u.name || '',
            u.email || '',
            u.phone || 'N/A',
            (u.address || 'N/A').replace(/\n/g, ' '),
            u.isActive !== false ? 'Active' : 'Inactive',
            formatDate(u.createdAt) || 'N/A',
            u.stats?.totalScans || 0,
            u.stats?.totalPayments || 0,
            u.stats?.totalAmount || 0
        ];
        csv += row.map(v => `"${(v + '').replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${Date.now()}.csv`;
    a.click();
}

// Export users CSV from Firebase snapshot
function exportUsersCSVFromSnapshot(snapshot) {
    const users = [];
    snapshot.forEach(doc => users.push(doc.data()));
    exportUsersCSVFromArray(users);
}

// Export users PDF from array - IMPROVED: Clean table format with proper spacing
function exportUsersPDFFromArray(users) {
    if (!users || users.length === 0) {
        alert('No users to export');
        return;
    }

    try {
        // Get jsPDF with proper error handling
        if (!window.jspdf || !window.jspdf.jsPDF) {
            console.error('jsPDF not available for export');
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
        pdf.text('VoiceBox - Users Report', margin, yPos);

        yPos += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Total Users: ${users.length}  |  Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, margin, yPos);

        yPos += 10;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // Function to check if we need a new page
        const checkPageBreak = (requiredSpace) => {
            if (yPos + requiredSpace > pageHeight - 20) {
                pdf.addPage();
                yPos = 20;
                return true;
            }
            return false;
        };

        // Each user entry with clean formatting
        users.forEach((user, index) => {
            checkPageBreak(60); // Minimum space needed for user entry

            // User header box
            pdf.setFillColor(99, 102, 241); // Primary color
            pdf.rect(margin, yPos - 5, contentWidth, 10, 'F');

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(255, 255, 255);
            pdf.text(`${index + 1}. ${user.name || 'Unknown User'}`, margin + 3, yPos);
            yPos += 10;

            // User details in organized sections
            pdf.setTextColor(50, 50, 50);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);

            // Contact Information
            pdf.setFont('helvetica', 'bold');
            pdf.text('Contact Information:', margin + 3, yPos);
            yPos += 6;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text(`Email: ${user.email || 'N/A'}`, margin + 8, yPos);
            yPos += 5;
            pdf.text(`Phone: ${user.phone || 'N/A'}`, margin + 8, yPos);
            yPos += 5;

            if (user.address) {
                const addressLines = pdf.splitTextToSize(`Address: ${user.address}`, contentWidth - 15);
                addressLines.forEach(line => {
                    checkPageBreak(5);
                    pdf.text(line, margin + 8, yPos);
                    yPos += 5;
                });
            }
            yPos += 3;

            // Account Status
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.text('Account Status:', margin + 3, yPos);
            yPos += 6;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            const statusColor = user.isActive !== false ? [16, 185, 129] : [239, 68, 68];
            pdf.setTextColor(...statusColor);
            pdf.text(`Status: ${user.isActive !== false ? '● Active' : '● Inactive'}`, margin + 8, yPos);
            pdf.setTextColor(50, 50, 50);

            yPos += 5;
            pdf.text(`Joined: ${formatDate(user.createdAt) || 'N/A'}`, margin + 8, yPos);
            yPos += 8;

            // Statistics
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.text('Statistics:', margin + 3, yPos);
            yPos += 6;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);

            // Stats in a clean table format
            const stats = [
                ['Total Scans:', `${user.stats?.totalScans || 0}`],
                ['Total Payments:', `${user.stats?.totalPayments || 0}`],
                ['Total Amount Paid:', `₹${(user.stats?.totalAmount || 0).toLocaleString('en-IN')}`]
            ];

            stats.forEach(([label, value]) => {
                pdf.text(label, margin + 8, yPos);
                pdf.setFont('helvetica', 'bold');
                pdf.text(value, margin + 55, yPos);
                pdf.setFont('helvetica', 'normal');
                yPos += 5;
            });
            yPos += 3;

            // Payment History
            if (user.paymentHistory && user.paymentHistory.length > 0) {
                checkPageBreak(15);

                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(10);
                pdf.text(`Recent Payments (${user.paymentHistory.length}):`, margin + 3, yPos);
                yPos += 8;

                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8);

                // Display last 5 payments
                const recentPayments = user.paymentHistory.slice(0, 5);
                recentPayments.forEach((payment) => {
                    checkPageBreak(6);

                    const statusColor = payment.status === 'success' ? [16, 185, 129] :
                        payment.status === 'pending' ? [245, 158, 11] : [239, 68, 68];

                    const paymentText = `₹${(payment.amount || 0).toLocaleString('en-IN')} - ${payment.type || 'Bill Payment'} [${payment.status || 'pending'}]`;
                    const dateText = `${formatDate(payment.date) || 'N/A'} via ${payment.method || 'N/A'}`;

                    pdf.text('•', margin + 8, yPos);
                    pdf.text(paymentText, margin + 12, yPos);
                    yPos += 4;

                    pdf.setTextColor(120, 120, 120);
                    pdf.text(dateText, margin + 15, yPos);
                    pdf.setTextColor(50, 50, 50);
                    yPos += 5;
                });

                if (user.paymentHistory.length > 5) {
                    pdf.setTextColor(100, 100, 100);
                    pdf.text(`... and ${user.paymentHistory.length - 5} more payment(s)`, margin + 12, yPos);
                    pdf.setTextColor(50, 50, 50);
                    yPos += 5;
                }
            }

            // Separator line
            yPos += 5;
            pdf.setDrawColor(220, 220, 220);
            pdf.setLineWidth(0.3);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 12;
        });

        // Footer on last page
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Generated by VoiceBox Admin Panel', margin, pageHeight - 10);
        pdf.text(`Page ${pdf.getCurrentPageInfo().pageNumber}`, pageWidth - margin - 15, pageHeight - 10);

        pdf.save(`VoiceBox_Users_Report_${Date.now()}.pdf`);

        // Success notification
        setTimeout(() => {
            alert(`✓ PDF exported successfully!\n\nTotal users: ${users.length}\nFilename: VoiceBox_Users_Report_${Date.now()}.pdf`);
        }, 100);

    } catch (err) {
        console.error('Error exporting PDF:', err);
        alert('Failed to generate PDF: ' + err.message);
    }
}

// Export users PDF from Firebase snapshot
function exportUsersPDFFromSnapshot(snapshot) {
    const users = [];
    snapshot.forEach(doc => users.push(doc.data()));
    exportUsersPDFFromArray(users);
}

// Download single user PDF - IMPROVED: detailed with all payment history and info
function downloadUserPDF(userId) {
    try {
        console.log('=== downloadUserPDF START ===');
        console.log('userId:', userId);

        // Check if jsPDF is available
        const jsPDFClass = window.jspdf?.jsPDF;
        if (!jsPDFClass) {
            console.error('jsPDF not available!');
            console.log('window.jspdf:', window.jspdf);
            console.log('window.jsPDF:', window.jsPDF);
            alert('PDF library not loaded. Please refresh the page.');
            return;
        }

        console.log('✓ jsPDF found');

        const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
        if (isFirebaseConfigured) {
            db.collection('users').doc(userId).get().then(doc => {
                if (!doc.exists) {
                    alert('User not found');
                    return;
                }
                const user = doc.data();
                console.log('✓ User found from Firebase:', user.name);
                generateDetailedUserPDF(user);
            }).catch(err => {
                console.error('Error fetching user for PDF:', err);
                alert('Error: ' + err.message);
            });
        } else {
            const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
            console.log('localStorage users count:', users.length);

            let user = users.find(u => u.id === userId || u.uid === userId);

            if (!user && !isNaN(userId)) {
                user = users[parseInt(userId, 10)];
            }

            if (!user) {
                console.error('User not found. userId:', userId);
                alert('User not found');
                return;
            }

            console.log('✓ User found from localStorage:', user.name);
            generateDetailedUserPDF(user);
        }
    } catch (err) {
        console.error('Error in downloadUserPDF:', err);
        alert('Error: ' + err.message);
    }
}

// Generate detailed single-user PDF with full information
function generateDetailedUserPDF(user) {
    try {
        console.log('generateDetailedUserPDF START for:', user.name);

        // Get jsPDF class - with better error checking
        if (!window.jspdf || !window.jspdf.jsPDF) {
            console.error('jsPDF not found. Trying fallback...', window.jspdf);
            alert('PDF library failed to load. Try refreshing the page.');
            return;
        }

        const jsPDFClass = window.jspdf.jsPDF;
        const pdf = new jsPDFClass('p', 'mm', 'a4');
        let yPos = 20;
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        // Function to check page break
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
        pdf.text('User Profile Report', margin, yPos);

        yPos += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, margin, yPos);

        yPos += 10;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        // User header with colored background
        pdf.setFillColor(99, 102, 241);
        pdf.rect(margin, yPos - 8, contentWidth, 12, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text(user.name || 'Unknown User', margin + 3, yPos);
        yPos += 12;

        pdf.setTextColor(50, 50, 50);

        // Contact Information Section
        yPos += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('📧 Contact Information', margin + 3, yPos);
        yPos += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        const contactInfo = [
            ['Email:', user.email || 'N/A'],
            ['Phone:', user.phone || 'N/A']
        ];

        contactInfo.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label, margin + 8, yPos);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 35, yPos);
            yPos += 6;
        });

        if (user.address) {
            yPos += 2;
            pdf.setFont('helvetica', 'bold');
            pdf.text('Address:', margin + 8, yPos);
            yPos += 6;
            pdf.setFont('helvetica', 'normal');
            const addressLines = pdf.splitTextToSize(user.address, contentWidth - 20);
            addressLines.forEach(line => {
                checkPageBreak(6);
                pdf.text(line, margin + 12, yPos);
                yPos += 5;
            });
        }

        // Account Status Section
        yPos += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('✓ Account Status', margin + 3, yPos);
        yPos += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        const statusColor = user.isActive !== false ? [16, 185, 129] : [239, 68, 68];
        pdf.setTextColor(...statusColor);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`● ${user.isActive !== false ? 'Active' : 'Inactive'}`, margin + 8, yPos);
        pdf.setTextColor(50, 50, 50);
        pdf.setFont('helvetica', 'normal');

        yPos += 6;
        pdf.text(`Joined: ${formatDate(user.createdAt) || 'N/A'}`, margin + 8, yPos);

        // Statistics Section  
        yPos += 12;
        checkPageBreak(40);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('📊 Account Statistics', margin + 3, yPos);
        yPos += 8;

        // Stats table with background
        pdf.setFillColor(245, 247, 250);
        pdf.rect(margin + 5, yPos - 5, contentWidth - 10, 24, 'F');

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        const stats = [
            ['Total Scans:', `${user.stats?.totalScans || 0}`],
            ['Total Payments:', `${user.stats?.totalPayments || 0}`],
            ['Total Amount Paid:', `₹${(user.stats?.totalAmount || 0).toLocaleString('en-IN')}`]
        ];

        stats.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'normal');
            pdf.text(label, margin + 10, yPos);
            pdf.setFont('helvetica', 'bold');
            pdf.text(value, margin + 70, yPos);
            yPos += 7;
        });

        yPos += 8;

        // Payment History Section
        checkPageBreak(30);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text(`💳 Payment History (${user.paymentHistory?.length || 0})`, margin + 3, yPos);
        yPos += 10;

        if (user.paymentHistory && user.paymentHistory.length > 0) {
            // Table header
            pdf.setFillColor(230, 230, 235);
            pdf.rect(margin + 5, yPos - 5, contentWidth - 10, 8, 'F');

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.text('#', margin + 8, yPos);
            pdf.text('Type', margin + 18, yPos);
            pdf.text('Amount', margin + 55, yPos);
            pdf.text('Status', margin + 85, yPos);
            pdf.text('Date', margin + 108, yPos);
            pdf.text('Method', margin + 145, yPos);
            yPos += 8;

            // Payment rows
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);

            user.paymentHistory.forEach((payment, index) => {
                checkPageBreak(8);

                // Alternating row colors
                if (index % 2 === 0) {
                    pdf.setFillColor(250, 250, 252);
                    pdf.rect(margin + 5, yPos - 4, contentWidth - 10, 6, 'F');
                }

                pdf.setTextColor(50, 50, 50);
                pdf.text(`${index + 1}.`, margin + 8, yPos);
                pdf.text((payment.type || 'Bill').substring(0, 15), margin + 18, yPos);
                pdf.text(`₹${(payment.amount || 0).toLocaleString('en-IN')}`, margin + 55, yPos);

                // Status with color
                const statusColors = {
                    'success': [16, 185, 129],
                    'pending': [245, 158, 11],
                    'failed': [239, 68, 68]
                };
                const statusColor = statusColors[payment.status] || [100, 100, 100];
                pdf.setTextColor(...statusColor);
                pdf.text(payment.status || 'pending', margin + 85, yPos);

                pdf.setTextColor(50, 50, 50);
                pdf.text(formatDate(payment.date) || 'N/A', margin + 108, yPos);
                pdf.text((payment.method || 'N/A').substring(0, 12), margin + 145, yPos);

                yPos += 6;
            });
        } else {
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(9);
            pdf.setTextColor(120, 120, 120);
            pdf.text('No payment history available', margin + 10, yPos);
            pdf.setTextColor(50, 50, 50);
        }

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Generated by VoiceBox Admin Panel', margin, pageHeight - 10);

        const fileName = `VoiceBox_User_${(user.name || 'User').replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        console.log('Saving PDF as:', fileName);
        pdf.save(fileName);
        console.log('✓ PDF downloaded successfully');

    } catch (err) {
        console.error('Error in generateDetailedUserPDF:', err);
        alert('PDF Error: ' + err.message);
    }
}

// Helper Functions
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN');
}

function formatTime(timestamp) {
    if (!timestamp) return 'N/A';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return formatDate(timestamp);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

// View functions with Modal
async function viewUser(userId) {
    try {
        const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
        let user = null;

        if (isFirebaseConfigured) {
            const userDoc = await db.collection('users').doc(userId).get();
            user = userDoc.data();
        } else {
            // Demo mode
            const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
            user = users.find(u => u.id === userId || u.uid === userId);
            if (!user && !isNaN(userId)) user = users[parseInt(userId, 10)];
        }

        if (!user) {
            alert('User not found');
            return;
        }

        const modalHTML = `
            <div class="modal-overlay" id="userModal" onclick="closeModal(this)">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2>User Details</h2>
                        <button class="modal-close" onclick="closeModal(document.getElementById('userModal'))">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="details-grid">
                            <div class="detail-item">
                                <label>Name</label>
                                <p>${user.name || 'N/A'}</p>
                            </div>
                            <div class="detail-item">
                                <label>Email</label>
                                <p>${user.email || 'N/A'}</p>
                            </div>
                            <div class="detail-item">
                                <label>Phone</label>
                                <p>${user.phone || 'N/A'}</p>
                            </div>
                            <div class="detail-item">
                                <label>Status</label>
                                <p><span class="badge ${user.isActive ? 'success' : 'danger'}">${user.isActive ? 'Active' : 'Inactive'}</span></p>
                            </div>
                            <div class="detail-item">
                                <label>Total Scans</label>
                                <p>${user.stats?.totalScans || 0}</p>
                            </div>
                            <div class="detail-item">
                                <label>Total Payments</label>
                                <p>${user.stats?.totalPayments || 0}</p>
                            </div>
                            <div class="detail-item">
                                <label>Total Amount Paid</label>
                                <p>₹${(user.stats?.totalAmount || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div class="detail-item">
                                <label>Joined Date</label>
                                <p>${formatDate(user.createdAt) || 'N/A'}</p>
                            </div>
                            <div class="detail-item full-width">
                                <label>Address</label>
                                <p>${user.address || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        console.error('Error viewing user:', error);
        alert('Error loading user details');
    }
}

async function viewScan(scanId) {
    try {
        const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
        let scan = null;

        if (isFirebaseConfigured) {
            const scanDoc = await db.collection('billScans').doc(scanId).get();
            scan = scanDoc.data();
        } else {
            // Demo mode
            const scans = JSON.parse(localStorage.getItem('scannedBills') || '[]');
            scan = scans.find(s => s.id === scanId); if (!scan && !isNaN(scanId)) scan = scans[parseInt(scanId, 10)];
        }

        if (!scan) {
            alert('Scan not found');
            return;
        }

        const modalHTML = `
            <div class="modal-overlay" id="scanModal" onclick="closeModal(this)">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2>Bill Scan Details</h2>
                        <button class="modal-close" onclick="closeModal(document.getElementById('scanModal'))">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="details-grid">
                            <div class="detail-item">
                                <label>User Email</label>
                                <p>${scan.userEmail || 'N/A'}</p>
                            </div>
                            <div class="detail-item">
                                <label>Language</label>
                                <p>${scan.language || 'N/A'}</p>
                            </div>
                            <div class="detail-item">
                                <label>Scan Date</label>
                                <p>${formatDate(scan.scanDate) || 'N/A'}</p>
                            </div>
                            <div class="detail-item">
                                <label>Amount</label>
                                <p>₹${(scan.amount || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div class="detail-item full-width">
                                <label>Scan Text</label>
                                <p style="background: var(--bg-card); padding: 1rem; border-radius: 6px; max-height: 300px; overflow-y: auto; white-space: pre-wrap;">
                                    ${scan.text || 'No text detected'}
                                </p>
                            </div>
                            ${scan.imageUrl ? `
                            <div class="detail-item full-width">
                                <label>Scanned Image</label>
                                <img src="${scan.imageUrl}" alt="Scanned Bill" style="max-width: 100%; max-height: 400px; border-radius: 6px; margin-top: 0.5rem;">
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        console.error('Error viewing scan:', error);
        alert('Error loading scan details');
    }
}

async function viewPayment(paymentId) {
    try {
        const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
        let payment = null;

        if (isFirebaseConfigured) {
            const paymentDoc = await db.collection('payments').doc(paymentId).get();
            payment = paymentDoc.data();
        } else {
            // Demo mode
            const allUsers = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
            for (const user of allUsers) {
                if (user.paymentHistory) {
                    const found = user.paymentHistory.find(p => p.id === paymentId);
                    if (found) {
                        payment = found;
                        payment.userEmail = user.email;
                        break;
                    }
                }
            }
        }

        if (!payment) {
            alert('Payment not found');
            return;
        }

        const modalHTML = `
            <div class="modal-overlay" id="paymentModal" onclick="closeModal(this)">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2>Payment Details</h2>
                        <button class="modal-close" onclick="closeModal(document.getElementById('paymentModal'))">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="details-grid">
                            <div class="detail-item">
                                <label>Transaction ID</label>
                                <p><code>${paymentId}</code></p>
                            </div>
                            <div class="detail-item">
                                <label>User Email</label>
                                <p>${payment.userEmail || 'N/A'}</p>
                            </div>
                            <div class="detail-item">
                                <label>Amount</label>
                                <p>₹${(payment.amount || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div class="detail-item">
                                <label>Payment Type</label>
                                <p>${payment.type || 'N/A'}</p>
                            </div>
                            <div class="detail-item">
                                <label>Status</label>
                                <p><span class="badge ${payment.status === 'success' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'}">${payment.status || 'pending'}</span></p>
                            </div>
                            <div class="detail-item">
                                <label>Date</label>
                                <p>${formatDate(payment.date) || 'N/A'}</p>
                            </div>
                            <div class="detail-item">
                                <label>Payment Method</label>
                                <p>${payment.method || 'N/A'}</p>
                            </div>
                            <div class="detail-item">
                                <label>Reference ID</label>
                                <p><code>${payment.referenceId || 'N/A'}</code></p>
                            </div>
                            ${payment.notes ? `
                            <div class="detail-item full-width">
                                <label>Notes</label>
                                <p>${payment.notes}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        console.error('Error viewing payment:', error);
        alert('Error loading payment details');
    }
}

function closeModal(modalElement) {
    modalElement.remove();
}

// Load Recent Activities (Demo Mode)
function loadRecentActivitiesDemoMode(users) {
    const container = document.getElementById('recentActivities');
    container.innerHTML = '';

    if (!users || users.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No activities yet</p>';
        return;
    }

    const activities = [];
    users.forEach(user => {
        if (user.stats && user.stats.lastActivity) {
            activities.push({
                action: `${user.name} scanned a bill`,
                email: user.email,
                timestamp: user.stats.lastActivity
            });
        }
    });

    if (activities.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No activities yet</p>';
        return;
    }

    activities.slice(0, 10).forEach(activity => {
        const activityEl = document.createElement('div');
        activityEl.className = 'activity-item';
        activityEl.innerHTML = `
            <div>
                <strong>${activity.action}</strong>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">
                    ${activity.email || 'Unknown user'}
                </p>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">
                ${formatTime(activity.timestamp)}
            </span>
        `;
        container.appendChild(activityEl);
    });
}

// Load Active Users (Demo Mode)
function loadActiveUsersDemoMode(users) {
    const container = document.getElementById('activeUsers');
    container.innerHTML = '';

    if (!users || users.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No active users</p>';
        return;
    }

    const activeUsers = users.filter(u => u.isActive !== false).slice(0, 5);

    if (activeUsers.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No active users</p>';
        return;
    }

    activeUsers.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = 'activity-item';
        userEl.innerHTML = `
            <div>
                <strong>${user.name}</strong>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">
                    ${user.email}
                </p>
            </div>
            <span class="badge success">Active</span>
        `;
        container.appendChild(userEl);
    });
}

// ========== SCANS EXPORT FUNCTIONS ==========

// Export scans as CSV
function exportScansCSV(scans) {
    const csv = 'User,Language,Date,Text Preview\n' +
        scans.map(s => `"${s.userEmail || 'Unknown'}","${s.language || 'N/A'}","${formatDate(s.scanDate) || 'Today'}","${(s.text || s.originalText || '').substring(0, 50)}"\n`).join('');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VoiceBox_Scans_${Date.now()}.csv`;
    a.click();
}

// Export scans as PDF
function exportScansPDF(scans) {
    if (!scans || scans.length === 0) {
        alert('No scans to export');
        return;
    }

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
        pdf.text('VoiceBox - Bill Scans Report', margin, yPos);

        yPos += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Total Scans: ${scans.length}  |  Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, margin, yPos);

        yPos += 10;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // Each scan entry
        scans.forEach((scan, index) => {
            checkPageBreak(50);

            // Scan header
            pdf.setFillColor(16, 185, 129); // Green color
            pdf.rect(margin, yPos - 5, contentWidth, 10, 'F');

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(255, 255, 255);
            pdf.text(`${index + 1}. Scan by ${scan.userEmail || 'Unknown'}`, margin + 3, yPos);
            yPos += 10;

            pdf.setTextColor(50, 50, 50);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);

            // Language and Date
            pdf.setFont('helvetica', 'bold');
            pdf.text('Language:', margin + 8, yPos);
            pdf.setFont('helvetica', 'normal');
            pdf.text(scan.language || 'N/A', margin + 40, yPos);
            yPos += 6;

            pdf.setFont('helvetica', 'bold');
            pdf.text('Scan Date:', margin + 8, yPos);
            pdf.setFont('helvetica', 'normal');
            pdf.text(formatDate(scan.scanDate) || 'Today', margin + 40, yPos);
            yPos += 8;

            // Scanned Text
            pdf.setFont('helvetica', 'bold');
            pdf.text('Scanned Text:', margin + 8, yPos);
            yPos += 6;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);

            let scanText = scan.text || scan.originalText || 'No text available';

            // Try to properly encode the text
            try {
                const encoder = new TextEncoder();
                const decoder = new TextDecoder('utf-8', { fatal: false });
                const bytes = encoder.encode(scanText);
                scanText = decoder.decode(bytes);
            } catch (e) {
                console.warn('Text encoding issue in bulk export:', e);
            }

            const textLines = pdf.splitTextToSize(scanText.substring(0, 500), contentWidth - 20);

            textLines.forEach((line, idx) => {
                if (idx >= 10) return; // Limit to 10 lines
                checkPageBreak(5);
                try {
                    pdf.text(line, margin + 12, yPos);
                } catch (err) {
                    pdf.text('[Text contains unsupported characters]', margin + 12, yPos);
                    console.warn('Error adding text line:', err);
                }
                yPos += 5;
            });

            if (scanText.length > 500) {
                pdf.setTextColor(120, 120, 120);
                pdf.text('... (text truncated)', margin + 12, yPos);
                pdf.setTextColor(50, 50, 50);
                yPos += 5;
            }

            yPos += 5;
            pdf.setDrawColor(220, 220, 220);
            pdf.setLineWidth(0.3);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 12;
        });

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Generated by VoiceBox Admin Panel', margin, pageHeight - 10);

        pdf.save(`VoiceBox_Scans_Report_${Date.now()}.pdf`);
    } catch (err) {
        console.error('Error exporting scans PDF:', err);
        alert('Failed to generate PDF: ' + err.message);
    }
}

// ========== PAYMENTS EXPORT FUNCTIONS ==========

// Export payments as CSV
function exportPaymentsCSV(payments) {
    const csv = 'Transaction ID,User,Amount,Type,Status,Date\n' +
        payments.map(p => `"#${(p.id || '').substring(0, 8)}","${p.userEmail || 'Unknown'}","₹${p.amount || 0}","${p.type || 'N/A'}","${p.status || 'pending'}","${formatDate(p.date) || 'Today'}"\n`).join('');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VoiceBox_Payments_${Date.now()}.csv`;
    a.click();
}

// Export payments as PDF
function exportPaymentsPDF(payments) {
    if (!payments || payments.length === 0) {
        alert('No payments to export');
        return;
    }

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
        pdf.text('VoiceBox - Payments Report', margin, yPos);

        yPos += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);

        const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        pdf.text(`Total Transactions: ${payments.length}  |  Total Amount: ₹${totalAmount.toLocaleString('en-IN')}`, margin, yPos);
        yPos += 5;
        pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, margin, yPos);

        yPos += 10;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // Table header
        pdf.setFillColor(245, 158, 11);
        pdf.rect(margin, yPos - 5, contentWidth, 10, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.text('#', margin + 3, yPos);
        pdf.text('Transaction ID', margin + 12, yPos);
        pdf.text('User', margin + 50, yPos);
        pdf.text('Amount', margin + 100, yPos);
        pdf.text('Type', margin + 130, yPos);
        pdf.text('Status', margin + 160, yPos);
        yPos += 10;

        pdf.setTextColor(50, 50, 50);

        // Each payment row
        payments.forEach((payment, index) => {
            checkPageBreak(10);

            // Alternating row colors
            if (index % 2 === 0) {
                pdf.setFillColor(250, 250, 252);
                pdf.rect(margin, yPos - 4, contentWidth, 8, 'F');
            }

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);

            pdf.text(`${index + 1}.`, margin + 3, yPos);
            pdf.text(`#${(payment.id || index).toString().substring(0, 8)}`, margin + 12, yPos);
            pdf.text((payment.userEmail || 'Unknown').substring(0, 20), margin + 50, yPos);
            pdf.text(`₹${(payment.amount || 0).toLocaleString('en-IN')}`, margin + 100, yPos);
            pdf.text((payment.type || 'N/A').substring(0, 12), margin + 130, yPos);

            // Status with color
            const statusColors = {
                'success': [16, 185, 129],
                'pending': [245, 158, 11],
                'failed': [239, 68, 68]
            };
            const statusColor = statusColors[payment.status] || [100, 100, 100];
            pdf.setTextColor(...statusColor);
            pdf.text(payment.status || 'pending', margin + 160, yPos);
            pdf.setTextColor(50, 50, 50);

            yPos += 7;
        });

        // Footer
        yPos += 5;
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Generated by VoiceBox Admin Panel', margin, pageHeight - 10);

        pdf.save(`VoiceBox_Payments_Report_${Date.now()}.pdf`);
    } catch (err) {
        console.error('Error exporting payments PDF:', err);
        alert('Failed to generate PDF: ' + err.message);
    }
}

// ==================== SEARCH FUNCTIONALITY ====================
// Initialize search feature
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        console.log('✅ Search functionality initialized');
    } else {
        console.warn('⚠️ Search input not found');
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const currentPage = document.querySelector('.page.active').id;

    console.log('🔍 Searching:', searchTerm, 'on page:', currentPage);

    if (!searchTerm) {
        // If search is empty, show all rows
        showAllRows();
        return;
    }

    // Search based on current page
    switch (currentPage) {
        case 'users':
            searchUsers(searchTerm);
            break;
        case 'scans':
            searchScans(searchTerm);
            break;
        case 'payments':
            searchPayments(searchTerm);
            break;
        default:
            console.log('Search not applicable on this page');
    }
}

function searchUsers(searchTerm) {
    const rows = document.querySelectorAll('#usersTable tbody tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const name = row.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || '';
        const email = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        const role = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';

        if (name.includes(searchTerm) || email.includes(searchTerm) || role.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    console.log(`✅ Found ${visibleCount} users matching "${searchTerm}"`);
    updateEmptyState('usersTable', visibleCount, `No users found matching "${searchTerm}"`);
}

function searchScans(searchTerm) {
    const rows = document.querySelectorAll('#scansTable tbody tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const user = row.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || '';
        const language = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        const date = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
        const text = row.querySelector('td:nth-child(4)')?.textContent.toLowerCase() || '';

        if (user.includes(searchTerm) || language.includes(searchTerm) ||
            date.includes(searchTerm) || text.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    console.log(`✅ Found ${visibleCount} scans matching "${searchTerm}"`);
    updateEmptyState('scansTable', visibleCount, `No scans found matching "${searchTerm}"`);
}

function searchPayments(searchTerm) {
    const rows = document.querySelectorAll('#paymentsTable tbody tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const user = row.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || '';
        const amount = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        const type = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
        const date = row.querySelector('td:nth-child(4)')?.textContent.toLowerCase() || '';
        const status = row.querySelector('td:nth-child(5)')?.textContent.toLowerCase() || '';

        if (user.includes(searchTerm) || amount.includes(searchTerm) ||
            type.includes(searchTerm) || date.includes(searchTerm) || status.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    console.log(`✅ Found ${visibleCount} payments matching "${searchTerm}"`);
    updateEmptyState('paymentsTable', visibleCount, `No payments found matching "${searchTerm}"`);
}

function showAllRows() {
    // Show all rows in all tables
    document.querySelectorAll('#usersTable tbody tr, #scansTable tbody tr, #paymentsTable tbody tr')
        .forEach(row => row.style.display = '');

    // Hide empty states
    document.querySelectorAll('.empty-state').forEach(state => state.style.display = 'none');
}

function updateEmptyState(tableId, visibleCount, message) {
    const table = document.getElementById(tableId);
    if (!table) return;

    let emptyState = table.parentElement.querySelector('.empty-state');

    if (visibleCount === 0) {
        // No results - show custom message
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.style.textAlign = 'center';
            emptyState.style.padding = '40px 20px';
            emptyState.style.color = '#666';
            table.parentElement.appendChild(emptyState);
        }
        emptyState.innerHTML = `
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin: 0 auto 15px; display: block; opacity: 0.3;">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
            </svg>
            <h3 style="margin: 0 0 10px; font-size: 18px;">${message}</h3>
            <p style="margin: 0; font-size: 14px; opacity: 0.7;">Try a different search term</p>
        `;
        emptyState.style.display = 'block';
        table.style.display = 'none';
    } else {
        // Results found - hide empty state
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        table.style.display = '';
    }
}

