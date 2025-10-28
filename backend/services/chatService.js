// services/chatService.js - WebSocket chat service
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const ChatMessage = require('../models/chatMessageModel');
const User = require('../models/userModel');
const { createNotification } = require('../controllers/notificationController');

class ChatService {
    constructor() {
        this.wss = null;
        this.clients = new Map(); // Map of userId -> WebSocket connection
    }

    // Initialize WebSocket server
    initialize(server) {
        this.wss = new WebSocket.Server({ 
            server,
            path: '/chat'
        });

        this.wss.on('connection', this.handleConnection.bind(this));
        console.log('💬 WebSocket chat service initialized on /chat');
    }

    // Handle new WebSocket connection
    async handleConnection(ws, req) {
        console.log('🔌 New WebSocket connection attempt');

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

            // Add to clients map
            this.clients.set(user.id, ws);

            console.log(`✅ User ${user.username} (ID: ${user.id}) connected to chat`);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connection_success',
                message: 'Connected to chat',
                user: {
                    id: user.id,
                    username: user.username
                }
            }));

            // Send current online users to the newly connected user
            this.sendCurrentOnlineUsers(ws, user.id);

            // Broadcast user online status to others
            this.broadcastUserStatus(user.id, user.username, 'online');

            // Handle incoming messages
            ws.on('message', (data) => this.handleMessage(ws, data));

            // Handle connection close
            ws.on('close', () => this.handleDisconnection(ws));

            // Handle pong for heartbeat
            ws.on('pong', () => {
                ws.isAlive = true;
            });

        } catch (error) {
            console.error('❌ WebSocket authentication error:', error.message);
            ws.close(1008, 'Authentication failed');
        }
    }

    // Handle incoming messages
    async handleMessage(ws, data) {
        try {
            const messageData = JSON.parse(data);
            console.log(`📨 Message from ${ws.username}:`, messageData);

            switch (messageData.type) {
                case 'send_message':
                    await this.handleSendMessage(ws, messageData);
                    break;
                case 'typing_start':
                    this.handleTypingStatus(ws, messageData, true);
                    break;
                case 'typing_stop':
                    this.handleTypingStatus(ws, messageData, false);
                    break;
                case 'trade_request':
                    this.handleTradeRequest(ws, messageData);
                    break;
                case 'trade_update':
                    this.handleTradeUpdate(ws, messageData);
                    break;
                case 'trade_accept':
                    this.handleTradeAccept(ws, messageData);
                    break;
                case 'trade_cancel':
                    this.handleTradeCancel(ws, messageData);
                    break;
                case 'heartbeat':
                    ws.send(JSON.stringify({ type: 'heartbeat_response' }));
                    break;
                default:
                    console.log(`❓ Unknown message type: ${messageData.type}`);
            }

        } catch (error) {
            console.error('❌ Error handling message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to process message',
                error: error.message
            }));
        }
    }

    // Handle send message
    async handleSendMessage(ws, messageData) {
        const {
            receiver_id,
            content,
            attachment_url,
            attachment_type,
            attachment_filename
        } = messageData;

        // Validate input
        if (!content && !attachment_url) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Either content or attachment must be provided'
            }));
            return;
        }

        // Determine message type
        let messageType = 'text';
        if (attachment_url && content) {
            messageType = 'mixed';
        } else if (attachment_url) {
            messageType = 'attachment';
        }

        // Save message to database
        const message = await ChatMessage.create({
            sender_id: ws.userId,
            receiver_id: receiver_id === 'global' ? null : receiver_id,
            content: content || null,
            attachment_url: attachment_url || null,
            attachment_type: attachment_type || null,
            attachment_filename: attachment_filename || null,
            message_type: messageType
        });

        // Fetch complete message with user data
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

        // Prepare broadcast message
        const broadcastData = {
            type: 'new_message',
            data: completeMessage
        };

        // Broadcast logic
        if (receiver_id === 'global' || !receiver_id) {
            // Global message - broadcast to everyone
            this.broadcastToAll(broadcastData);
            console.log(`📢 Global message from ${ws.username} broadcasted to all users`);
        } else {
            // Direct message - send to sender and receiver only
            const receiverWs = this.clients.get(parseInt(receiver_id));
            
            // Send to receiver if online
            if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
                receiverWs.send(JSON.stringify(broadcastData));
            }
            
            // Send confirmation to sender
            ws.send(JSON.stringify({
                type: 'message_sent',
                data: completeMessage
            }));

            // Create notification for the receiver
            try {
                await createNotification({
                    user_id: parseInt(receiver_id),
                    type: 'Chat',
                    title: `💬 New message from ${ws.username}`,
                    message: content || 'Sent an attachment',
                    related_id: ws.userId.toString() // Store sender's user_id for navigation
                });
                console.log(`🔔 Chat notification created for user ${receiver_id}`);
            } catch (notifError) {
                console.error('Failed to create chat notification:', notifError);
            }

            console.log(`💌 DM from ${ws.username} to user ${receiver_id} ${receiverWs ? 'delivered' : 'queued (user offline)'}`);
        }
    }

    // Handle typing status
    handleTypingStatus(ws, messageData, isTyping) {
        const { receiver_id } = messageData;

        const typingData = {
            type: isTyping ? 'user_typing_start' : 'user_typing_stop',
            data: {
                user_id: ws.userId,
                username: ws.username,
                receiver_id: receiver_id === 'global' ? null : receiver_id
            }
        };

        if (receiver_id === 'global') {
            // Broadcast typing status to everyone except sender
            this.broadcastToAllExcept(typingData, ws.userId);
        } else {
            // Send typing status to specific user
            const receiverWs = this.clients.get(parseInt(receiver_id));
            if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
                receiverWs.send(JSON.stringify(typingData));
            }
        }
    }

    // Handle disconnection
    handleDisconnection(ws) {
        if (ws.userId) {
            this.clients.delete(ws.userId);
            console.log(`❌ User ${ws.username} (ID: ${ws.userId}) disconnected from chat`);
            
            // Broadcast user offline status
            this.broadcastUserStatus(ws.userId, ws.username, 'offline');
        }
    }

    // Broadcast user online/offline status
    broadcastUserStatus(userId, username, status) {
        const statusData = {
            type: 'user_status',
            data: {
                user_id: userId,
                username: username,
                status: status
            }
        };

        this.broadcastToAllExcept(statusData, userId);
    }

    // Broadcast to all connected clients
    broadcastToAll(data) {
        this.clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            }
        });
    }

    // Broadcast to all except specified user
    broadcastToAllExcept(data, excludeUserId) {
        this.clients.forEach((ws, userId) => {
            if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            }
        });
    }

    // Send message to specific user
    sendToUser(userId, data) {
        const ws = this.clients.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
            return true;
        }
        return false;
    }

    // Get online users
    getOnlineUsers() {
        const onlineUsers = [];
        this.clients.forEach((ws, userId) => {
            if (ws.readyState === WebSocket.OPEN) {
                onlineUsers.push({
                    id: userId,
                    username: ws.username
                });
            }
        });
        return onlineUsers;
    }

    // Send current online users to newly connected user
    sendCurrentOnlineUsers(ws, excludeUserId) {
        const onlineUsers = [];
        this.clients.forEach((clientWs, userId) => {
            // Don't include the newly connected user in the list
            if (userId !== excludeUserId && clientWs.readyState === WebSocket.OPEN) {
                onlineUsers.push({
                    id: userId,
                    username: clientWs.username
                });
            }
        });

        // Send the list of currently online users
        ws.send(JSON.stringify({
            type: 'online_users_list',
            data: onlineUsers
        }));
    }

    // Send notification to specific user
    sendNotificationToUser(userId, notificationData) {
        const ws = this.clients.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'new_notification',
                data: notificationData
            }));
            console.log(`🔔 Notification sent to user ${userId} via chat WebSocket`);
            return true;
        }
        console.log(`📬 User ${userId} offline, notification saved to database`);
        return false;
    }

    // Handle trade request (real-time trade invitation)
    handleTradeRequest(ws, messageData) {
        const { receiver_id, trade_session_id } = messageData;
        
        console.log(`🤝 Trade request from ${ws.username} (${ws.userId}) to user ${receiver_id}`);
        
        const receiverWs = this.clients.get(parseInt(receiver_id));
        
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
                type: 'trade_request',
                data: {
                    sender_id: ws.userId,
                    sender_username: ws.username,
                    trade_session_id
                }
            }));
            
            // Confirm to sender
            ws.send(JSON.stringify({
                type: 'trade_request_sent',
                data: { trade_session_id, receiver_online: true }
            }));
            
            console.log(`✅ Trade request sent to user ${receiver_id} (online)`);
        } else {
            ws.send(JSON.stringify({
                type: 'trade_request_sent',
                data: { trade_session_id, receiver_online: false }
            }));
            console.log(`📬 User ${receiver_id} offline, trade will be async`);
        }
    }

    // Handle trade update (when users modify their offered items in real-time)
    handleTradeUpdate(ws, messageData) {
        const { receiver_id, trade_session_id, offered_items } = messageData;
        
        console.log(`🔄 Trade update from ${ws.username} in session ${trade_session_id}`);
        
        const receiverWs = this.clients.get(parseInt(receiver_id));
        
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
                type: 'trade_update',
                data: {
                    sender_id: ws.userId,
                    trade_session_id,
                    offered_items
                }
            }));
        }
    }

    // Handle trade accept (both users ready to complete)
    handleTradeAccept(ws, messageData) {
        const { receiver_id, trade_session_id } = messageData;
        
        console.log(`✅ Trade accept from ${ws.username} in session ${trade_session_id}`);
        
        const receiverWs = this.clients.get(parseInt(receiver_id));
        
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
                type: 'trade_accepted',
                data: {
                    sender_id: ws.userId,
                    trade_session_id
                }
            }));
        }
    }

    // Handle trade cancel
    handleTradeCancel(ws, messageData) {
        const { receiver_id, trade_session_id } = messageData;
        
        console.log(`❌ Trade cancelled by ${ws.username} in session ${trade_session_id}`);
        
        const receiverWs = this.clients.get(parseInt(receiver_id));
        
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
                type: 'trade_cancelled',
                data: {
                    sender_id: ws.userId,
                    trade_session_id
                }
            }));
        }
    }

    // Heartbeat to keep connections alive
    startHeartbeat() {
        setInterval(() => {
            this.clients.forEach((ws, userId) => {
                if (ws.isAlive === false) {
                    console.log(`💔 Terminating dead connection for user ${userId}`);
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

module.exports = new ChatService();
