// controllers/notificationController.js
const Notification = require('../models/notificationModel');
const { v4: uuidv4 } = require('uuid');

// Create a new notification and send via WebSocket
const createNotification = async ({ user_id, type, title, message, related_id }) => {
    try {
        const notification = await Notification.create({
            notification_id: uuidv4(),
            user_id,
            type,
            title: title || null,
            message,
            related_id: related_id || null,
            is_read: false,
            timestamp: new Date()
        });

        console.log(`✅ Notification created for user ${user_id}:`, {
            type,
            title,
            message
        });

        // Send real-time notification via chat WebSocket
        try {
            const chatService = require('../services/chatService');
            chatService.sendNotificationToUser(user_id, notification);
        } catch (wsError) {
            console.log('📝 WebSocket unavailable, notification saved to database only');
        }

        return notification;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        throw error;
    }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { unread_only, limit = 50 } = req.query;

        const whereClause = { user_id: userId };
        if (unread_only === 'true') {
            whereClause.is_read = false;
        }

        const notifications = await Notification.findAll({
            where: whereClause,
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { notification_id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({
            where: {
                notification_id,
                user_id: userId
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.is_read = true;
        await notification.save();

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.update(
            { is_read: true },
            { where: { user_id: userId, is_read: false } }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('❌ Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { notification_id } = req.params;
        const userId = req.user.id;

        const result = await Notification.destroy({
            where: {
                notification_id,
                user_id: userId
            }
        });

        if (result === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('❌ Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
};

// Get unread count
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await Notification.count({
            where: {
                user_id: userId,
                is_read: false
            }
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('❌ Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count',
            error: error.message
        });
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
};
