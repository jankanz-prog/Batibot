const express = require('express');
const router = express.Router();
const {
    recordTransaction,
    getTransactionHistory,
    getTransactionByHash,
    updateTransactionStatus,
    getWalletStats,
} = require('../controllers/cardanoTransactionController');
const { authenticateToken } = require('../controllers/authController');

// Record a new transaction
router.post('/', authenticateToken, recordTransaction);

// Get transaction history for a wallet
router.get('/history/:wallet_address', authenticateToken, getTransactionHistory);

// Get transaction by hash
router.get('/:tx_hash', authenticateToken, getTransactionByHash);

// Update transaction status
router.patch('/:tx_hash/status', authenticateToken, updateTransactionStatus);

// Get wallet statistics
router.get('/stats/:wallet_address', authenticateToken, getWalletStats);

module.exports = router;
