// models/rankModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rank = sequelize.define('Rank', {
    rank_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    symbol: {
        type: DataTypes.STRING,
        allowNull: true // Emoji icon
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true // Rank order/hierarchy
    },
    xp_required: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    trades_required: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    items_required: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    legendary_items_required: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'ranks',
    timestamps: true
});

module.exports = Rank;
