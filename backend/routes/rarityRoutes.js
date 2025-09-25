// routes/rarityRoutes.js
const express = require('express');
const { createRarity, getAllRarities, updateRarity, deleteRarity } = require('../controllers/itemRarityController');
const { authenticateToken, requireAdmin } = require('../controllers/authController');

const router = express.Router();

// Public routes (no auth needed)
router.get('/', getAllRarities);        // GET /api/rarities

// Admin-only routes (require authentication + admin role)
router.post('/', authenticateToken, requireAdmin, createRarity);        // POST /api/rarities
router.put('/:id', authenticateToken, requireAdmin, updateRarity);      // PUT /api/rarities/:id
router.delete('/:id', authenticateToken, requireAdmin, deleteRarity);   // DELETE /api/rarities/:id

module.exports = router;
