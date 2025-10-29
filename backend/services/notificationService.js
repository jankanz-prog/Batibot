// services/notificationService.js - Global notification service
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { createNotification } = require('../controllers/notificationController');

class NotificationService {
    constructor() {
        this.wss = null;
        this.clients = new Map(); // Map of userId -> WebSocket connection
        this.chatService = null; // Reference to chat service for integration
    }

    // Initialize WebSocket server for notifications
    initialize(server) {
        this.wss = new WebSocket.Server({ 
            noServer: true
        });

        this.wss.on('connection', this.handleConnection.bind(this));
        console.log('🔔 WebSocket notification service initialized on /notifications');
    }

    // Set chat service reference for integration
    setChatService(chatService) {
        this.chatService = chatService;
    }

    // Handle new WebSocket connection
    async handleConnection(ws, req) {
        console.log('🔌 New notification WebSocket connection attempt');

        try {
            // Extract token from query parameters or headers
            const url = new URL(req.url, `http://${req.headers.host}`);
            const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                ws.close(1008, 'Authentication required');
                return;
            }

            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findByPk(decoded.userId);

            if (!user) {
                ws.close(1008, 'Invalid user');
                return;
            }

            // Store user info in WebSocket connection
            ws.userId = user.id;
            ws.username = user.username;
            ws.isAlive = true;
            ws.lastActivity = Date.now();

            // Add to clients map
            this.clients.set(user.id, ws);

            console.log(`✅ User ${user.username} (ID: ${user.id}) connected to notifications`);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'notification_connection_success',
                message: 'Connected to notification service',
                user: {
                    id: user.id,
                    username: user.username
                }
            }));

            // Broadcast user online status to all services
            this.broadcastUserOnlineStatus(user.id, user.username, true);

            // Handle incoming messages
            ws.on('message', (data) => this.handleMessage(ws, data));

            // Handle connection close
            ws.on('close', () => this.handleDisconnection(ws));

            // Handle pong for heartbeat
            ws.on('pong', () => {
                ws.isAlive = true;
                ws.lastActivity = Date.now();
            });

        } catch (error) {
            console.error('❌ Notification WebSocket authentication error:', error.message);
            ws.close(1008, 'Authentication failed');
        }
    }

    // Handle incoming messages
    async handleMessage(ws, data) {
        try {
            const messageData = JSON.parse(data);
            
            switch (messageData.type) {
                case 'heartbeat':
                    ws.lastActivity = Date.now();
                    ws.send(JSON.stringify({ type: 'heartbeat_response' }));
                    break;
                case 'mark_read':
                    // Handle marking notification as read
                    this.handleMarkRead(ws, messageData);
                    break;
                default:
                    console.log(`❓ Unknown notification message type: ${messageData.type}`);
            }

        } catch (error) {
            console.error('❌ Error handling notification message:', error);
        }
    }

    // Handle marking notification as read
    async handleMarkRead(ws, messageData) {
        // This is handled by REST API, but we can broadcast to other user's devices
        console.log(`📖 Notification marked as read by ${ws.username}`);
    }

    // Handle disconnection
    handleDisconnection(ws) {
        if (ws.userId) {
            this.clients.delete(ws.userId);
            console.log(`❌ User ${ws.username} (ID: ${ws.userId}) disconnected from notifications`);
            
            // Broadcast user offline status only if not connected to chat
            const isConnectedToChat = this.chatService && 
                                     typeof this.chatService.isUserConnected === 'function' && 
                                     this.chatService.isUserConnected(ws.userId);
            
            if (!isConnectedToChat) {
                this.broadcastUserOnlineStatus(ws.userId, ws.username, false);
            }
        }
    }

    // Send notification to specific user
    async sendNotificationToUser(userId, notificationData) {
        try {
            // Create notification in database
            const notification = await createNotification(notificationData);

            // Send via WebSocket if user is online
            const ws = this.clients.get(userId);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'new_notification',
                    data: notification
                }));
                console.log(`🔔 Real-time notification sent to user ${userId}`);
                return true;
            } else {
                console.log(`📬 Notification saved for offline user ${userId}`);
                return false;
            }
        } catch (error) {
            console.error('❌ Error sending notification:', error);
            throw error;
        }
    }

    // Broadcast user online/offline status
    broadcastUserOnlineStatus(userId, username, isOnline) {
        const statusData = {
            type: 'user_online_status',
            data: {
                user_id: userId,
                username: username,
                is_online: isOnline,
                timestamp: Date.now()
            }
        };

        // Broadcast to all notification clients
        this.clients.forEach((ws, clientUserId) => {
            if (clientUserId !== userId && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(statusData));
            }
        });

        // Also notify chat service if available and method exists
        if (this.chatService && typeof this.chatService.handleExternalUserStatus === 'function') {
            this.chatService.handleExternalUserStatus(userId, username, isOnline);
        }
    }

    // Check if user is connected to notification service
    isUserConnected(userId) {
        const ws = this.clients.get(userId);
        return ws && ws.readyState === WebSocket.OPEN;
    }

    // Get all online users (including those on chat)
    getOnlineUsers() {
        const onlineUsers = new Set();
        
        // Add users connected to notification service
        this.clients.forEach((ws, userId) => {
            if (ws.readyState === WebSocket.OPEN) {
                onlineUsers.add(userId);
            }
        });

        // Add users connected to chat service
        if (this.chatService && typeof this.chatService.getOnlineUsers === 'function') {
            try {
                const chatUsers = this.chatService.getOnlineUsers();
                if (Array.isArray(chatUsers)) {
                    chatUsers.forEach(user => onlineUsers.add(user.id));
                }
            } catch (error) {
                console.error('Error getting online users from chat service:', error);
            }
        }

        return Array.from(onlineUsers);
    }

    // Heartbeat to keep connections alive
    startHeartbeat() {
        setInterval(() => {
            this.clients.forEach((ws, userId) => {
                if (ws.isAlive === false) {
                    console.log(`💔 Terminating dead notification connection for user ${userId}`);
                    ws.terminate();
                    this.clients.delete(userId);
                    return;
                }

                ws.isAlive = false;
                ws.ping();
            });
        }, 30000); // Every 30 seconds
    }
}

module.exports = new NotificationService();
