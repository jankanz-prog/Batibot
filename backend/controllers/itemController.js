// controllers/itemController.js - Enhanced with categories and new features
const Item = require('../models/itemModel');
const ItemRarity = require('../models/itemRarityModel');
const ItemCategory = require('../models/itemCategoryModel');

const createItem = async (req, res) => {
    try {
        const { name, description, category_id, rarity_id, image_url, is_tradeable, metadata_uri } = req.body;

        if (!name || !category_id || !rarity_id) {
            return res.status(400).json({
                success: false,
                message: 'Name, category_id, and rarity_id are required'
            });
        }

        // Verify category exists
        const category = await ItemCategory.findByPk(category_id);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category_id'
            });
        }

        // Verify rarity exists
        const rarity = await ItemRarity.findByPk(rarity_id);
        if (!rarity) {
            return res.status(400).json({
                success: false,
                message: 'Invalid rarity_id'
            });
        }

        const item = await Item.create({
            name,
            description,
            category_id,
            rarity_id,
            image_url,
            is_tradeable: is_tradeable !== undefined ? is_tradeable : true,
            metadata_uri
        });

        // Fetch the created item with relationships
        const itemWithRelations = await Item.findByPk(item.item_id, {
            include: [
                {
                    model: ItemRarity,
                    as: 'rarity',
                    attributes: ['rarity_id', 'name', 'color', 'weight']
                },
                {
                    model: ItemCategory,
                    as: 'category',
                    attributes: ['category_id', 'name', 'icon']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            data: itemWithRelations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const getAllItems = async (req, res) => {
    try {
        const items = await Item.findAll({
            include: [
                {
                    model: ItemRarity,
                    as: 'rarity',
                    attributes: ['rarity_id', 'name', 'color', 'weight']
                },
                {
                    model: ItemCategory,
                    as: 'category',
                    attributes: ['category_id', 'name', 'icon']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            message: 'Items retrieved successfully',
            data: items
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const getItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await Item.findByPk(id, {
            include: [
                {
                    model: ItemRarity,
                    as: 'rarity',
                    attributes: ['rarity_id', 'name', 'color', 'weight']
                },
                {
                    model: ItemCategory,
                    as: 'category',
                    attributes: ['category_id', 'name', 'icon']
                }
            ]
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Item retrieved successfully',
            data: item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, rarity_id, metadata_uri } = req.body;

        const item = await Item.findByPk(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // If rarity_id is being updated, verify it exists
        if (rarity_id && rarity_id !== item.rarity_id) {
            const rarity = await ItemRarity.findByPk(rarity_id);
            if (!rarity) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid rarity_id'
                });
            }
        }

        await item.update({
            name: name || item.name,
            rarity_id: rarity_id || item.rarity_id,
            metadata_uri: metadata_uri !== undefined ? metadata_uri : item.metadata_uri
        });

        // Fetch the updated item with rarity
        const updatedItem = await Item.findByPk(id, {
            include: [{
                model: ItemRarity,
                as: 'rarity',
                attributes: ['rarity_id', 'name']
            }]
        });

        res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            data: updatedItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await Item.findByPk(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        await item.destroy();

        res.status(200).json({
            success: true,
            message: 'Item deleted successfully'
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
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
};
