// services/liveTradeService.js - Live Trading WebSocket Service
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Item = require('../models/itemModel');
const Inventory = require('../models/inventoryModel');
const Trade = require('../models/tradeModel');
const TradeItem = require('../models/tradeItemModel');
const { createNotification } = require('../controllers/notificationController');
const sequelize = require('../config/database');

class LiveTradeService {
    constructor() {
        this.wss = null;
        this.clients = new Map(); // userId -> WebSocket
        this.activeTrades = new Map(); // tradeId -> trade session data
        this.notificationService = null;
    }

    // Initialize WebSocket server
    initialize(server) {
        this.wss = new WebSocket.Server({ 
            noServer: true
        });

        this.wss.on('connection', this.handleConnection.bind(this));
        console.log('🤝 WebSocket live trade service initialized on /live-trade');
    }

    // Set notification service reference
    setNotificationService(notificationService) {
        this.notificationService = notificationService;
    }

    // Handle new WebSocket connection
    async handleConnection(ws, req) {
        console.log('🔌 New live trade WebSocket connection attempt');

        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const token = url.searchParams.get('token');

            if (!token) {
                ws.close(1008, 'Authentication required');
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findByPk(decoded.userId);

            if (!user) {
                ws.close(1008, 'Invalid user');
                return;
            }

            ws.userId = user.id;
            ws.username = user.username;
            ws.isAlive = true;

            this.clients.set(user.id, ws);
            console.log(`✅ User ${user.username} connected to live trade service`);

            ws.send(JSON.stringify({
                type: 'connection_success',
                message: 'Connected to live trade service'
            }));

            ws.on('message', (data) => this.handleMessage(ws, data));
            ws.on('close', () => this.handleDisconnect(ws));
            ws.on('pong', () => { ws.isAlive = true; });

        } catch (error) {
            console.error('❌ Live trade connection error:', error);
            ws.close(1011, 'Server error');
        }
    }

    // Handle incoming messages
    async handleMessage(ws, data) {
        try {
            const message = JSON.parse(data);
            console.log(`📨 Live trade message from ${ws.username}:`, message.type);

            switch (message.type) {
                case 'trade_invite':
                    await this.handleTradeInvite(ws, message);
                    break;
                case 'trade_accept':
                    await this.handleTradeAccept(ws, message);
                    break;
                case 'trade_decline':
                    await this.handleTradeDecline(ws, message);
                    break;
                case 'add_item':
                    await this.handleAddItem(ws, message);
                    break;
                case 'remove_item':
                    await this.handleRemoveItem(ws, message);
                    break;
                case 'confirm_trade':
                    await this.handleConfirmTrade(ws, message);
                    break;
                case 'cancel_trade':
                    await this.handleCancelTrade(ws, message);
                    break;
                default:
                    ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
            }
        } catch (error) {
            console.error('❌ Error handling message:', error);
            ws.send(JSON.stringify({ type: 'error', message: error.message }));
        }
    }

    // Handle trade invitation
    async handleTradeInvite(ws, message) {
        const { targetUserId, targetUsername, listingItemId } = message;
        const tradeId = `${ws.userId}-${targetUserId}-${Date.now()}`;

        console.log(`📋 Trade invite with listingItemId: ${listingItemId}`);

        // Check if target user is online
        const targetWs = this.clients.get(targetUserId);
        if (!targetWs) {
            ws.send(JSON.stringify({
                type: 'trade_invite_failed',
                message: 'User is not online'
            }));
            return;
        }

        // Create trade session with listing item info
        const tradeSession = {
            id: tradeId,
            initiator: { id: ws.userId, username: ws.username },
            target: { id: targetUserId, username: targetUsername },
            initiatorItems: [],
            targetItems: [],
            initiatorConfirmed: false,
            targetConfirmed: false,
            status: 'pending',
            listingItemId: listingItemId, // Store the marketplace listing item
            createdAt: Date.now()
        };

        this.activeTrades.set(tradeId, tradeSession);

        // Send invite to target user with listing item info
        targetWs.send(JSON.stringify({
            type: 'trade_invite_received',
            tradeId,
            from: {
                id: ws.userId,
                username: ws.username
            },
            listingItemId: listingItemId // Forward the listing item ID
        }));

        // Notify initiator
        ws.send(JSON.stringify({
            type: 'trade_invite_sent',
            tradeId,
            to: {
                id: targetUserId,
                username: targetUsername
            }
        }));

        // Create notification in database
        if (this.notificationService) {
            await createNotification({
                user_id: targetUserId,
                type: 'Trade',
                title: 'Live Trade Request',
                message: `${ws.username} wants to start a live trade with you`,
                related_id: tradeId
            });
        }

        console.log(`🤝 Trade invite sent: ${ws.username} → ${targetUsername}`);
    }

    // Handle trade acceptance
    async handleTradeAccept(ws, message) {
        const { tradeId } = message;
        const trade = this.activeTrades.get(tradeId);

        if (!trade) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Trade session not found'
            }));
            return;
        }

        if (trade.target.id !== ws.userId) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'You are not the target of this trade'
            }));
            return;
        }

        trade.status = 'active';

        // Notify both users
        const initiatorWs = this.clients.get(trade.initiator.id);
        const targetWs = this.clients.get(trade.target.id);

        // Send to initiator (the one who sent the invite)
        if (initiatorWs) {
            initiatorWs.send(JSON.stringify({
                type: 'trade_started',
                tradeId,
                trade: {
                    id: tradeId,
                    partner: trade.target,
                    yourItems: [],
                    partnerItems: [],
                    yourConfirmed: false,
                    partnerConfirmed: false,
                    listingItemId: trade.listingItemId, // Include listing item
                    isInitiator: true // They are the initiator
                }
            }));
        }

        // Send to target (the one who accepted - usually the seller)
        if (targetWs) {
            targetWs.send(JSON.stringify({
                type: 'trade_started',
                tradeId,
                trade: {
                    id: tradeId,
                    partner: trade.initiator,
                    yourItems: [],
                    partnerItems: [],
                    yourConfirmed: false,
                    partnerConfirmed: false,
                    listingItemId: trade.listingItemId, // Include listing item
                    isInitiator: false // They are NOT the initiator (they're the seller)
                }
            }));
        }

        console.log(`✅ Trade accepted: ${tradeId}`);
    }

    // Handle trade decline
    async handleTradeDecline(ws, message) {
        const { tradeId } = message;
        const trade = this.activeTrades.get(tradeId);

        if (!trade) return;

        const initiatorWs = this.clients.get(trade.initiator.id);
        if (initiatorWs) {
            initiatorWs.send(JSON.stringify({
                type: 'trade_declined',
                message: `${trade.target.username} declined the trade`
            }));
        }

        this.activeTrades.delete(tradeId);
        console.log(`❌ Trade declined: ${tradeId}`);
    }

    // Handle adding item to trade
    async handleAddItem(ws, message) {
        const { tradeId, itemId, quantity } = message;
        const trade = this.activeTrades.get(tradeId);

        if (!trade || trade.status !== 'active') {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Trade session not active'
            }));
            return;
        }

        // Verify user owns the item
        const inventory = await Inventory.findOne({
            where: {
                user_id: ws.userId,
                item_id: itemId,
                is_deleted: false
            },
            include: [{
                model: Item,
                as: 'Item',
                attributes: ['item_id', 'name', 'image_url', 'rarity_id', 'category_id', 'is_tradeable']
            }]
        });

        if (!inventory) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Item not found in inventory'
            }));
            return;
        }

        if (inventory.quantity < quantity) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Insufficient quantity'
            }));
            return;
        }

        if (!inventory.Item.is_tradeable) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Item is not tradeable'
            }));
            return;
        }

        // Add item to appropriate side
        const itemData = {
            item_id: itemId,
            name: inventory.Item.name,
            image_url: inventory.Item.image_url,
            quantity: quantity
        };

        if (ws.userId === trade.initiator.id) {
            trade.initiatorItems.push(itemData);
        } else {
            trade.targetItems.push(itemData);
        }

        // Reset confirmations when items change
        trade.initiatorConfirmed = false;
        trade.targetConfirmed = false;

        // Broadcast update to both users
        this.broadcastTradeUpdate(trade);
    }

    // Handle removing item from trade
    async handleRemoveItem(ws, message) {
        const { tradeId, itemId } = message;
        const trade = this.activeTrades.get(tradeId);

        if (!trade || trade.status !== 'active') return;

        // Remove item from appropriate side
        if (ws.userId === trade.initiator.id) {
            trade.initiatorItems = trade.initiatorItems.filter(item => item.item_id !== itemId);
        } else {
            trade.targetItems = trade.targetItems.filter(item => item.item_id !== itemId);
        }

        // Reset confirmations
        trade.initiatorConfirmed = false;
        trade.targetConfirmed = false;

        this.broadcastTradeUpdate(trade);
    }

    // Handle trade confirmation
    async handleConfirmTrade(ws, message) {
        const { tradeId } = message;
        const trade = this.activeTrades.get(tradeId);

        if (!trade || trade.status !== 'active') return;

        // Set confirmation
        if (ws.userId === trade.initiator.id) {
            trade.initiatorConfirmed = true;
        } else {
            trade.targetConfirmed = true;
        }

        // If both confirmed, execute trade
        if (trade.initiatorConfirmed && trade.targetConfirmed) {
            await this.executeTrade(trade);
        } else {
            this.broadcastTradeUpdate(trade);
        }
    }

    // Execute the trade (transfer items)
    async executeTrade(trade) {
        try {
            let tradeRecord;
            await sequelize.transaction(async (transaction) => {
                // Transfer initiator's items to target
                for (const item of trade.initiatorItems) {
                    await this.transferItem(
                        trade.initiator.id,
                        trade.target.id,
                        item.item_id,
                        item.quantity,
                        transaction
                    );
                }

                // Transfer target's items to initiator
                for (const item of trade.targetItems) {
                    await this.transferItem(
                        trade.target.id,
                        trade.initiator.id,
                        item.item_id,
                        item.quantity,
                        transaction
                    );
                }

                // Create trade record in database
                tradeRecord = await Trade.create({
                    sender_id: trade.initiator.id,
                    receiver_id: trade.target.id,
                    status: 'Completed',
                    is_live_trade: true
                }, { transaction });

                // Create trade items records for initiator's items (sender)
                for (const item of trade.initiatorItems) {
                    await TradeItem.create({
                        trade_id: tradeRecord.trade_id,
                        item_id: item.item_id,
                        quantity: item.quantity,
                        offered_by: 'Sender'
                    }, { transaction });
                }

                // Create trade items records for target's items (receiver)
                for (const item of trade.targetItems) {
                    await TradeItem.create({
                        trade_id: tradeRecord.trade_id,
                        item_id: item.item_id,
                        quantity: item.quantity,
                        offered_by: 'Receiver'
                    }, { transaction });
                }
            });

            // Notify both users of success
            const initiatorWs = this.clients.get(trade.initiator.id);
            const targetWs = this.clients.get(trade.target.id);

            const successMessage = {
                type: 'trade_completed',
                message: 'Trade completed successfully!'
            };

            if (initiatorWs) initiatorWs.send(JSON.stringify(successMessage));
            if (targetWs) targetWs.send(JSON.stringify(successMessage));

            this.activeTrades.delete(trade.id);
            console.log(`✅ Trade completed: ${trade.id}`);

            // Auto-award trade achievements (async, don't wait)
            const progressService = require('./progressService');
            progressService.onTradeComplete(trade.initiator.id).catch(err => 
                console.error('Error awarding trade achievements to initiator:', err)
            );
            progressService.onTradeComplete(trade.target.id).catch(err => 
                console.error('Error awarding trade achievements to target:', err)
            );

        } catch (error) {
            console.error('❌ Trade execution error:', error);
            
            const errorMessage = {
                type: 'trade_failed',
                message: error.message
            };

            const initiatorWs = this.clients.get(trade.initiator.id);
            const targetWs = this.clients.get(trade.target.id);

            if (initiatorWs) initiatorWs.send(JSON.stringify(errorMessage));
            if (targetWs) targetWs.send(JSON.stringify(errorMessage));
        }
    }

    // Transfer item between users
    async transferItem(fromUserId, toUserId, itemId, quantity, transaction) {
        // Remove from sender
        const senderInv = await Inventory.findOne({
            where: { user_id: fromUserId, item_id: itemId, is_deleted: false },
            transaction
        });

        if (senderInv) {
            const newQuantity = senderInv.quantity - quantity;
            if (newQuantity <= 0) {
                await senderInv.destroy({ transaction });
            } else {
                await senderInv.update({ quantity: newQuantity }, { transaction });
            }
        }

        // Add to receiver
        const receiverInv = await Inventory.findOne({
            where: { user_id: toUserId, item_id: itemId, is_deleted: false },
            transaction
        });

        if (receiverInv) {
            await receiverInv.update({ 
                quantity: receiverInv.quantity + quantity 
            }, { transaction });
        } else {
            await Inventory.create({
                user_id: toUserId,
                item_id: itemId,
                quantity: quantity
            }, { transaction });
        }
    }

    // Broadcast trade update to both users
    broadcastTradeUpdate(trade) {
        const initiatorWs = this.clients.get(trade.initiator.id);
        const targetWs = this.clients.get(trade.target.id);

        if (initiatorWs) {
            initiatorWs.send(JSON.stringify({
                type: 'trade_update',
                trade: {
                    yourItems: trade.initiatorItems,
                    partnerItems: trade.targetItems,
                    yourConfirmed: trade.initiatorConfirmed,
                    partnerConfirmed: trade.targetConfirmed
                }
            }));
        }

        if (targetWs) {
            targetWs.send(JSON.stringify({
                type: 'trade_update',
                trade: {
                    yourItems: trade.targetItems,
                    partnerItems: trade.initiatorItems,
                    yourConfirmed: trade.targetConfirmed,
                    partnerConfirmed: trade.initiatorConfirmed
                }
            }));
        }
    }

    // Handle trade cancellation
    async handleCancelTrade(ws, message) {
        const { tradeId } = message;
        const trade = this.activeTrades.get(tradeId);

        if (!trade) return;

        const initiatorWs = this.clients.get(trade.initiator.id);
        const targetWs = this.clients.get(trade.target.id);

        const cancelMessage = {
            type: 'trade_cancelled',
            message: `Trade cancelled by ${ws.username}`
        };

        if (initiatorWs) initiatorWs.send(JSON.stringify(cancelMessage));
        if (targetWs) targetWs.send(JSON.stringify(cancelMessage));

        this.activeTrades.delete(tradeId);
        console.log(`❌ Trade cancelled: ${tradeId}`);
    }

    // Handle disconnection
    handleDisconnect(ws) {
        if (ws.userId) {
            // Cancel any active trades involving this user
            for (const [tradeId, trade] of this.activeTrades.entries()) {
                if (trade.initiator.id === ws.userId || trade.target.id === ws.userId) {
                    this.handleCancelTrade(ws, { tradeId });
                }
            }

            this.clients.delete(ws.userId);
            console.log(`👋 User ${ws.username} disconnected from live trade`);
        }
    }

    // Check if user is online
    isUserOnline(userId) {
        return this.clients.has(userId);
    }
}

module.exports = new LiveTradeService();
