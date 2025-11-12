const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth.middleware');

// Public routes (no login required)
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes (login required)
router.get('/profile', protect, getUserProfile);

module.exports = router;