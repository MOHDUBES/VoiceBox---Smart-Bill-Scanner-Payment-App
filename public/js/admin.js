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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    initializeNavigation();
    initializeRefreshButton();
    initializeLogout();
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
    const users = JSON.parse(localStorage.getItem('voicebox_users') || '[]');
    const bills = JSON.parse(localStorage.getItem('scannedBills') || '[]');

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
        const usersSnapshot = await db.collection('users').get();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

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
                    <button onclick="viewUser('${doc.id}')" style="padding: 0.5rem; background: var(--primary); border: none; border-radius: 6px; color: white; cursor: pointer;">View</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Export button
        document.getElementById('exportUsersBtn').onclick = () => exportData(usersSnapshot, 'users');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load All Scans
async function loadScans() {
    try {
        const scansSnapshot = await db.collection('billScans').get();
        const tbody = document.getElementById('scansTableBody');
        tbody.innerHTML = '';

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
                    <button onclick="viewScan('${doc.id}')" style="padding: 0.5rem; background: var(--primary); border: none; border-radius: 6px; color: white; cursor: pointer;">View</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.getElementById('exportScansBtn').onclick = () => exportData(scansSnapshot, 'scans');
    } catch (error) {
        console.error('Error loading scans:', error);
    }
}

// Load All Payments
async function loadPayments() {
    try {
        const paymentsSnapshot = await db.collection('payments').get();
        const tbody = document.getElementById('paymentsTableBody');
        tbody.innerHTML = '';

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
                    <button onclick="viewPayment('${doc.id}')" style="padding: 0.5rem; background: var(--primary); border: none; border-radius: 6px; color: white; cursor: pointer;">View</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.getElementById('exportPaymentsBtn').onclick = () => exportData(paymentsSnapshot, 'payments');
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

// Load Analytics
async function loadAnalytics() {
    // Simple analytics text for now
    document.getElementById('topUsersChart').textContent = 'Analytics charts will be implemented here';
    document.getElementById('languageChart').textContent = 'Language distribution chart';
    document.getElementById('activityChart').textContent = 'Activity trend chart';
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

// View functions (can be expanded)
function viewUser(userId) {
    alert(`Viewing user: ${userId}\n\nFull user details would be shown in a modal here.`);
}

function viewScan(scanId) {
    alert(`Viewing scan: ${scanId}\n\nFull scan details with image would be shown here.`);
}

function viewPayment(paymentId) {
    alert(`Viewing payment: ${paymentId}\n\nFull payment details would be shown here.`);
}
