// Dashboard JavaScript functionality

class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupUserMenu();
        this.setupNotifications();
        this.setupCharts();
        this.loadDashboardData();
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const sidebar = document.querySelector('.dashboard-sidebar');
        
        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024 && 
                    !sidebar.contains(e.target) && 
                    !mobileMenuBtn.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }
    }

    setupUserMenu() {
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            const avatar = userMenu.querySelector('.user-avatar');
            const dropdown = userMenu.querySelector('.user-dropdown');
            
            if (avatar && dropdown) {
                avatar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('active');
                });

                // Close dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!userMenu.contains(e.target)) {
                        dropdown.classList.remove('active');
                    }
                });
            }
        }
    }

    setupNotifications() {
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }
    }

    setupCharts() {
        this.animateProgressBars();
        this.animateStatCards();
    }

    animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill, .usage-fill');
        
        progressBars.forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 500);
        });
    }

    animateStatCards() {
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    loadDashboardData() {
        // Mock data loading
        this.updateTokenUsage();
        this.loadRecentActivity();
        this.checkSystemStatus();
    }

    updateTokenUsage() {
        // Simulate real-time token usage updates
        const tokenUsageElement = document.querySelector('.usage-fill');
        if (tokenUsageElement) {
            setInterval(() => {
                const currentWidth = parseFloat(tokenUsageElement.style.width);
                const newWidth = Math.min(currentWidth + Math.random() * 0.5, 100);
                tokenUsageElement.style.width = newWidth + '%';
                
                // Update warning if usage is high
                if (newWidth > 80) {
                    this.showUsageWarning();
                }
            }, 30000); // Update every 30 seconds
        }
    }

    showUsageWarning() {
        const existingWarning = document.querySelector('.usage-warning');
        if (existingWarning) return; // Don't show multiple warnings

        const chartSection = document.querySelector('.chart-section');
        if (chartSection) {
            const warning = document.createElement('div');
            warning.className = 'usage-warning animate-slide-down';
            warning.innerHTML = `
                <i class="icon-warning"></i>
                <span>You're running low on tokens. Consider upgrading your plan.</span>
            `;
            chartSection.appendChild(warning);
        }
    }

    loadRecentActivity() {
        // Mock recent activity loading
        const activities = [
            { type: 'project', message: 'Created new project "E-commerce Website"', time: '2 minutes ago' },
            { type: 'file', message: 'Modified App.jsx in Portfolio Site', time: '15 minutes ago' },
            { type: 'deploy', message: 'Deployed Blog Platform to production', time: '1 hour ago' },
        ];

        this.displayRecentActivity(activities);
    }

    displayRecentActivity(activities) {
        const activityContainer = document.querySelector('.recent-activity');
        if (!activityContainer) return;

        const activityHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon activity-${activity.type}">
                    <i class="icon-${activity.type}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');

        activityContainer.innerHTML = activityHTML;
    }

    checkSystemStatus() {
        // Mock system status check
        setTimeout(() => {
            this.updateSystemStatus('operational');
        }, 1000);
    }

    updateSystemStatus(status) {
        const statusIndicator = document.querySelector('.system-status');
        if (statusIndicator) {
            statusIndicator.className = `system-status status-${status}`;
            statusIndicator.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
    }

    showNotifications() {
        // Mock notifications
        const notifications = [
            { type: 'info', message: 'New feature: AI code suggestions now available', time: '5 minutes ago' },
            { type: 'success', message: 'Project "Portfolio Site" deployed successfully', time: '1 hour ago' },
            { type: 'warning', message: 'Token usage at 75% of daily limit', time: '2 hours ago' },
        ];

        this.displayNotifications(notifications);
    }

    displayNotifications(notifications) {
        // Create notifications modal
        const modal = document.createElement('div');
        modal.className = 'notifications-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Notifications</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${notifications.map(notification => `
                        <div class="notification-item notification-${notification.type}">
                            <div class="notification-content">
                                <p>${notification.message}</p>
                                <span class="notification-time">${notification.time}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        [closeBtn, backdrop].forEach(element => {
            element.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Animate modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    exportData() {
        // Mock data export
        const data = {
            tokenUsage: document.querySelector('.stat-value').textContent,
            projects: Array.from(document.querySelectorAll('.project-item')).map(item => ({
                name: item.querySelector('h3').textContent,
                status: item.querySelector('.status-badge').textContent
            })),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zama-dashboard-data.json';
        a.click();
        
        URL.revokeObjectURL(url);
        
        window.zamaApp?.showNotification('Dashboard data exported successfully', 'success');
    }

    refreshDashboard() {
        window.zamaApp?.showLoading('Refreshing dashboard...');
        
        setTimeout(() => {
            this.loadDashboardData();
            window.zamaApp?.hideLoading();
            window.zamaApp?.showNotification('Dashboard refreshed', 'success');
        }, 1500);
    }
}

// Initialize dashboard manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.dashboard-layout')) {
        window.dashboardManager = new DashboardManager();
    }
});