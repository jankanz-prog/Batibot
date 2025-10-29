// types/notification.ts
export interface Notification {
    notification_id: string;
    user_id: number;
    type: 'Trade' | 'ItemDrop' | 'Auction' | 'System' | 'Chat';
    title?: string;
    message: string;
    related_id?: string;
    is_read: boolean;
    timestamp: string;
}

export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    loadNotifications: () => Promise<void>;
}

export interface NotificationResponse {
    success: boolean;
    data?: Notification[];
    count?: number;
    message?: string;
}
