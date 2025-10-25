// components/NotificationBell.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import '../styles/NotificationBell.css';

export const NotificationBell: React.FC = () => {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = async (notification: any) => {
        // Mark as read
        if (!notification.is_read) {
            await markAsRead(notification.notification_id);
        }

        // Navigate based on notification type
        if (notification.type === 'Chat' && notification.related_id) {
            navigate('/chat', { state: { userId: parseInt(notification.related_id) } });
        } else if (notification.type === 'ItemDrop') {
            navigate('/inventory');
        }

        setIsOpen(false);
    };

    const handleMarkAllRead = async () => {
        console.log('🔔 Mark all read button clicked');
        try {
            await markAllAsRead();
            console.log('✅ Mark all read completed');
        } catch (error) {
            console.error('❌ Mark all read error:', error);
        }
    };

    const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await deleteNotification(notificationId);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'Chat':
                return '💬';
            case 'ItemDrop':
                return '🎁';
            case 'Trade':
                return '🤝';
            case 'Auction':
                return '⚖️';
            case 'System':
                return '⚙️';
            default:
                return '📢';
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    };

    // Get recent notifications (last 10)
    const recentNotifications = notifications.slice(0, 10);

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button
                className="notification-bell-button"
                onClick={() => setIsOpen(!isOpen)}
                title="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                className="mark-all-read-btn"
                                onClick={handleMarkAllRead}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {recentNotifications.length === 0 ? (
                            <div className="notification-empty">
                                <p>No notifications</p>
                            </div>
                        ) : (
                            recentNotifications.map(notification => (
                                <div
                                    key={notification.notification_id}
                                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        {notification.title && (
                                            <div className="notification-title">{notification.title}</div>
                                        )}
                                        <div className="notification-message">{notification.message}</div>
                                        <div className="notification-time">{formatTime(notification.timestamp)}</div>
                                    </div>
                                    <button
                                        className="notification-delete-btn"
                                        onClick={(e) => handleDelete(notification.notification_id, e)}
                                        title="Delete"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 10 && (
                        <div className="notification-footer">
                            <button onClick={() => {
                                navigate('/notifications');
                                setIsOpen(false);
                            }}>
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
