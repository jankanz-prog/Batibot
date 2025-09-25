// models/itemRarityModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ItemRarity = sequelize.define('ItemRarity', {
    rarity_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isIn: [['common', 'uncommon', 'rare', 'epic', 'legendary']]
        }
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '#808080',
        comment: 'Hex color code for rarity display'
    },
    weight: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Drop weight for random generation (higher = more common)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'item_rarities',
    timestamps: false
});

module.exports = ItemRarity;
