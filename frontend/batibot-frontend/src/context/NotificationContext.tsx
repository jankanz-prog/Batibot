// context/NotificationContext.tsx - Notification context using notification WebSocket
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/notificationAPI';
import { notificationWebSocket } from '../services/notificationWebSocket';
import type { Notification, NotificationContextType } from '../types/notification';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { user, token } = useAuth();
    
    // State
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    // Handle new notification received
    const handleNewNotification = useCallback((notification: Notification) => {
        console.log('🔔 NotificationContext handleNewNotification called!');
        console.log('🔔 New notification data:', notification);
        
        // Add to notifications list
        setNotifications(prev => {
            console.log('📝 Adding notification to list. Current count:', prev.length);
            return [notification, ...prev];
        });
        
        // Increment unread count
        setUnreadCount(prev => {
            console.log('📊 Incrementing unread count from', prev, 'to', prev + 1);
            return prev + 1;
        });
        
        // Show browser notification if permitted
        showBrowserNotification(notification);
        
        // Play notification sound (optional)
        playNotificationSound();
    }, []);

    // Load notifications
    const loadNotifications = useCallback(async () => {
        if (!token) return;

        try {
            console.log('📥 Loading notifications from API...');
            const response = await notificationAPI.getNotifications(false, 50, token);
            
            if (response.success && response.data) {
                console.log(`✅ Loaded ${response.data.length} notifications`);
                setNotifications(response.data);
            }
        } catch (error) {
            console.error('❌ Failed to load notifications:', error);
        }
    }, [token]);

    // Load unread count
    const loadUnreadCount = useCallback(async () => {
        if (!token) return;

        try {
            const response = await notificationAPI.getUnreadCount(token);
            
            if (response.success) {
                console.log(`📊 Unread notifications: ${response.count}`);
                setUnreadCount(response.count);
            }
        } catch (error) {
            console.error('❌ Failed to load unread count:', error);
        }
    }, [token]);

    // Initialize global WebSocket connection and listen for notifications
    useEffect(() => {
        if (user && token) {
            console.log('🌐 Initializing global WebSocket connection for user:', user.username);
            
            // Connect to notification WebSocket
            const initWebSocket = async () => {
                try {
                    await notificationWebSocket.connect(token);
                    console.log('✅ Notification WebSocket connected');
                } catch (error) {
                    console.error('❌ Failed to connect to notification WebSocket:', error);
                }
            };
            
            initWebSocket();
            
            // Set up notification listener
            console.log('🔔 Registering notification event listener');
            notificationWebSocket.on('newNotification', handleNewNotification);
            console.log('✅ Notification listener registered successfully');

            // Load initial notifications
            loadNotifications();
            loadUnreadCount();

            return () => {
                console.log('🧹 Cleaning up notification WebSocket connection');
                notificationWebSocket.off('newNotification', handleNewNotification);
                notificationWebSocket.disconnect();
            };
        }
    }, [user, token, handleNewNotification, loadNotifications, loadUnreadCount]);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId: string) => {
        if (!token) return;

        try {
            const response = await notificationAPI.markAsRead(notificationId, token);
            
            if (response.success) {
                // Update local state
                setNotifications(prev => 
                    prev.map(n => 
                        n.notification_id === notificationId 
                            ? { ...n, is_read: true } 
                            : n
                    )
                );
                
                // Decrement unread count
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('❌ Failed to mark notification as read:', error);
        }
    }, [token]);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        if (!token) return;

        try {
            console.log('📝 Marking all notifications as read...');
            const response = await notificationAPI.markAllAsRead(token);
            
            console.log('📝 Mark all read response:', response);
            
            if (response.success) {
                console.log('✅ All notifications marked as read');
                // Update local state
                setNotifications(prev => 
                    prev.map(n => ({ ...n, is_read: true }))
                );
                
                // Reset unread count
                setUnreadCount(0);
            } else {
                console.error('❌ Mark all as read failed:', response.message);
            }
        } catch (error) {
            console.error('❌ Failed to mark all notifications as read:', error);
        }
    }, [token]);

    // Delete notification
    const deleteNotification = useCallback(async (notificationId: string) => {
        if (!token) return;

        try {
            const response = await notificationAPI.deleteNotification(notificationId, token);
            
            if (response.success) {
                // Remove from local state
                setNotifications(prev => {
                    const notification = prev.find(n => n.notification_id === notificationId);
                    if (notification && !notification.is_read) {
                        setUnreadCount(count => Math.max(0, count - 1));
                    }
                    return prev.filter(n => n.notification_id !== notificationId);
                });
            }
        } catch (error) {
            console.error('❌ Failed to delete notification:', error);
        }
    }, [token]);

    // Show browser notification
    const showBrowserNotification = (notification: Notification) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title || 'New Notification', {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.notification_id
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(notification.title || 'New Notification', {
                        body: notification.message,
                        icon: '/favicon.ico',
                        tag: notification.notification_id
                    });
                }
            });
        }
    };

    // Play notification sound
    const playNotificationSound = () => {
        // Optional: Play a sound when notification is received
        // const audio = new Audio('/notification-sound.mp3');
        // audio.play().catch(console.error);
    };

    const contextValue: NotificationContextType = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadNotifications
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};
