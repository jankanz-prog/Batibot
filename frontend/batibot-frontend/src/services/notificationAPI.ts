// services/notificationAPI.ts
import type { NotificationResponse } from '../types/notification';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const notificationAPI = {
    // Get all notifications
    getNotifications: async (unreadOnly: boolean = false, limit: number = 50, token: string): Promise<NotificationResponse> => {
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                ...(unreadOnly && { unread_only: 'true' })
            });

            const response = await fetch(`${API_URL}/api/notifications?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    // Get unread count
    getUnreadCount: async (token: string): Promise<{ success: boolean; count: number }> => {
        try {
            const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId: string, token: string): Promise<NotificationResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // Mark all as read
    markAllAsRead: async (token: string): Promise<NotificationResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/notifications/mark-all-read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    // Delete notification
    deleteNotification: async (notificationId: string, token: string): Promise<NotificationResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
};
