// routes/authRoutes.js
const express = require('express');
const { login, register, changePassword, authenticateToken } = require('../controllers/authController');
const { updateProfile,getProfile } = require("../controllers/profileController");
const { getInventory, addItemToInventory, removeItemFromInventory } = require("../controllers/inventoryController");
const {
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote
} = require('../controllers/notesController');


const router = express.Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.put('/change-password', authenticateToken, changePassword);

//Profile routes
router.put('/profile', authenticateToken, updateProfile);
router.get('/profile', authenticateToken, getProfile);

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



module.exports = router;