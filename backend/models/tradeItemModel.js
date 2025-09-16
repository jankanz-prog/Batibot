// models/tradeItemModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TradeItem = sequelize.define('TradeItem', {
    trade_item_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    trade_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'trades',
            key: 'trade_id'
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
    offered_by: {
        type: DataTypes.ENUM('Sender', 'Receiver'),
        allowNull: false
    }
}, {
    tableName: 'trade_items',
    timestamps: false
});

module.exports = TradeItem;
