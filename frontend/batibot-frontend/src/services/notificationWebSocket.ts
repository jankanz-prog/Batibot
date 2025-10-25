// services/notificationWebSocket.ts - Global notification WebSocket service
import type { Notification } from '../types/notification';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

type EventCallback = (data: any) => void;

class NotificationWebSocketService {
    private ws: WebSocket | null = null;
    private token: string = '';
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private eventListeners: Map<string, EventCallback[]> = new Map();
    private isConnecting = false;

    // Connect to notification WebSocket
    async connect(token: string): Promise<void> {
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('✅ Already connected to notification service');
            return;
        }
        
        if (this.isConnecting) {
            console.log('⏳ Already connecting to notification service');
            return;
        }

        this.isConnecting = true;
        this.token = token;

        return new Promise((resolve, reject) => {
            try {
                const wsUrl = `${WS_URL}/notifications?token=${encodeURIComponent(token)}`;
                console.log('🔔 Connecting to notification service:', wsUrl);

                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = () => {
                    console.log('✅ Connected to notification service');
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    this.startHeartbeat();
                    this.emit('connected', true);
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('📨 Notification message received:', data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('❌ Error parsing notification message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('❌ Notification WebSocket error:', error);
                    this.isConnecting = false;
                    this.emit('error', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('❌ Disconnected from notification service');
                    this.emit('connected', false);
                    this.stopHeartbeat();
                    this.attemptReconnect();
                };

            } catch (error) {
                console.error('❌ Failed to create notification WebSocket connection:', error);
                reject(error);
            }
        });
    }

    // Handle incoming messages
    private handleMessage(data: any): void {
        switch (data.type) {
            case 'notification_connection_success':
                console.log('🔔 Notification service connection confirmed');
                this.emit('connectionSuccess', data);
                break;

            case 'new_notification':
                console.log('🔔 New notification received:', data.data);
                this.emit('newNotification', data.data as Notification);
                break;

            case 'user_online_status':
                console.log('👤 User status update:', data.data);
                this.emit('userStatus', data.data);
                break;

            case 'heartbeat_response':
                // Heartbeat acknowledged
                break;

            default:
                console.log('❓ Unknown notification message type:', data.type);
        }
    }

    // Disconnect
    disconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        this.stopHeartbeat();
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }

        console.log('🔌 Disconnected from notification service');
    }

    // Attempt reconnection
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached for notification service');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        console.log(`🔄 Attempting to reconnect to notification service in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        this.reconnectTimeout = setTimeout(() => {
            if (this.token) {
                this.connect(this.token).catch(console.error);
            }
        }, delay);
    }

    // Start heartbeat
    private startHeartbeat(): void {
        this.stopHeartbeat();

        this.heartbeatInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'heartbeat' }));
            }
        }, 30000); // Every 30 seconds
    }

    // Stop heartbeat
    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // Event emitter - emit event
    private emit(event: string, data: any): void {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(callback => callback(data));
    }

    // Event emitter - on event
    on(event: string, callback: EventCallback): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)?.push(callback);
    }

    // Event emitter - off event
    off(event: string, callback?: EventCallback): void {
        if (!callback) {
            this.eventListeners.delete(event);
            return;
        }

        const listeners = this.eventListeners.get(event) || [];
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    // Check if connected
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

export const notificationWebSocket = new NotificationWebSocketService();
