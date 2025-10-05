// services/chatService.js - WebSocket chat service
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const connectedUsers = new Map(); // userId -> socket.id
const heartbeatInterval = 30000; // 30 seconds

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 */
function initialize(server) {
    io = new Server(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL || 'http://localhost:5173',
                'http://localhost:5174',
                'http://127.0.0.1:58516',
                /^http:\/\/127\.0\.0\.1:\d+$/
            ],
            credentials: true,
            methods: ['GET', 'POST']
        },
        path: '/socket.io/'
    });

    io.on('connection', (socket) => {
        console.log(`🔌 New socket connection: ${socket.id}`);

        // Authenticate user
        socket.on('authenticate', (token) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                socket.userId = decoded.userId;
                socket.username = decoded.username;
                connectedUsers.set(decoded.userId, socket.id);
                
                console.log(`✅ User authenticated: ${decoded.username} (ID: ${decoded.userId})`);
                socket.emit('authenticated', { userId: decoded.userId, username: decoded.username });
                
                // Broadcast user online status
                io.emit('user_status', { userId: decoded.userId, username: decoded.username, online: true });
            } catch (error) {
                console.error('❌ Authentication failed:', error.message);
                socket.emit('auth_error', { message: 'Invalid token' });
                socket.disconnect();
            }
        });

        // Handle chat messages
        socket.on('chat_message', (data) => {
            if (!socket.userId) {
                socket.emit('error', { message: 'Not authenticated' });
                return;
            }

            const messageData = {
                id: Date.now(), // Temporary ID, should be replaced with DB ID
                sender_id: socket.userId,
                sender_username: socket.username,
                receiver_id: data.receiver_id || 'global',
                message: data.message,
                created_at: new Date().toISOString()
            };

            // Broadcast to specific user or global
            if (data.receiver_id && data.receiver_id !== 'global') {
                const receiverSocketId = connectedUsers.get(data.receiver_id);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('new_message', messageData);
                }
                socket.emit('new_message', messageData); // Echo back to sender
            } else {
                // Global message
                io.emit('new_message', messageData);
            }

            console.log(`💬 Message from ${socket.username}: ${data.message}`);
        });

        // Handle typing indicator
        socket.on('typing', (data) => {
            if (!socket.userId) return;

            const typingData = {
                userId: socket.userId,
                username: socket.username,
                receiver_id: data.receiver_id || 'global'
            };

            if (data.receiver_id && data.receiver_id !== 'global') {
                const receiverSocketId = connectedUsers.get(data.receiver_id);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('user_typing', typingData);
                }
            } else {
                socket.broadcast.emit('user_typing', typingData);
            }
        });

        // Handle stop typing
        socket.on('stop_typing', (data) => {
            if (!socket.userId) return;

            const typingData = {
                userId: socket.userId,
                username: socket.username,
                receiver_id: data.receiver_id || 'global'
            };

            if (data.receiver_id && data.receiver_id !== 'global') {
                const receiverSocketId = connectedUsers.get(data.receiver_id);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('user_stop_typing', typingData);
                }
            } else {
                socket.broadcast.emit('user_stop_typing', typingData);
            }
        });

        // Handle heartbeat/ping
        socket.on('ping', () => {
            socket.emit('pong');
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            if (socket.userId) {
                connectedUsers.delete(socket.userId);
                console.log(`🔌 User disconnected: ${socket.username} (ID: ${socket.userId})`);
                
                // Broadcast user offline status
                io.emit('user_status', { userId: socket.userId, username: socket.username, online: false });
            } else {
                console.log(`🔌 Socket disconnected: ${socket.id}`);
            }
        });
    });

    console.log('✅ WebSocket chat service initialized');
}

/**
 * Start heartbeat to keep connections alive
 */
function startHeartbeat() {
    setInterval(() => {
        io.emit('heartbeat', { timestamp: Date.now() });
    }, heartbeatInterval);
    console.log('💓 Heartbeat started');
}

/**
 * Get list of connected users
 */
function getConnectedUsers() {
    return Array.from(connectedUsers.keys());
}

/**
 * Send message to specific user
 */
function sendToUser(userId, event, data) {
    const socketId = connectedUsers.get(userId);
    if (socketId && io) {
        io.to(socketId).emit(event, data);
        return true;
    }
    return false;
}

/**
 * Broadcast to all connected users
 */
function broadcast(event, data) {
    if (io) {
        io.emit(event, data);
    }
}

module.exports = {
    initialize,
    startHeartbeat,
    getConnectedUsers,
    sendToUser,
    broadcast
};
