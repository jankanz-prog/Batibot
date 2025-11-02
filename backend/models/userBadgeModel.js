// models/userBadgeModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserBadge = sequelize.define('UserBadge', {
    user_badge_id: {
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
    badge_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'badges',
            key: 'badge_id'
        }
    },
    earned_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'user_badges',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'badge_id']
        }
    ]
});

module.exports = UserBadge;
