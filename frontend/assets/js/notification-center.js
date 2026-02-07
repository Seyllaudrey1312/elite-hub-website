// notification-center.js - Reusable Notification Center Component

class NotificationCenter {
    constructor(options = {}) {
        this.options = {
            position: options.position || 'top-right', // top-right, top-left, bottom-right, bottom-left
            maxNotifications: options.maxNotifications || 10,
            autoClose: options.autoClose !== false,
            autoCloseDuration: options.autoCloseDuration || 5000,
            pollingInterval: options.pollingInterval || 30,
            ...options
        };

        this.notifications = [];
        this.isInitialized = false;
        this.pollingActive = false;
    }

    init() {
        if (this.isInitialized) return;

        // Create container
        this.container = document.createElement('div');
        this.container.id = 'notification-center-container';
        this.container.className = `fixed ${this.getPositionClass()} z-50 p-4 space-y-3 max-w-md`;
        document.body.appendChild(this.container);

        this.isInitialized = true;

        // Start polling
        this.startPolling();
    }

    getPositionClass() {
        const positions = {
            'top-right': 'top-4 right-4',
            'top-left': 'top-4 left-4',
            'bottom-right': 'bottom-4 right-4',
            'bottom-left': 'bottom-4 left-4'
        };
        return positions[this.options.position] || positions['top-right'];
    }

    async startPolling() {
        if (this.pollingActive) return;
        this.pollingActive = true;

        // Poll immediately
        await this.fetchAndDisplayNotifications();

        // Then poll every X seconds
        this.pollingInterval = setInterval(() => {
            this.fetchAndDisplayNotifications();
        }, this.options.pollingInterval * 1000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        this.pollingActive = false;
    }

    async fetchAndDisplayNotifications() {
        try {
            const data = await getAllNotifications(true, this.options.maxNotifications);
            
            if (data && data.notifications) {
                // Store for reference
                this.notifications = data.notifications;

                // Update UI
                this.updateUnreadBadge(data.unreadCount);
                this.displayNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    updateUnreadBadge(count) {
        const badges = document.querySelectorAll('[data-notification-badge]');
        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    }

    displayNotifications(notifications) {
        if (!this.container) return;

        this.container.innerHTML = '';

        if (!notifications || notifications.length === 0) {
            return;
        }

        // Get unique notification types
        const recentNotifications = notifications.slice(0, 5);

        recentNotifications.forEach((notif, index) => {
            const element = this.createNotificationElement(notif);
            this.container.appendChild(element);

            // Auto-close if enabled
            if (this.options.autoClose) {
                setTimeout(() => {
                    element.classList.add('opacity-0', 'translate-x-96');
                    setTimeout(() => element.remove(), 300);
                }, this.options.autoCloseDuration + (index * 500));
            }
        });

        // Add "View All" button if more than 5
        if (notifications.length > 5) {
            const viewAllBtn = document.createElement('button');
            viewAllBtn.className = 'w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition';
            viewAllBtn.textContent = `View All (${notifications.length})`;
            viewAllBtn.onclick = () => this.openNotificationCenter();
            this.container.appendChild(viewAllBtn);
        }
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `bg-white rounded-lg shadow-lg p-4 border-l-4 transition transform translate-x-0 opacity-100 ${this.getNotificationColorClass(notification.type)}`;
        
        const icon = this.getNotificationIcon(notification.type);
        const date = new Date(notification.createdAt).toLocaleTimeString([], { 
            hour: '2-digit',
            minute: '2-digit'
        });

        element.innerHTML = `
            <div class="flex gap-3">
                <div class="text-2xl">${icon}</div>
                <div class="flex-1">
                    <h4 class="font-bold text-gray-800">${notification.title}</h4>
                    <p class="text-sm text-gray-600">${notification.message}</p>
                    <p class="text-xs text-gray-500 mt-1">${date}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>
        `;

        // Mark as read on click
        element.addEventListener('click', () => {
            this.markAsRead(notification._id);
        });

        return element;
    }

    getNotificationColorClass(type) {
        const colors = {
            'quiz_submitted': 'border-blue-600 bg-blue-50',
            'quiz_graded': 'border-green-600 bg-green-50',
            'announcement': 'border-yellow-600 bg-yellow-50',
            'forum_reply': 'border-purple-600 bg-purple-50',
            'new_resource': 'border-indigo-600 bg-indigo-50',
            'assignment': 'border-orange-600 bg-orange-50',
            'system': 'border-gray-600 bg-gray-50'
        };
        return colors[type] || colors.system;
    }

    getNotificationIcon(type) {
        const icons = {
            'quiz_submitted': '📝',
            'quiz_graded': '📊',
            'announcement': '📢',
            'forum_reply': '💬',
            'new_resource': '📚',
            'assignment': '✏️',
            'system': 'ℹ️'
        };
        return icons[type] || icons.system;
    }

    async markAsRead(notificationId) {
        try {
            await markNotificationAsRead(notificationId);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            await markAllNotificationsAsRead();
            await this.fetchAndDisplayNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    openNotificationCenter() {
        // Can be overridden by calling code to open a full notification center
        console.log('Opening notification center...');
    }

    getNotifications() {
        return this.notifications;
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    destroy() {
        this.stopPolling();
        if (this.container) {
            this.container.remove();
        }
        this.isInitialized = false;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationCenter;
}
