// models/itemCategoryModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ItemCategory = sequelize.define('ItemCategory', {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isIn: [['weapon', 'armor', 'accessory', 'consumable', 'material', 'tool', 'misc']]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Icon class or image URL'
    }
}, {
    tableName: 'item_categories',
    timestamps: false
});

module.exports = ItemCategory;
