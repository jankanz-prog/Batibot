// routes/chatRoutes.js - Chat message routes
const express = require('express');
const { authenticateToken } = require('../controllers/authController');
const {
    getMessages,
    sendMessage,
    getConversations,
    deleteMessage,
    getAllUsers
} = require('../controllers/chatController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/chat/messages - Get messages (with optional receiver_id query)
// Query params:
//   - receiver_id: 'global' for global chat, user_id for DM, omit for all messages
//   - limit: number of messages to fetch (default: 50)
//   - offset: pagination offset (default: 0)
router.get('/messages', getMessages);

// POST /api/chat/messages - Send a message (backup to WebSocket)
router.post('/messages', sendMessage);

// GET /api/chat/conversations - Get list of users current user has chatted with
router.get('/conversations', getConversations);

// GET /api/chat/users - Get all users for chat user list
router.get('/users', getAllUsers);

// DELETE /api/chat/messages/:message_id - Delete a message
router.delete('/messages/:message_id', deleteMessage);

module.exports = router;
