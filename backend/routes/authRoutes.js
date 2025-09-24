// routes/authRoutes.js
const express = require('express');
const {login, register, createAdmin, changePassword, authenticateToken, requireAdmin, verifyToken, updateProfile} = require('../controllers/authController');
const { getProfile } = require("../controllers/profileController");
const { uploadProfilePicture, deleteProfilePicture } = require('../controllers/profileUploadController');
const upload = require('../middleware/upload');
const { getInventory, addItemToInventory, removeItemFromInventory } = require("../controllers/inventoryController");
const { generateItemsManually } = require('../controllers/itemGenerationController');
const { createNote, getAllNotes, getNoteById, updateNote, deleteNote, toggleFavorite} = require('../controllers/notesController');
const {createItem, getAllItems, getItemById, updateItem, deleteItem} = require('../controllers/itemController');
const { createRarity, getAllRarities} = require('../controllers/itemRarityController');


const router = express.Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.post('/create-admin', createAdmin);
router.put('/change-password', authenticateToken, changePassword);
router.get('/verify-token', authenticateToken, verifyToken);

//Profile routes
router.put('/profile', authenticateToken, updateProfile);
router.get('/profile', authenticateToken, getProfile);

// Profile picture upload routes
router.post('/profile-picture', authenticateToken, upload.single('profilePicture'), uploadProfilePicture);
router.delete('/profile-picture', authenticateToken, deleteProfilePicture);

//Inventory routes
router.get('/inventory', authenticateToken, getInventory);
router.post('/inventory', authenticateToken, addItemToInventory);
router.delete('/inventory', authenticateToken, removeItemFromInventory);

// Notes routes
router.post('/notes', authenticateToken, createNote);
router.get('/notes', authenticateToken, getAllNotes);
router.get('/notes/:id', authenticateToken, getNoteById);
router.put('/notes/:id', authenticateToken, updateNote);
router.delete('/notes/:id', authenticateToken, deleteNote);
router.patch('/notes/:id/toggle-favorite', authenticateToken, toggleFavorite);

// Item routes (admin only for create/update/delete)
router.post('/items', authenticateToken, requireAdmin, createItem);
router.get('/items', authenticateToken, getAllItems);
router.get('/items/:id', authenticateToken, getItemById);
router.put('/items/:id', authenticateToken, requireAdmin, updateItem);
router.delete('/items/:id', authenticateToken, requireAdmin, deleteItem);

// Rarity routes (admin only for create)
router.post('/rarities', authenticateToken, requireAdmin, createRarity);
router.get('/rarities', getAllRarities); // No auth needed to view rarities

// Item generation route (admin only)
router.post('/generate-items', authenticateToken, requireAdmin, generateItemsManually);


module.exports = router;