// ===== Admin Dashboard JavaScript =====

// Global variables
let charts = {};
let currentTheme = localStorage.getItem('adminTheme') || 'light';
let notificationTimeout;

// Sample data for demonstration
const sampleData = {
    stats: {
        totalUsers: 12847,
        totalTrips: 8596,
        totalRevenue: 245890,
        activeUsers: 1234,
        avgDuration: 7.2
    },
    
    signupData: {
        labels: ['Oct 1', 'Oct 5', 'Oct 10', 'Oct 15', 'Oct 20', 'Oct 25', 'Oct 30'],
        data: [120, 150, 180, 220, 195, 240, 280]
    },
    
    tripsData: {
        labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        data: [850, 920, 1100, 1350, 1200, 1450]
    },
    
    destinationsData: {
        labels: ['Japan', 'France', 'Italy', 'Thailand', 'UAE', 'Others'],
        data: [25, 20, 18, 15, 12, 10],
        colors: ['#1e40af', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#6b7280']
    },
    
    recentActivity: [
        { user: 'Sarah Johnson', destination: 'Tokyo, Japan', date: '2024-10-30', status: 'active' },
        { user: 'Ahmed Al-Hassan', destination: 'Paris, France', date: '2024-10-30', status: 'completed' },
        { user: 'Emily Chen', destination: 'Bali, Indonesia', date: '2024-10-29', status: 'pending' },
        { user: 'Michael Rodriguez', destination: 'Dubai, UAE', date: '2024-10-29', status: 'active' },
        { user: 'Priya Sharma', destination: 'Rome, Italy', date: '2024-10-28', status: 'canceled' },
        { user: 'David Thompson', destination: 'Bangkok, Thailand', date: '2024-10-28', status: 'completed' }
    ],
    
    recentFeedback: [
        {
            user: 'Sarah Johnson',
            rating: 5,
            text: 'Amazing trip planning experience! Everything was perfectly organized.',
            date: '2024-10-30'
        },
        {
            user: 'Ahmed Al-Hassan',
            rating: 5,
            text: 'Outstanding service! The Malaysia experience was incredible.',
            date: '2024-10-29'
        },
        {
            user: 'Emily Chen',
            rating: 5,
            text: 'Best travel planning experience ever! Highly recommend.',
            date: '2024-10-28'
        },
        {
            user: 'Michael Rodriguez',
            rating: 4,
            text: 'Great platform with excellent recommendations.',
            date: '2024-10-27'
        }
    ]
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeHeader();
    initializeStats();
    initializeCharts();
    initializeActivityTable();
    initializeFeedbackList();
    initializeNotifications();
    startRealTimeUpdates();
});

// ===== Theme Management =====
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('adminTheme', currentTheme);
    updateThemeIcon();
    
    // Update charts for theme change
    setTimeout(() => {
        updateChartsForTheme();
    }, 100);
}

function updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

function updateChartsForTheme() {
    // Update chart colors based on theme
    Object.keys(charts).forEach(chartKey => {
        if (charts[chartKey]) {
            const textColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--text-color').trim();
            const borderColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--border-color').trim();
            
            charts[chartKey].options.scales.x.ticks.color = textColor;
            charts[chartKey].options.scales.y.ticks.color = textColor;
            charts[chartKey].options.scales.x.grid.color = borderColor;
            charts[chartKey].options.scales.y.grid.color = borderColor;
            charts[chartKey].update();
        }
    });
}

// ===== Header Management =====
function initializeHeader() {
    const themeToggle = document.getElementById('themeToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationMenu = document.getElementById('notificationMenu');
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Notifications dropdown
    if (notificationBtn && notificationMenu) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!notificationBtn.contains(e.target) && !notificationMenu.contains(e.target)) {
                notificationMenu.classList.remove('show');
            }
        });
    }
}

// ===== Statistics Management =====
function initializeStats() {
    updateStatCards();
    animateStatNumbers();
}

function updateStatCards() {
    const statElements = {
        totalUsers: document.getElementById('totalUsers'),
        totalTrips: document.getElementById('totalTrips'),
        totalRevenue: document.getElementById('totalRevenue'),
        activeUsers: document.getElementById('activeUsers'),
        avgDuration: document.getElementById('avgDuration')
    };
    
    Object.keys(statElements).forEach(key => {
        if (statElements[key]) {
            const value = sampleData.stats[key];
            if (key === 'avgDuration') {
                statElements[key].textContent = value.toFixed(1);
            } else if (key === 'totalRevenue') {
                statElements[key].textContent = '$' + formatNumber(value);
            } else {
                statElements[key].textContent = formatNumber(value);
            }
        }
    });
}

function animateStatNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const text = stat.textContent.replace(/[$,]/g, '');
        const target = parseInt(text) || parseFloat(text);
        const isRevenue = stat.textContent.includes('$');
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (stat.textContent.includes('.')) {
                stat.textContent = current.toFixed(1);
            } else if (isRevenue) {
                stat.textContent = '$' + formatNumber(Math.floor(current));
            } else {
                stat.textContent = formatNumber(Math.floor(current));
            }
        }, 16);
    });
}

function formatNumber(num) {
    return num.toLocaleString();
}

// ===== Charts Management =====
function initializeCharts() {
    initializeSignupChart();
    initializeTripsChart();
    initializeDestinationsChart();
}

function initializeSignupChart() {
    const ctx = document.getElementById('signupChart');
    if (!ctx) return;
    
    charts.signup = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sampleData.signupData.labels,
            datasets: [{
                label: 'New Signups',
                data: sampleData.signupData.data,
                borderColor: '#1e40af',
                backgroundColor: 'rgba(30, 64, 175, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#1e40af',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#64748b'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#64748b'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function initializeTripsChart() {
    const ctx = document.getElementById('tripsChart');
    if (!ctx) return;
    
    charts.trips = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sampleData.tripsData.labels,
            datasets: [{
                label: 'Trips Created',
                data: sampleData.tripsData.data,
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#64748b'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#64748b'
                    }
                }
            }
        }
    });
}

function initializeDestinationsChart() {
    const ctx = document.getElementById('destinationsChart');
    if (!ctx) return;
    
    charts.destinations = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sampleData.destinationsData.labels,
            datasets: [{
                data: sampleData.destinationsData.data,
                backgroundColor: sampleData.destinationsData.colors,
                borderWidth: 0,
                hoverBorderWidth: 2,
                hoverBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            cutout: '60%'
        }
    });
    
    // Create custom legend
    createDestinationsLegend();
}

function createDestinationsLegend() {
    const legendContainer = document.getElementById('destinationLegend');
    if (!legendContainer) return;
    
    legendContainer.innerHTML = '';
    
    sampleData.destinationsData.labels.forEach((label, index) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const colorBox = document.createElement('div');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = sampleData.destinationsData.colors[index];
        
        const labelText = document.createElement('span');
        labelText.textContent = `${label} (${sampleData.destinationsData.data[index]}%)`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(labelText);
        legendContainer.appendChild(legendItem);
    });
}

// ===== Activity Table Management =====
function initializeActivityTable() {
    const tableBody = document.getElementById('activityTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    sampleData.recentActivity.forEach(activity => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${activity.user}</td>
            <td>${activity.destination}</td>
            <td>${formatDate(activity.date)}</td>
            <td><span class="status-badge ${activity.status}">${activity.status}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// ===== Feedback List Management =====
function initializeFeedbackList() {
    const feedbackList = document.getElementById('feedbackList');
    if (!feedbackList) return;
    
    feedbackList.innerHTML = '';
    
    sampleData.recentFeedback.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        
        feedbackItem.innerHTML = `
            <div class="feedback-header">
                <span class="feedback-user">${feedback.user}</span>
                <div class="feedback-rating">
                    ${generateStars(feedback.rating)}
                </div>
            </div>
            <p class="feedback-text">${feedback.text}</p>
            <span class="feedback-date">${formatDate(feedback.date)}</span>
        `;
        
        feedbackList.appendChild(feedbackItem);
    });
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="fas fa-star${i <= rating ? '' : ' opacity-30'}"></i>`;
    }
    return stars;
}

// ===== Notifications Management =====
function initializeNotifications() {
    // Add click handlers for notification items
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.opacity = '0.6';
            showNotification('Notification marked as read', 'success');
        });
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--white);
        border: 1px solid var(--border-color);
        border-radius: 0.75rem;
        padding: 1rem;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ===== Real-time Updates =====
function startRealTimeUpdates() {
    // Simulate real-time data updates
    setInterval(() => {
        updateRandomStats();
        updateNotificationBadge();
    }, 30000); // Update every 30 seconds
}

function updateRandomStats() {
    // Randomly update some statistics to simulate real-time data
    const statUpdates = {
        activeUsers: Math.floor(Math.random() * 100) + 1200,
        totalUsers: sampleData.stats.totalUsers + Math.floor(Math.random() * 10),
        totalTrips: sampleData.stats.totalTrips + Math.floor(Math.random() * 5),
        totalRevenue: sampleData.stats.totalRevenue + Math.floor(Math.random() * 1000)
    };
    
    Object.keys(statUpdates).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            sampleData.stats[key] = statUpdates[key];
            if (key === 'totalRevenue') {
                element.textContent = '$' + formatNumber(statUpdates[key]);
            } else {
                element.textContent = formatNumber(statUpdates[key]);
            }
            
            // Add pulse animation
            element.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        }
    });
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const currentCount = parseInt(badge.textContent);
        if (Math.random() > 0.7) { // 30% chance to add notification
            badge.textContent = currentCount + 1;
            badge.style.animation = 'bounce 0.5s ease';
            setTimeout(() => {
                badge.style.animation = '';
            }, 500);
        }
    }
}

// ===== Utility Functions =====
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Event Listeners =====
// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Update charts on resize
    Object.keys(charts).forEach(chartKey => {
        if (charts[chartKey]) {
            charts[chartKey].resize();
        }
    });
}, 250));

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh data when page becomes visible
        updateRandomStats();
        showNotification('Dashboard data refreshed', 'info');
    }
});

// ===== CSS Animations (added via JavaScript) =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
        }
        40%, 43% {
            transform: translate3d(0, -10px, 0);
        }
        70% {
            transform: translate3d(0, -5px, 0);
        }
        90% {
            transform: translate3d(0, -2px, 0);
        }
    }
    
    .admin-notification {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--gray);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: all 0.15s ease;
    }
    
    .notification-close:hover {
        background: var(--light-gray);
        color: var(--text-color);
    }
    
    .admin-notification.success .notification-content i {
        color: var(--success);
    }
    
    .admin-notification.error .notification-content i {
        color: var(--danger);
    }
    
    .admin-notification.warning .notification-content i {
        color: var(--warning);
    }
    
    .admin-notification.info .notification-content i {
        color: var(--info);
    }
`;
document.head.appendChild(style);

// ===== Export for potential external use =====
window.AdminDashboard = {
    showNotification,
    toggleTheme,
    updateStats: updateRandomStats,
    charts
};
