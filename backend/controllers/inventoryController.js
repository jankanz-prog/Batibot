// controllers/inventoryController.js
const Inventory = require('../models/inventoryModel');
const Item = require('../models/itemModel');

const MAX_ITEMS = 30;

const getInventory = async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await Inventory.findAll({
            where: { user_id: userId },
            include: [{ model: Item }]
        });
        res.status(200).json({ success: true, items });
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

        const itemCount = await Inventory.count({ where: { user_id: userId } });
        if (itemCount >= MAX_ITEMS) {
            return res.status(400).json({
                success: false,
                message: `Inventory limit of ${MAX_ITEMS} items reached`
            });
        }

        const existing = await Inventory.findOne({ where: { user_id: userId, item_id } });
        if (existing) {
            await existing.update({ quantity: existing.quantity + (quantity || 1) });
            return res.status(200).json({ success: true, message: 'Item quantity updated', item: existing });
        }

        const newItem = await Inventory.create({
            user_id: userId,
            item_id,
            quantity: quantity || 1
        });

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


module.exports = { getInventory, addItemToInventory, removeItemFromInventory  };
