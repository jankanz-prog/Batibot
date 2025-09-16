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
        allowNull: true
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
    }
}, {
    tableName: 'profiles',
    timestamps: false
});

module.exports = Profile;
