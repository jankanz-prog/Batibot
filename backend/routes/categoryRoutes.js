// routes/categoryRoutes.js
const express = require('express');
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/itemCategoryController');
const { authenticateToken, requireAdmin } = require('../controllers/authController');

const router = express.Router();

// Public routes (no auth needed)
router.get('/', getAllCategories);      // GET /api/categories

// Admin-only routes (require authentication + admin role)
router.post('/', authenticateToken, requireAdmin, createCategory);        // POST /api/categories
router.put('/:id', authenticateToken, requireAdmin, updateCategory);      // PUT /api/categories/:id
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);   // DELETE /api/categories/:id

module.exports = router;
