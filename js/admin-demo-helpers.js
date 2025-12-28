// Demo Mode Activities and Users Functions

// Load Recent Activities (Demo Mode)
function loadRecentActivitiesDemoMode(users) {
    const container = document.getElementById('recentActivities');
    container.innerHTML = '';

    if (users.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No activities yet</p>';
        return;
    }

    // Show recent logins
    users.slice(0, 10).forEach(user => {
        const activityEl = document.createElement('div');
        activityEl.className = 'activity-item';
        activityEl.innerHTML = `
            <div>
                <strong>${user.authProvider === 'google' ? '🔓 Google Login' : '✉️ Email Login'}</strong>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">
                    ${user.email}
                </p>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">
                ${new Date(user.createdAt).toLocaleDateString()}
            </span>
        `;
        container.appendChild(activityEl);
    });
}

// Load Active Users (Demo Mode)
function loadActiveUsersDemoMode(users) {
    const container = document.getElementById('activeUsers');
    container.innerHTML = '';

    if (users.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No active users</p>';
        return;
    }

    users.slice(0, 5).forEach(user => {
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

// Append to admin.js after the existing functions
