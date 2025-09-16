// routes/authRoutes.js
const express = require('express');
const { login, register, changePassword, authenticateToken } = require('../controllers/authController');
const { updateProfile } = require("../controllers/profileController");

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.put('/change-password', authenticateToken, changePassword);
router.put('/profile', authenticateToken, updateProfile);


module.exports = router;