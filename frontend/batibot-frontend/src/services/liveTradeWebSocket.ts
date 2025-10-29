// services/liveTradeWebSocket.ts

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export interface TradeItem {
    item_id: number;
    name: string;
    image_url?: string;
    quantity: number;
}

export interface LiveTrade {
    id: string;
    partner: {
        id: number;
        username: string;
    };
    yourItems: TradeItem[];
    partnerItems: TradeItem[];
    yourConfirmed: boolean;
    partnerConfirmed: boolean;
}

export interface TradeInvite {
    tradeId: string;
    from: {
        id: number;
        username: string;
    };
}

type MessageHandler = (data: any) => void;

class LiveTradeWebSocket {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private messageHandlers: Map<string, MessageHandler[]> = new Map();
    private isManualClose = false;

    connect(token: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('Already connected to live trade service');
            return;
        }

        this.isManualClose = false;
        const wsUrl = `${WS_URL}/live-trade?token=${token}`;

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('✅ Connected to live trade service');
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📨 Live trade message:', data.type);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('❌ Live trade WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('👋 Disconnected from live trade service');
                this.ws = null;

                if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
                    console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
                    setTimeout(() => this.connect(token), delay);
                }
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
    }

    disconnect() {
        this.isManualClose = true;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.messageHandlers.clear();
    }

    private handleMessage(data: any) {
        const handlers = this.messageHandlers.get(data.type);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }

    on(type: string, handler: MessageHandler) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }
        this.messageHandlers.get(type)!.push(handler);
    }

    off(type: string, handler: MessageHandler) {
        const handlers = this.messageHandlers.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // Send trade invite
    sendTradeInvite(targetUserId: number, targetUsername: string) {
        this.send({
            type: 'trade_invite',
            targetUserId,
            targetUsername
        });
    }

    // Accept trade invite
    acceptTrade(tradeId: string) {
        this.send({
            type: 'trade_accept',
            tradeId
        });
    }

    // Decline trade invite
    declineTrade(tradeId: string) {
        this.send({
            type: 'trade_decline',
            tradeId
        });
    }

    // Add item to trade
    addItem(tradeId: string, itemId: number, quantity: number) {
        this.send({
            type: 'add_item',
            tradeId,
            itemId,
            quantity
        });
    }

    // Remove item from trade
    removeItem(tradeId: string, itemId: number) {
        this.send({
            type: 'remove_item',
            tradeId,
            itemId
        });
    }

    // Confirm trade
    confirmTrade(tradeId: string) {
        this.send({
            type: 'confirm_trade',
            tradeId
        });
    }

    // Cancel trade
    cancelTrade(tradeId: string) {
        this.send({
            type: 'cancel_trade',
            tradeId
        });
    }

    private send(data: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

export const liveTradeWS = new LiveTradeWebSocket();
