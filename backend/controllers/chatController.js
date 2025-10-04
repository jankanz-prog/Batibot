// controllers/chatController.js - Chat message controller
const ChatMessage = require('../models/chatMessageModel');
const User = require('../models/userModel');
const { Op } = require('sequelize');

// Get chat messages (DM or global)
const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { receiver_id, limit = 50, offset = 0 } = req.query;

        let whereClause = {};

        if (receiver_id === 'global' || receiver_id === 'null') {
            // Global chat messages (receiver_id is null)
            whereClause.receiver_id = null;
        } else if (receiver_id) {
            // Direct messages between two users
            whereClause = {
                [Op.or]: [
                    { sender_id: userId, receiver_id: parseInt(receiver_id) },
                    { sender_id: parseInt(receiver_id), receiver_id: userId }
                ]
            };
        } else {
            // All messages involving the user (both sent and received)
            whereClause = {
                [Op.or]: [
                    { sender_id: userId },
                    { receiver_id: userId },
                    { receiver_id: null } // Include global messages
                ]
            };
        }

        const messages = await ChatMessage.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username'],
                    required: false // Left join for global messages
                }
            ],
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            data: messages.reverse(), // Reverse to show oldest first
            count: messages.length
        });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};

// Send a new message (handled via WebSocket, but keeping REST endpoint for backup)
const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { 
            receiver_id, 
            content, 
            attachment_url, 
            attachment_type, 
            attachment_filename 
        } = req.body;

        // Validate input
        if (!content && !attachment_url) {
            return res.status(400).json({
                success: false,
                message: 'Either content or attachment must be provided'
            });
        }

        // Determine message type
        let messageType = 'text';
        if (attachment_url && content) {
            messageType = 'mixed';
        } else if (attachment_url) {
            messageType = 'attachment';
        }

        // Create message
        const message = await ChatMessage.create({
            sender_id: senderId,
            receiver_id: receiver_id === 'global' ? null : receiver_id,
            content: content || null,
            attachment_url: attachment_url || null,
            attachment_type: attachment_type || null,
            attachment_filename: attachment_filename || null,
            message_type: messageType
        });

        // Fetch the complete message with user data
        const completeMessage = await ChatMessage.findByPk(message.message_id, {
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username'],
                    required: false
                }
            ]
        });

        res.status(201).json({
            success: true,
            data: completeMessage,
            message: 'Message sent successfully'
        });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

// Get conversation list (users the current user has chatted with)
const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get unique users who have sent or received messages from current user
        const conversations = await ChatMessage.findAll({
            attributes: [],
            where: {
                [Op.or]: [
                    { sender_id: userId },
                    { receiver_id: userId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username']
                }
            ],
            order: [['timestamp', 'DESC']]
        });

        // Extract unique users
        const uniqueUsers = new Map();
        
        conversations.forEach(msg => {
            if (msg.sender && msg.sender.id !== userId) {
                uniqueUsers.set(msg.sender.id, msg.sender);
            }
            if (msg.receiver && msg.receiver.id !== userId) {
                uniqueUsers.set(msg.receiver.id, msg.receiver);
            }
        });

        res.status(200).json({
            success: true,
            data: Array.from(uniqueUsers.values())
        });

    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations',
            error: error.message
        });
    }
};

// Delete a message (only sender can delete)
const deleteMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message_id } = req.params;

        const message = await ChatMessage.findByPk(message_id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        if (message.sender_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own messages'
            });
        }

        await message.destroy();

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message',
            error: error.message
        });
    }
};

// Get all users for chat user list
const getAllUsers = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Get all users except current user
        const users = await User.findAll({
            where: {
                id: {
                    [Op.ne]: currentUserId // Not equal to current user
                }
            },
            attributes: ['id', 'username'],
            order: [['username', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

module.exports = {
    getMessages,
    sendMessage,
    getConversations,
    deleteMessage,
    getAllUsers
};
