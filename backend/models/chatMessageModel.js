// models/chatMessageModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
    message_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for global chat
        references: {
            model: 'users',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true, // Allow null if only attachment is sent
        validate: {
            // Custom validation: either content OR attachment must be present
            contentOrAttachment() {
                if (!this.content && !this.attachment_url) {
                    throw new Error('Either content or attachment must be provided');
                }
            }
        }
    },
    // Attachment fields
    attachment_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL/path to the attached file'
    },
    attachment_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Type of attachment: image, pdf, doc, excel, video, audio, other'
    },
    attachment_filename: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Original filename of the attachment'
    },
    // Message type for better organization
    message_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'text',
        comment: 'Type of message: text, attachment, or mixed'
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'chat_messages',
    timestamps: false
});

module.exports = ChatMessage;
