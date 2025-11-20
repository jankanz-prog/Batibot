// noteModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Note = sequelize.define('Note', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    favorited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    color: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium'
    },
    pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        validate: {
            maxTags(value) {
                if (value && Array.isArray(value) && value.length > 10) {
                    throw new Error('Maximum 10 tags allowed per note');
                }
            }
        }
    },
    attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    drawings: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    reminder: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'notes',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Note;
