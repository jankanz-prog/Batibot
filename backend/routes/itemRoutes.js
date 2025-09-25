// routes/itemRoutes.js
const express = require('express');
const { createItem, getAllItems, getItemById, updateItem, deleteItem } = require('../controllers/itemController');
const { authenticateToken, requireAdmin } = require('../controllers/authController');

const router = express.Router();

// Public routes (no auth needed)
router.get('/', getAllItems);           // GET /api/items
router.get('/:id', getItemById);        // GET /api/items/:id

// Admin-only routes (require authentication + admin role)
router.post('/', authenticateToken, requireAdmin, createItem);        // POST /api/items
router.put('/:id', authenticateToken, requireAdmin, updateItem);      // PUT /api/items/:id
router.delete('/:id', authenticateToken, requireAdmin, deleteItem);   // DELETE /api/items/:id

module.exports = router;
