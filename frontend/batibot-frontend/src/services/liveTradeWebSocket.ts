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
    listingItemId?: number; // The item that was listed in marketplace (for auto-population)
    isInitiator?: boolean; // Whether you initiated the trade
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
    private pendingTradeInfo: Map<string, { listingItemId?: number; isInitiator: boolean }> = new Map();
    public lastSentListingItemId: number | undefined = undefined; // Store last sent listing item globally

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

    // Send trade invite with optional listing item info
    sendTradeInvite(targetUserId: number, targetUsername: string, listingItemId?: number) {
        const tradeKey = `${targetUserId}`; // Use targetUserId as key since we don't have tradeId yet
        
        // Store globally so receiver can access it
        this.lastSentListingItemId = listingItemId;
        console.log('💾 Stored lastSentListingItemId:', this.lastSentListingItemId);
        
        // Store the trade info for later use
        this.pendingTradeInfo.set(tradeKey, {
            listingItemId,
            isInitiator: true // The sender is the initiator
        });
        
        this.send({
            type: 'trade_invite',
            targetUserId,
            targetUsername,
            listingItemId // Include the item that was listed in the marketplace
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

    // Get trade info for a partner user ID
    getTradeInfo(partnerUserId: number): { listingItemId?: number; isInitiator: boolean } | null {
        return this.pendingTradeInfo.get(`${partnerUserId}`) || null;
    }

    // Clear trade info after trade starts
    clearTradeInfo(partnerUserId: number) {
        this.pendingTradeInfo.delete(`${partnerUserId}`);
    }
}

export const liveTradeWS = new LiveTradeWebSocket();
