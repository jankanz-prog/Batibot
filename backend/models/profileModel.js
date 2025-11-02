// models/profileModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profile = sequelize.define('Profile', {
    profile_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    avatar_url: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    profile_picture: {
        type: DataTypes.TEXT, // Store base64 encoded image or URL
        allowNull: true,
        defaultValue: null
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    trust_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
    },
    reputation_points: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    xp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    current_rank_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'ranks',
            key: 'rank_id'
        }
    },
    consecutive_login_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    total_login_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'profiles',
    timestamps: false
});

module.exports = Profile;
