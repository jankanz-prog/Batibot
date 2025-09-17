// routes/authRoutes.js
const express = require('express');
const { login, register, changePassword, authenticateToken } = require('../controllers/authController');
const { updateProfile,getProfile } = require("../controllers/profileController");

const router = express.Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.put('/change-password', authenticateToken, changePassword);

//Profile routes
router.put('/profile', authenticateToken, updateProfile);
router.get('/profile', authenticateToken, getProfile);


module.exports = router;