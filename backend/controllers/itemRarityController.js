// controllers/itemRarityController.js
const ItemRarity = require('../models/itemRarityModel');

const createRarity = async (req, res) => {
    try {
        const { name, color, weight, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Rarity name is required'
            });
        }

        const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        if (!validRarities.includes(name.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid rarity name. Must be one of: common, uncommon, rare, epic, legendary'
            });
        }

        // Default colors for rarities
        const defaultColors = {
            'common': '#9E9E9E',
            'uncommon': '#4CAF50', 
            'rare': '#2196F3',
            'epic': '#9C27B0',
            'legendary': '#FF9800'
        };

        // Default weights for rarities
        const defaultWeights = {
            'common': 60,
            'uncommon': 20,
            'rare': 15,
            'epic': 4,
            'legendary': 1
        };

        const rarity = await ItemRarity.create({
            name: name.toLowerCase(),
            color: color || defaultColors[name.toLowerCase()],
            weight: weight || defaultWeights[name.toLowerCase()],
            description
        });

        res.status(201).json({
            success: true,
            message: 'Rarity created successfully',
            data: rarity
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Rarity already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const getAllRarities = async (req, res) => {
    try {
        const rarities = await ItemRarity.findAll({
            order: [['rarity_id', 'ASC']]
        });

        res.status(200).json({
            success: true,
            message: 'Rarities retrieved successfully',
            data: rarities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const updateRarity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color, weight, description } = req.body;

        const rarity = await ItemRarity.findByPk(id);
        if (!rarity) {
            return res.status(404).json({
                success: false,
                message: 'Rarity not found'
            });
        }

        // Validate name if provided
        if (name) {
            const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
            if (!validRarities.includes(name.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid rarity name. Must be one of: common, uncommon, rare, epic, legendary'
                });
            }
        }

        await rarity.update({
            name: name ? name.toLowerCase() : rarity.name,
            color: color !== undefined ? color : rarity.color,
            weight: weight !== undefined ? weight : rarity.weight,
            description: description !== undefined ? description : rarity.description
        });

        res.status(200).json({
            success: true,
            message: 'Rarity updated successfully',
            data: rarity
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Rarity name already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const deleteRarity = async (req, res) => {
    try {
        const { id } = req.params;

        const rarity = await ItemRarity.findByPk(id);
        if (!rarity) {
            return res.status(404).json({
                success: false,
                message: 'Rarity not found'
            });
        }

        await rarity.destroy();

        res.status(200).json({
            success: true,
            message: 'Rarity deleted successfully'
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
    createRarity,
    getAllRarities,
    updateRarity,
    deleteRarity
};
