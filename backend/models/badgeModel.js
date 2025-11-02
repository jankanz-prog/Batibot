// models/badgeModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Badge = sequelize.define('Badge', {
    badge_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true // Emoji or image filename
    },
    category: {
        type: DataTypes.ENUM('progress', 'activity', 'item', 'rarity', 'social', 'interaction'),
        allowNull: false,
        defaultValue: 'progress'
    },
    rarity: {
        type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
        allowNull: false,
        defaultValue: 'common'
    },
    requirement_type: {
        type: DataTypes.STRING,
        allowNull: false // e.g., 'first_login', 'collect_items', 'complete_trades'
    },
    requirement_value: {
        type: DataTypes.INTEGER,
        allowNull: true // e.g., 10 for "collect 10 items"
    }
}, {
    tableName: 'badges',
    timestamps: true
});

module.exports = Badge;
