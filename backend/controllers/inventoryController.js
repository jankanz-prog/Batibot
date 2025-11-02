// controllers/inventoryController.js
const Inventory = require('../models/inventoryModel');
const Item = require('../models/itemModel');

const MAX_ITEMS = 30;

const getInventory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { include_deleted } = req.query;
        
        const whereClause = { user_id: userId };
        
        // By default, only show non-deleted items
        if (include_deleted !== 'true') {
            whereClause.is_deleted = false;
        }
        
        const items = await Inventory.findAll({
            where: whereClause,
            include: [{ model: Item }]
        });
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const addItemToInventory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { item_id, quantity } = req.body;

        // Validate quantity
        if (quantity !== undefined && quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0'
            });
        }

        // Only count non-deleted items for the 30-item limit
        const itemCount = await Inventory.count({ where: { user_id: userId, is_deleted: false } });
        if (itemCount >= MAX_ITEMS) {
            return res.status(400).json({
                success: false,
                message: `Inventory limit of ${MAX_ITEMS} items reached`
            });
        }

        const existing = await Inventory.findOne({ where: { user_id: userId, item_id } });
        if (existing) {
            await existing.update({ quantity: existing.quantity + (quantity || 1) });
            
            // Auto-award item collection achievements
            const progressService = require('../services/progressService');
            progressService.onItemCollect(userId).catch(err => 
                console.error('Error awarding item achievements:', err)
            );
            
            return res.status(200).json({ success: true, message: 'Item quantity updated', item: existing });
        }

        const newItem = await Inventory.create({
            user_id: userId,
            item_id,
            quantity: quantity || 1
        });

        // Auto-award item collection achievements
        const progressService = require('../services/progressService');
        progressService.onItemCollect(userId).catch(err => 
            console.error('Error awarding item achievements:', err)
        );
        
        // Check if it's a rare item for rare item achievements
        const Item = require('../models/itemModel');
        const item = await Item.findByPk(item_id, {
            include: [{ model: require('../models/itemRarityModel'), as: 'Rarity' }]
        });
        if (item && item.Rarity) {
            progressService.onRareItemDrop(userId, item.Rarity.name).catch(err => 
                console.error('Error awarding rare item achievements:', err)
            );
        }

        res.status(201).json({ success: true, message: 'Item added to inventory', item: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const removeItemFromInventory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { item_id, quantity } = req.body;

        // Validate quantity
        if (quantity && quantity <= 0) {
            return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
        }

        const inventoryItem = await Inventory.findOne({ where: { user_id: userId, item_id } });
        if (!inventoryItem) {
            return res.status(404).json({ success: false, message: 'Item not found in inventory' });
        }

        // Prevent removing more than owned
        if (quantity && quantity > inventoryItem.quantity) {
            return res.status(400).json({ success: false, message: 'Not enough items in inventory' });
        }

        if (quantity && quantity < inventoryItem.quantity) {
            await inventoryItem.update({ quantity: inventoryItem.quantity - quantity });
            return res.status(200).json({
                success: true,
                message: 'Item quantity reduced',
                item: inventoryItem
            });
        } else {
            await inventoryItem.destroy();
            return res.status(200).json({
                success: true,
                message: 'Item completely removed',
                item: null
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// Soft delete item (mark as deleted)
const softDeleteItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { item_id } = req.body;

        const inventoryItem = await Inventory.findOne({ 
            where: { user_id: userId, item_id, is_deleted: false } 
        });
        
        if (!inventoryItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not found in active inventory' 
            });
        }

        await inventoryItem.update({ is_deleted: true });
        
        res.status(200).json({ 
            success: true, 
            message: 'Item moved to deleted items', 
            item: inventoryItem 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Restore deleted item
const restoreItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { item_id } = req.body;

        // Check if user has space in active inventory
        const activeItemCount = await Inventory.count({ 
            where: { user_id: userId, is_deleted: false } 
        });
        
        if (activeItemCount >= MAX_ITEMS) {
            return res.status(400).json({
                success: false,
                message: `Cannot restore item. Inventory limit of ${MAX_ITEMS} items reached`
            });
        }

        const inventoryItem = await Inventory.findOne({ 
            where: { user_id: userId, item_id, is_deleted: true } 
        });
        
        if (!inventoryItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not found in deleted items' 
            });
        }

        await inventoryItem.update({ is_deleted: false });
        
        res.status(200).json({ 
            success: true, 
            message: 'Item restored to active inventory', 
            item: inventoryItem 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Get deleted items
const getDeletedItems = async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await Inventory.findAll({
            where: { user_id: userId, is_deleted: true },
            include: [{ model: Item }]
        });
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Permanently delete item (completely remove from database)
const permanentlyDeleteItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { item_id } = req.body;

        const inventoryItem = await Inventory.findOne({ 
            where: { user_id: userId, item_id, is_deleted: true } 
        });
        
        if (!inventoryItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not found in deleted items' 
            });
        }

        // Permanently delete from database
        await inventoryItem.destroy();
        
        console.log(`🗑️ Permanently deleted item ${item_id} from user ${userId}'s inventory`);
        
        res.status(200).json({ 
            success: true, 
            message: 'Item permanently deleted from database'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};

module.exports = { 
    getInventory, 
    addItemToInventory, 
    removeItemFromInventory, 
    softDeleteItem, 
    restoreItem, 
    getDeletedItems,
    permanentlyDeleteItem
};
