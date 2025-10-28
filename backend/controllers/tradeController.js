// controllers/tradeController.js - Trading system controller
const Trade = require('../models/tradeModel');
const TradeItem = require('../models/tradeItemModel');
const Item = require('../models/itemModel');
const Inventory = require('../models/inventoryModel');
const User = require('../models/userModel');
const ItemRarity = require('../models/itemRarityModel');
const ItemCategory = require('../models/itemCategoryModel');
const { createNotification } = require('./notificationController');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get marketplace items (items from other users' inventories)
const getMarketplaceItems = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all items from other users' inventories
        const marketplaceItems = await Inventory.findAll({
            where: {
                user_id: { [Op.ne]: userId }, // Not the current user
                is_deleted: false,
                quantity: { [Op.gt]: 0 }
            },
            include: [
                {
                    model: Item,
                    include: [
                        { model: ItemRarity, as: 'rarity' },
                        { model: ItemCategory, as: 'category' }
                    ]
                },
                {
                    model: User,
                    attributes: ['id', 'username']
                }
            ],
            order: [['acquired_at', 'DESC']]
        });

        // Format response
        const formattedItems = marketplaceItems.map(inv => ({
            inventory_id: inv.inventory_id,
            item_id: inv.Item.item_id,
            name: inv.Item.name,
            description: inv.Item.description,
            rarity: inv.Item.rarity.name,
            category: inv.Item.category.name,
            value: inv.Item.value,
            quantity: inv.quantity,
            seller_id: inv.User.id,
            seller: inv.User.username,
            image: inv.Item.image_url
        }));

        res.json({
            success: true,
            data: formattedItems
        });
    } catch (error) {
        console.error('❌ Error fetching marketplace items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch marketplace items',
            error: error.message
        });
    }
};

// Get user's trade offers (sent and received)
const getUserTradeOffers = async (req, res) => {
    try {
        const userId = req.user.id;

        const trades = await Trade.findAll({
            where: {
                [Op.or]: [
                    { sender_id: userId },
                    { receiver_id: userId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'Sender',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'Receiver',
                    attributes: ['id', 'username']
                },
                {
                    model: TradeItem,
                    as: 'Items',
                    include: [
                        {
                            model: Item,
                            as: 'Item',
                            include: [
                                { model: ItemRarity, as: 'rarity' },
                                { model: ItemCategory, as: 'category' }
                            ]
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Format response
        const formattedTrades = trades.map(trade => ({
            trade_id: trade.trade_id,
            sender_id: trade.sender_id,
            sender: trade.Sender.username,
            receiver_id: trade.receiver_id,
            receiver: trade.Receiver.username,
            status: trade.status,
            created_at: trade.created_at,
            type: trade.sender_id === userId ? 'sent' : 'received',
            sender_items: trade.Items.filter(ti => ti.offered_by === 'Sender').map(ti => ({
                item_id: ti.Item.item_id,
                name: ti.Item.name,
                rarity: ti.Item.rarity.name,
                category: ti.Item.category.name,
                value: ti.Item.value,
                quantity: ti.quantity
            })),
            receiver_items: trade.Items.filter(ti => ti.offered_by === 'Receiver').map(ti => ({
                item_id: ti.Item.item_id,
                name: ti.Item.name,
                rarity: ti.Item.rarity.name,
                category: ti.Item.category.name,
                value: ti.Item.value,
                quantity: ti.quantity
            }))
        }));

        res.json({
            success: true,
            data: formattedTrades
        });
    } catch (error) {
        console.error('❌ Error fetching trade offers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trade offers',
            error: error.message
        });
    }
};

// Create new trade offer
const createTradeOffer = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const senderId = req.user.id;
        const { receiver_id, sender_items, receiver_items } = req.body;

        // Validation
        if (!receiver_id || !sender_items || !receiver_items) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: receiver_id, sender_items, receiver_items'
            });
        }

        if (senderId === receiver_id) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot trade with yourself'
            });
        }

        // Verify sender owns the offered items
        for (const item of sender_items) {
            const inventory = await Inventory.findOne({
                where: {
                    user_id: senderId,
                    item_id: item.item_id,
                    is_deleted: false
                }
            });

            if (!inventory || inventory.quantity < item.quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `You don't have enough ${item.name || 'items'}`
                });
            }
        }

        // Verify receiver owns the requested items
        for (const item of receiver_items) {
            const inventory = await Inventory.findOne({
                where: {
                    user_id: receiver_id,
                    item_id: item.item_id,
                    is_deleted: false
                }
            });

            if (!inventory || inventory.quantity < item.quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `The other user doesn't have enough ${item.name || 'items'}`
                });
            }
        }

        // Create trade
        const trade = await Trade.create({
            sender_id: senderId,
            receiver_id: receiver_id,
            status: 'Pending'
        }, { transaction });

        // Create trade items for sender's offered items
        for (const item of sender_items) {
            await TradeItem.create({
                trade_id: trade.trade_id,
                item_id: item.item_id,
                quantity: item.quantity,
                offered_by: 'Sender'
            }, { transaction });
        }

        // Create trade items for receiver's items (what sender wants)
        for (const item of receiver_items) {
            await TradeItem.create({
                trade_id: trade.trade_id,
                item_id: item.item_id,
                quantity: item.quantity,
                offered_by: 'Receiver'
            }, { transaction });
        }

        await transaction.commit();

        // Get sender info for notification
        const sender = await User.findByPk(senderId);

        // Create notification for receiver
        try {
            await createNotification({
                user_id: receiver_id,
                type: 'Trade',
                title: '🤝 New Trade Offer!',
                message: `${sender.username} wants to trade with you`,
                related_id: trade.trade_id
            });
        } catch (notifError) {
            console.error('Failed to create trade notification:', notifError);
        }

        console.log(`✅ Trade offer created: ${trade.trade_id} from user ${senderId} to user ${receiver_id}`);

        res.json({
            success: true,
            message: 'Trade offer created successfully',
            trade_id: trade.trade_id
        });
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error creating trade offer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create trade offer',
            error: error.message
        });
    }
};

// Accept trade offer
const acceptTradeOffer = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const userId = req.user.id;
        const { trade_id } = req.params;

        // Get trade with items
        const trade = await Trade.findOne({
            where: { trade_id },
            include: [
                {
                    model: TradeItem,
                    as: 'Items',
                    include: [{ model: Item, as: 'Item' }]
                },
                { model: User, as: 'Sender', attributes: ['id', 'username'] },
                { model: User, as: 'Receiver', attributes: ['id', 'username'] }
            ]
        });

        if (!trade) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Trade not found'
            });
        }

        // Verify user is the receiver
        if (trade.receiver_id !== userId) {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'Only the receiver can accept the trade'
            });
        }

        // Verify trade is still pending
        if (trade.status !== 'Pending') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Trade is ${trade.status.toLowerCase()}, cannot accept`
            });
        }

        // Verify both users still own the items
        const senderItems = trade.Items.filter(ti => ti.offered_by === 'Sender');
        const receiverItems = trade.Items.filter(ti => ti.offered_by === 'Receiver');

        for (const tradeItem of senderItems) {
            const inventory = await Inventory.findOne({
                where: {
                    user_id: trade.sender_id,
                    item_id: tradeItem.item_id,
                    is_deleted: false
                }
            });

            if (!inventory || inventory.quantity < tradeItem.quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Sender no longer has enough ${tradeItem.Item.name}`
                });
            }
        }

        for (const tradeItem of receiverItems) {
            const inventory = await Inventory.findOne({
                where: {
                    user_id: trade.receiver_id,
                    item_id: tradeItem.item_id,
                    is_deleted: false
                }
            });

            if (!inventory || inventory.quantity < tradeItem.quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `You no longer have enough ${tradeItem.Item.name}`
                });
            }
        }

        // Transfer items
        // 1. Remove sender's items and add to receiver
        for (const tradeItem of senderItems) {
            // Get sender's inventory
            const senderInventory = await Inventory.findOne({
                where: {
                    user_id: trade.sender_id,
                    item_id: tradeItem.item_id,
                    is_deleted: false
                },
                transaction
            });

            if (senderInventory) {
                const newQuantity = senderInventory.quantity - tradeItem.quantity;
                
                if (newQuantity <= 0) {
                    // Delete inventory row if quantity reaches 0
                    await senderInventory.destroy({ transaction });
                    console.log(`🗑️ Removed item ${tradeItem.item_id} from sender's inventory (quantity reached 0)`);
                } else {
                    // Otherwise just decrement
                    await senderInventory.update({ quantity: newQuantity }, { transaction });
                }
            }

            // Add to receiver
            const receiverInv = await Inventory.findOne({
                where: {
                    user_id: trade.receiver_id,
                    item_id: tradeItem.item_id,
                    is_deleted: false
                },
                transaction
            });

            if (receiverInv) {
                await receiverInv.increment('quantity', { by: tradeItem.quantity, transaction });
            } else {
                await Inventory.create({
                    user_id: trade.receiver_id,
                    item_id: tradeItem.item_id,
                    quantity: tradeItem.quantity,
                    is_deleted: false
                }, { transaction });
            }
        }

        // 2. Remove receiver's items and add to sender
        for (const tradeItem of receiverItems) {
            // Get receiver's inventory
            const receiverInventory = await Inventory.findOne({
                where: {
                    user_id: trade.receiver_id,
                    item_id: tradeItem.item_id,
                    is_deleted: false
                },
                transaction
            });

            if (receiverInventory) {
                const newQuantity = receiverInventory.quantity - tradeItem.quantity;
                
                if (newQuantity <= 0) {
                    // Delete inventory row if quantity reaches 0
                    await receiverInventory.destroy({ transaction });
                    console.log(`🗑️ Removed item ${tradeItem.item_id} from receiver's inventory (quantity reached 0)`);
                } else {
                    // Otherwise just decrement
                    await receiverInventory.update({ quantity: newQuantity }, { transaction });
                }
            }

            // Add to sender
            const senderInv = await Inventory.findOne({
                where: {
                    user_id: trade.sender_id,
                    item_id: tradeItem.item_id,
                    is_deleted: false
                },
                transaction
            });

            if (senderInv) {
                await senderInv.increment('quantity', { by: tradeItem.quantity, transaction });
            } else {
                await Inventory.create({
                    user_id: trade.sender_id,
                    item_id: tradeItem.item_id,
                    quantity: tradeItem.quantity,
                    is_deleted: false
                }, { transaction });
            }
        }

        // Update trade status
        await trade.update({ status: 'Completed' }, { transaction });

        await transaction.commit();

        // Create notification for sender
        try {
            await createNotification({
                user_id: trade.sender_id,
                type: 'Trade',
                title: '✅ Trade Completed!',
                message: `${trade.Receiver.username} accepted your trade offer`,
                related_id: trade.trade_id
            });
        } catch (notifError) {
            console.error('Failed to create trade notification:', notifError);
        }

        console.log(`✅ Trade ${trade_id} completed successfully`);

        res.json({
            success: true,
            message: 'Trade completed successfully'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error accepting trade:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept trade',
            error: error.message
        });
    }
};

// Reject trade offer
const rejectTradeOffer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { trade_id } = req.params;

        const trade = await Trade.findOne({
            where: { trade_id },
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'username'] },
                { model: User, as: 'Receiver', attributes: ['id', 'username'] }
            ]
        });

        if (!trade) {
            return res.status(404).json({
                success: false,
                message: 'Trade not found'
            });
        }

        // Verify user is the receiver
        if (trade.receiver_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the receiver can reject the trade'
            });
        }

        // Verify trade is still pending
        if (trade.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: `Trade is ${trade.status.toLowerCase()}, cannot reject`
            });
        }

        // Update trade status
        await trade.update({ status: 'Rejected' });

        // Create notification for sender
        try {
            await createNotification({
                user_id: trade.sender_id,
                type: 'Trade',
                title: '❌ Trade Declined',
                message: `${trade.Receiver.username} declined your trade offer`,
                related_id: trade.trade_id
            });
        } catch (notifError) {
            console.error('Failed to create trade notification:', notifError);
        }

        console.log(`❌ Trade ${trade_id} rejected by user ${userId}`);

        res.json({
            success: true,
            message: 'Trade rejected successfully'
        });
    } catch (error) {
        console.error('❌ Error rejecting trade:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject trade',
            error: error.message
        });
    }
};

// Cancel trade offer (sender only)
const cancelTradeOffer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { trade_id } = req.params;

        const trade = await Trade.findOne({
            where: { trade_id },
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'username'] },
                { model: User, as: 'Receiver', attributes: ['id', 'username'] }
            ]
        });

        if (!trade) {
            return res.status(404).json({
                success: false,
                message: 'Trade not found'
            });
        }

        // Verify user is the sender
        if (trade.sender_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the sender can cancel the trade'
            });
        }

        // Verify trade is still pending
        if (trade.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: `Trade is ${trade.status.toLowerCase()}, cannot cancel`
            });
        }

        // Delete trade and associated items (cascade delete should handle trade_items)
        await TradeItem.destroy({ where: { trade_id } });
        await trade.destroy();

        console.log(`🗑️ Trade ${trade_id} cancelled by sender ${userId}`);

        res.json({
            success: true,
            message: 'Trade cancelled successfully'
        });
    } catch (error) {
        console.error('❌ Error cancelling trade:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel trade',
            error: error.message
        });
    }
};

module.exports = {
    getMarketplaceItems,
    getUserTradeOffers,
    createTradeOffer,
    acceptTradeOffer,
    rejectTradeOffer,
    cancelTradeOffer
};
