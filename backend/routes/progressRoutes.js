// routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticateToken } = require('../controllers/authController');

// Get user progress (badges, achievements, ranks)
router.get('/progress', authenticateToken, progressController.getUserProgress);

// Award badge to user (admin or system)
router.post('/badge/award', authenticateToken, progressController.awardBadge);

// Update achievement progress
router.post('/achievement/update', authenticateToken, progressController.updateAchievementProgress);

// Add XP to user
router.post('/xp/add', authenticateToken, progressController.addXP);

module.exports = router;
