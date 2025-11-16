const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CardanoTransaction = sequelize.define('CardanoTransaction', {
    transaction_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    tx_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Cardano transaction hash',
    },
    sender_wallet_address: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Sender Cardano wallet address',
    },
    sender_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID if sender is registered in system',
        references: {
            model: 'users',
            key: 'id',
        },
    },
    receiver_wallet_address: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Receiver Cardano wallet address',
    },
    receiver_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID if receiver is registered in system',
        references: {
            model: 'users',
            key: 'id',
        },
    },
    amount: {
        type: DataTypes.DECIMAL(20, 6),
        allowNull: false,
        comment: 'Amount in ADA',
    },
    fee: {
        type: DataTypes.DECIMAL(20, 6),
        allowNull: true,
        comment: 'Transaction fee in ADA',
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
        defaultValue: 'pending',
        allowNull: false,
    },
    block_number: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'Block number where transaction was confirmed',
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional transaction metadata (JSON)',
    },
}, {
    tableName: 'cardano_transactions',
    timestamps: true,
    underscored: true,
});

module.exports = CardanoTransaction;
