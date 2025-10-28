// routes/tradeRoutes.js - Trading system routes
const express = require('express');
const {
    getMarketplaceItems,
    getUserTradeOffers,
    createTradeOffer,
    acceptTradeOffer,
    rejectTradeOffer,
    cancelTradeOffer
} = require('../controllers/tradeController');
const { authenticateToken } = require('../controllers/authController');

const router = express.Router();

// All routes require authentication
router.get('/marketplace', authenticateToken, getMarketplaceItems);
router.get('/offers', authenticateToken, getUserTradeOffers);
router.post('/', authenticateToken, createTradeOffer);
router.patch('/:trade_id/accept', authenticateToken, acceptTradeOffer);
router.patch('/:trade_id/reject', authenticateToken, rejectTradeOffer);
router.delete('/:trade_id', authenticateToken, cancelTradeOffer);

module.exports = router;
