// models/userAchievementModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAchievement = sequelize.define('UserAchievement', {
    user_achievement_id: {
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
    achievement_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'achievements',
            key: 'achievement_id'
        }
    },
    progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    completed_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'user_achievements',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'achievement_id']
        }
    ]
});

module.exports = UserAchievement;
