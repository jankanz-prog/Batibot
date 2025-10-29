// routes/notificationRoutes.js
const express = require('express');
const { 
    getUserNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    getUnreadCount 
} = require('../controllers/notificationController');
const { authenticateToken } = require('../controllers/authController');

const router = express.Router();

// All routes require authentication
router.get('/notifications', authenticateToken, getUserNotifications);
router.get('/notifications/unread-count', authenticateToken, getUnreadCount);
router.patch('/notifications/:notification_id/read', authenticateToken, markAsRead);
router.patch('/notifications/mark-all-read', authenticateToken, markAllAsRead);
router.delete('/notifications/:notification_id', authenticateToken, deleteNotification);

module.exports = router;
