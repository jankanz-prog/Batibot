// models/inventoryModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
    inventory_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'items',
            key: 'item_id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    acquired_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Soft delete flag - true means item is in deleted items section'
    }
}, {
    tableName: 'inventories',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'item_id']
        }
    ]
});

module.exports = Inventory;
