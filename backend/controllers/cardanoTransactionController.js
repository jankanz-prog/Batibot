const CardanoTransaction = require('../models/cardanoTransactionModel');
const User = require('../models/userModel');
const { Op } = require('sequelize');

// Record a new transaction
const recordTransaction = async (req, res) => {
    try {
        const {
            tx_hash,
            sender_wallet_address,
            receiver_wallet_address,
            amount,
            fee,
            status,
            block_number,
            metadata,
        } = req.body;

        // Find sender and receiver user IDs if they exist in the system
        const senderUser = await User.findOne({ where: { wallet_address: sender_wallet_address } });
        const receiverUser = await User.findOne({ where: { wallet_address: receiver_wallet_address } });

        const transaction = await CardanoTransaction.create({
            tx_hash,
            sender_wallet_address,
            sender_user_id: senderUser ? senderUser.id : null,
            receiver_wallet_address,
            receiver_user_id: receiverUser ? receiverUser.id : null,
            amount,
            fee,
            status: status || 'pending',
            block_number,
            metadata: metadata ? JSON.stringify(metadata) : null,
        });

        res.status(201).json({
            success: true,
            message: 'Transaction recorded successfully',
            transaction,
        });
    } catch (error) {
        console.error('Error recording transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record transaction',
            error: error.message,
        });
    }
};

// Get transaction history for a wallet address
const getTransactionHistory = async (req, res) => {
    try {
        const { wallet_address } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Find all transactions where user is sender or receiver
        const { count, rows: transactions } = await CardanoTransaction.findAndCountAll({
            where: {
                [Op.or]: [
                    { sender_wallet_address: wallet_address },
                    { receiver_wallet_address: wallet_address },
                ],
            },
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit),
            offset: offset,
        });

        // Fetch user details for each transaction
        const transactionsWithUsers = await Promise.all(
            transactions.map(async (tx) => {
                const senderUser = tx.sender_user_id
                    ? await User.findByPk(tx.sender_user_id, {
                          attributes: ['id', 'username', 'wallet_address'],
                      })
                    : null;

                const receiverUser = tx.receiver_user_id
                    ? await User.findByPk(tx.receiver_user_id, {
                          attributes: ['id', 'username', 'wallet_address'],
                      })
                    : null;

                return {
                    ...tx.toJSON(),
                    sender_user: senderUser ? {
                        id: senderUser.id,
                        username: senderUser.username,
                    } : null,
                    receiver_user: receiverUser ? {
                        id: receiverUser.id,
                        username: receiverUser.username,
                    } : null,
                };
            })
        );

        res.status(200).json({
            success: true,
            transactions: transactionsWithUsers,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction history',
            error: error.message,
        });
    }
};

// Get transaction by hash
const getTransactionByHash = async (req, res) => {
    try {
        const { tx_hash } = req.params;

        const transaction = await CardanoTransaction.findOne({
            where: { tx_hash },
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found',
            });
        }

        // Fetch user details
        const senderUser = transaction.sender_user_id
            ? await User.findByPk(transaction.sender_user_id, {
                  attributes: ['id', 'username', 'wallet_address'],
              })
            : null;

        const receiverUser = transaction.receiver_user_id
            ? await User.findByPk(transaction.receiver_user_id, {
                  attributes: ['id', 'username', 'wallet_address'],
              })
            : null;

        res.status(200).json({
            success: true,
            transaction: {
                ...transaction.toJSON(),
                sender_user: senderUser ? {
                    id: senderUser.id,
                    username: senderUser.username,
                } : null,
                receiver_user: receiverUser ? {
                    id: receiverUser.id,
                    username: receiverUser.username,
                } : null,
            },
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction',
            error: error.message,
        });
    }
};

// Update transaction status (e.g., from pending to confirmed)
const updateTransactionStatus = async (req, res) => {
    try {
        const { tx_hash } = req.params;
        const { status, block_number } = req.body;

        const transaction = await CardanoTransaction.findOne({
            where: { tx_hash },
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found',
            });
        }

        await transaction.update({
            status,
            block_number: block_number || transaction.block_number,
        });

        res.status(200).json({
            success: true,
            message: 'Transaction status updated',
            transaction,
        });
    } catch (error) {
        console.error('Error updating transaction status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update transaction status',
            error: error.message,
        });
    }
};

// Get transaction statistics for a wallet
const getWalletStats = async (req, res) => {
    try {
        const { wallet_address } = req.params;

        // Count sent and received transactions
        const sentCount = await CardanoTransaction.count({
            where: { sender_wallet_address: wallet_address },
        });

        const receivedCount = await CardanoTransaction.count({
            where: { receiver_wallet_address: wallet_address },
        });

        // Sum of sent and received amounts
        const sentTransactions = await CardanoTransaction.findAll({
            where: { sender_wallet_address: wallet_address, status: 'confirmed' },
            attributes: ['amount', 'fee'],
        });

        const receivedTransactions = await CardanoTransaction.findAll({
            where: { receiver_wallet_address: wallet_address, status: 'confirmed' },
            attributes: ['amount'],
        });

        const totalSent = sentTransactions.reduce(
            (sum, tx) => sum + parseFloat(tx.amount) + parseFloat(tx.fee || 0),
            0
        );

        const totalReceived = receivedTransactions.reduce(
            (sum, tx) => sum + parseFloat(tx.amount),
            0
        );

        res.status(200).json({
            success: true,
            stats: {
                sent_count: sentCount,
                received_count: receivedCount,
                total_sent: totalSent.toFixed(6),
                total_received: totalReceived.toFixed(6),
            },
        });
    } catch (error) {
        console.error('Error fetching wallet stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wallet statistics',
            error: error.message,
        });
    }
};

module.exports = {
    recordTransaction,
    getTransactionHistory,
    getTransactionByHash,
    updateTransactionStatus,
    getWalletStats,
};
