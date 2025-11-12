const express = require('express');
const router = express.Router();
const {
  classifyWaste,
  getWasteHistory,
  getWasteStats,
  searchWaste,
  deleteWasteRecord
} = require('../controllers/wasteController');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/search', searchWaste);

// Protected routes (require login)
router.post('/classify', protect, classifyWaste);
router.get('/history', protect, getWasteHistory);
router.get('/stats', protect, getWasteStats);
router.delete('/:id', protect, deleteWasteRecord);

module.exports = router;