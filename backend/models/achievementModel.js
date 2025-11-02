// models/achievementModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Achievement = sequelize.define('Achievement', {
    achievement_id: {
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
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM('trading', 'collection', 'engagement', 'misc'),
        allowNull: false,
        defaultValue: 'trading'
    },
    tier: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1 // 1 = Tier I, 2 = Tier II, 3 = Tier III
    },
    requirement_type: {
        type: DataTypes.STRING,
        allowNull: false // e.g., 'complete_trades', 'collect_items', 'login_days'
    },
    requirement_value: {
        type: DataTypes.INTEGER,
        allowNull: false // e.g., 10 for "complete 10 trades"
    },
    xp_reward: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'achievements',
    timestamps: true
});

module.exports = Achievement;
