const express = require('express');
const router = express.Router();
const {
  submitWasteDeclaration,
  getMyDeclarations,
  trackWaste,
  getIndustryStats,
  generateCertificate,
  deleteDeclaration
} = require('../controllers/industryWasteController');
const { protect } = require('../middleware/auth.middleware');

// Protected routes (require login)
router.post('/waste/declare', protect, submitWasteDeclaration);
router.get('/waste/declarations', protect, getMyDeclarations);
router.get('/waste/stats', protect, getIndustryStats);
router.get('/waste/certificate/:declarationId', protect, generateCertificate);
router.delete('/waste/:id', protect, deleteDeclaration);

// Public route (anyone can track)
router.get('/waste/track/:trackingId', trackWaste);

module.exports = router;