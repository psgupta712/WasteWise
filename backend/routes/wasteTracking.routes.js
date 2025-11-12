const express = require('express');
const router = express.Router();
const wasteTrackingController = require('../controllers/wasteTrackingController');
const auth = require('../middleware/auth.middleware'); // Your auth middleware

// Public route - anyone can track with tracking ID
router.get('/track/:trackingId', wasteTrackingController.getTrackingById);

// Industry routes - require authentication
router.post('/create', auth.verifyToken, auth.isIndustry, wasteTrackingController.createTracking);
router.get('/my-trackings', auth.verifyToken, auth.isIndustry, wasteTrackingController.getMyTrackings);
router.get('/stats', auth.verifyToken, auth.isIndustry, wasteTrackingController.getTrackingStats);

// Admin/Collector routes - require admin/collector role
router.put('/update-status/:trackingId', auth.verifyToken, auth.isAdminOrCollector, wasteTrackingController.updateStatus);
router.get('/all', auth.verifyToken, auth.isAdmin, wasteTrackingController.getAllTrackings);
router.delete('/:trackingId', auth.verifyToken, auth.isAdmin, wasteTrackingController.deleteTracking);

module.exports = router;

// NOTE: You'll need to add these middleware checks in your auth.middleware.js:
// 
// exports.isIndustry = (req, res, next) => {
//   if (req.user.role !== 'industry') {
//     return res.status(403).json({ message: 'Access denied. Industry role required.' });
//   }
//   next();
// };
//
// exports.isAdmin = (req, res, next) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ message: 'Access denied. Admin role required.' });
//   }
//   next();
// };
//
// exports.isAdminOrCollector = (req, res, next) => {
//   if (req.user.role !== 'admin' && req.user.role !== 'collector') {
//     return res.status(403).json({ message: 'Access denied.' });
//   }
//   next();
// };