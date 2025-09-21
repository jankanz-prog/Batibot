// controllers/itemRarityController.js
const ItemRarity = require('../models/itemRarityModel');

const createRarity = async (req, res) => {
    try {
        const { name } = req.body;

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

        const rarity = await ItemRarity.create({
            name: name.toLowerCase()
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

module.exports = {
    createRarity,
    getAllRarities
};
