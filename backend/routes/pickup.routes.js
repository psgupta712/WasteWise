const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Pickup = require('../models/Pickup');
const User = require('../models/User');

// ✅ Import Notification Helpers
const { 
  notifyPickupScheduled, 
  notifyPickupCompleted, 
  notifyPickupCancelled 
} = require('../utils/notificationHelper');

// @desc    Schedule a new pickup
// @route   POST /api/pickup/schedule
// @access  Private (Citizen only)
router.post('/schedule', protect, async (req, res) => {
  try {
    const {
      wasteType,
      pickupDate,
      timeSlot,
      address,
      estimatedWeight,
      contactPhone,
      specialInstructions
    } = req.body;

    // Validation
    if (!wasteType || !pickupDate || !timeSlot || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if pickup date is in the future
    const selectedDate = new Date(pickupDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Pickup date must be in the future'
      });
    }

    // Create pickup
    const pickup = await Pickup.create({
      user: req.user._id,
      wasteType,
      pickupDate: selectedDate,
      timeSlot,
      address,
      estimatedWeight: estimatedWeight || 0,
      contactPhone: contactPhone || req.user.phone,
      specialInstructions: specialInstructions || ''
    });

    // ✅ Create Notification for scheduling
    try {
      await notifyPickupScheduled(req.user._id, pickup);
    } catch (error) {
      console.error('Notification error:', error);
    }

    // Calculate and award points
    const points = pickup.calculatePoints();
    
    // Update user points (partial reward for scheduling)
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: Math.floor(points / 2) } // Half points on scheduling
    });

    res.status(201).json({
      success: true,
      message: 'Pickup scheduled successfully',
      data: {
        _id: pickup._id,
        wasteType: pickup.wasteType,
        pickupDate: pickup.pickupDate,
        timeSlot: pickup.timeSlot,
        verificationCode: pickup.verificationCode,
        status: pickup.status,
        pointsAwarded: Math.floor(points / 2)
      }
    });

  } catch (error) {
    console.error('Schedule pickup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling pickup',
      error: error.message
    });
  }
});

// @desc    Get all pickups for current user
// @route   GET /api/pickup/my-pickups
// @access  Private (Citizen)
router.get('/my-pickups', protect, async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    const query = { user: req.user._id };

    // Filter by status if provided
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const pickups = await Pickup.find(query)
      .sort({ pickupDate: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('assignedCollector', 'name phone');

    const total = await Pickup.countDocuments(query);

    res.status(200).json({
      success: true,
      count: pickups.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: pickups
    });

  } catch (error) {
    console.error('Get pickups error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pickups',
      error: error.message
    });
  }
});

// @desc    Get single pickup details
// @route   GET /api/pickup/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedCollector', 'name phone');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Authorization
    if (pickup.user._id.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this pickup'
      });
    }

    res.status(200).json({
      success: true,
      data: pickup
    });

  } catch (error) {
    console.error('Get pickup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pickup details',
      error: error.message
    });
  }
});

// @desc    Cancel a pickup
// @route   PUT /api/pickup/:id/cancel
// @access  Private (Citizen)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Check if user owns this pickup
    if (pickup.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this pickup'
      });
    }

    // Check if pickup can be cancelled
    if (pickup.status === 'completed' || pickup.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this pickup'
      });
    }

    // Update pickup status
    pickup.status = 'cancelled';
    pickup.cancellationReason = cancellationReason || 'Cancelled by user';
    pickup.cancelledBy = 'user';
    pickup.cancelledAt = new Date();

    await pickup.save();

    // ✅ Create Notification for cancellation
    try {
      await notifyPickupCancelled(pickup.user, pickup, cancellationReason);
    } catch (error) {
      console.error('Notification error:', error);
    }

    // Deduct points if they were awarded
    if (pickup.pointsAwarded > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: -pickup.pointsAwarded }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pickup cancelled successfully',
      data: pickup
    });

  } catch (error) {
    console.error('Cancel pickup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling pickup',
      error: error.message
    });
  }
});

// @desc    Rate a completed pickup
// @route   PUT /api/pickup/:id/rate
// @access  Private (Citizen)
router.put('/:id/rate', protect, async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating (1-5)'
      });
    }

    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Check ownership
    if (pickup.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if pickup is completed
    if (pickup.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed pickups'
      });
    }

    pickup.rating = rating;
    pickup.feedback = feedback || '';
    await pickup.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: pickup
    });

  } catch (error) {
    console.error('Rate pickup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message
    });
  }
});

// ✅ Example: Route for marking pickup completed (if exists)
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Update status to completed
    pickup.status = 'completed';
    pickup.actualPickupTime = new Date();

    // Calculate final points
    const points = pickup.calculatePoints();
    pickup.pointsAwarded = points;
    await pickup.save();

    // ✅ Create Notification for completion
    try {
      await notifyPickupCompleted(pickup.user, pickup, points);
    } catch (error) {
      console.error('Notification error:', error);
    }

    // Reward points to user
    await User.findByIdAndUpdate(pickup.user, { $inc: { points } });

    res.status(200).json({
      success: true,
      message: 'Pickup marked as completed',
      data: pickup
    });

  } catch (error) {
    console.error('Complete pickup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking pickup as completed',
      error: error.message
    });
  }
});

module.exports = router;
