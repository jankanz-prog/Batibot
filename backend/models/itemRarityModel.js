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
    }
}, {
    tableName: 'item_rarities',
    timestamps: false
});

module.exports = ItemRarity;
