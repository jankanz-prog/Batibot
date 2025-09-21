// models/itemModel.js - Updated version
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Item = sequelize.define('Item', {
    item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rarity_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'item_rarities',
            key: 'rarity_id'
        }
    },
    metadata_uri: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'items',
    timestamps: false
});

module.exports = Item;
