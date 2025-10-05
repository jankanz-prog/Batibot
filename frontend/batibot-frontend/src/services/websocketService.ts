// services/websocketService.ts - WebSocket service for real-time chat
import type { WebSocketMessage, WebSocketResponse } from '../types/chat';

class WebSocketService {
    private ws: WebSocket | null = null;
    private token: string = '';
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private listeners: { [key: string]: ((data: any) => void)[] } = {};
    private heartbeatInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.listeners = {};
    }

    // Connect to WebSocket
    connect(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.token = token;
            // Use environment variable or fallback to localhost
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
            const wsBaseUrl = baseUrl.replace('http://', 'ws://').replace('/api', '');
            const wsUrl = `${wsBaseUrl}/chat?token=${token}`;
            
            console.log('🔌 Connecting to WebSocket:', wsUrl);
            
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('✅ WebSocket connected');
                this.reconnectAttempts = 0;
                this.startHeartbeat();
                this.emit('connected', true);
                resolve();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data: WebSocketResponse = JSON.parse(event.data);
                    console.log('📨 WebSocket message received:', data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log('❌ WebSocket closed:', event.code, event.reason);
                this.emit('connected', false);
                this.stopHeartbeat();
                
                if (event.code !== 1000) { // Not a normal close
                    this.attemptReconnect();
                }
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.emit('error', error);
                reject(error);
            };
        });
    }

    // Handle incoming WebSocket messages
    private handleMessage(data: WebSocketResponse) {
        switch (data.type) {
            case 'connection_success':
                this.emit('connectionSuccess', data);
                break;
            case 'new_message':
                this.emit('newMessage', data.data);
                break;
            case 'message_sent':
                this.emit('messageSent', data.data);
                break;
            case 'user_typing_start':
                this.emit('userTypingStart', data.data);
                break;
            case 'user_typing_stop':
                this.emit('userTypingStop', data.data);
                break;
            case 'user_status':
                this.emit('userStatus', data.data);
                break;
            case 'online_users_list':
                this.emit('onlineUsersList', data.data);
                break;
            case 'error':
                this.emit('error', data);
                break;
            case 'heartbeat_response':
                // Handle heartbeat response
                break;
            default:
                console.log('❓ Unknown WebSocket message type:', data.type);
        }
    }

    // Send message
    sendMessage(message: WebSocketMessage) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('📤 Sending WebSocket message:', message);
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('❌ WebSocket not connected, cannot send message');
            throw new Error('WebSocket not connected');
        }
    }

    // Start typing indicator
    startTyping(receiver_id: 'global' | number) {
        this.sendMessage({
            type: 'typing_start',
            receiver_id,
        });
    }

    // Stop typing indicator
    stopTyping(receiver_id: 'global' | number) {
        this.sendMessage({
            type: 'typing_stop',
            receiver_id,
        });
    }

    // Send chat message
    sendChatMessage(
        receiver_id: 'global' | number,
        content?: string,
        attachment?: {
            url: string;
            type: string;
            filename: string;
        }
    ) {
        this.sendMessage({
            type: 'send_message',
            receiver_id,
            content,
            attachment_url: attachment?.url,
            attachment_type: attachment?.type,
            attachment_filename: attachment?.filename,
        });
    }

    // Event listener methods
    on(event: string, callback: (data: any) => void) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event: string, callback: (data: any) => void) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    private emit(event: string, data: any) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // Heartbeat to keep connection alive
    private startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.sendMessage({ type: 'heartbeat' });
            }
        }, 30000); // Every 30 seconds
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // Reconnection logic
    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect(this.token).catch(() => {
                    console.log('❌ Reconnection failed');
                });
            }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
        } else {
            console.log('❌ Max reconnection attempts reached');
            this.emit('maxReconnectAttemptsReached', null);
        }
    }

    // Disconnect
    disconnect() {
        console.log('🔌 Disconnecting WebSocket');
        this.stopHeartbeat();
        
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        
        this.listeners = {};
        this.reconnectAttempts = 0;
    }

    // Get connection status
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

// Export singleton instance
export const websocketService = new WebSocketService();
