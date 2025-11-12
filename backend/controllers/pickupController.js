const Pickup = require('../models/Pickup');
const User = require('../models/User');
const WasteTracking = require('../models/WasteTracking'); // NEW

// @desc    Schedule new pickup
// @route   POST /api/pickup/schedule
// @access  Private
const schedulePickup = async (req, res) => {
  try {
    const { pickupDate, timeSlot, wasteTypes, address, specialInstructions, wasteQuantity, wasteType, hazardLevel } = req.body;

    // Validation
    if (!pickupDate || !timeSlot || !wasteTypes || !address) {
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
        message: 'Pickup date must be today or in the future'
      });
    }

    // Get user details for contact
    const user = await User.findById(req.user._id);

    // Create pickup
    const pickup = await Pickup.create({
      userId: req.user._id,
      pickupDate: selectedDate,
      timeSlot,
      wasteTypes,
      address,
      contactPerson: {
        name: user.name,
        phone: user.phone
      },
      specialInstructions: specialInstructions || '',
      status: 'Scheduled'
    });

    // NEW: Auto-create tracking record if user is industry
    let trackingId = null;
    if (user.userType === 'industry') {
      try {
        // Generate tracking ID
        trackingId = await WasteTracking.generateTrackingId();

        // Create tracking record
        const tracking = new WasteTracking({
          trackingId,
          industryId: user._id,
          industryName: user.companyName || user.name,
          pickupId: pickup._id,
          wasteManifest: {
            wasteType: wasteType || wasteTypes[0] || 'Mixed',
            quantity: {
              amount: wasteQuantity || 0,
              unit: 'tons'
            },
            description: specialInstructions || 'Scheduled waste pickup',
            hazardLevel: hazardLevel || 'Low'
          },
          collection: {
            scheduledDate: selectedDate
          },
          status: 'Scheduled',
          statusHistory: [{
            status: 'Scheduled',
            timestamp: new Date(),
            updatedBy: user.companyName || user.name,
            notes: 'Waste pickup scheduled'
          }]
        });

        await tracking.save();
        console.log('✅ Tracking created:', trackingId);
      } catch (trackingError) {
        console.error('⚠️ Failed to create tracking (non-critical):', trackingError);
        // Don't fail the pickup creation if tracking fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Pickup scheduled successfully',
      data: pickup,
      trackingId: trackingId  // NEW: Return tracking ID if created
    });

  } catch (error) {
    console.error('Schedule Pickup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling pickup',
      error: error.message
    });
  }
};

// @desc    Get user's pickup history
// @route   GET /api/pickup/my-pickups
// @access  Private
const getMyPickups = async (req, res) => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    // Get pickups
    const pickups = await Pickup.find(query)
      .sort({ pickupDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Pickup.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        pickups,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPickups: total,
          pickupsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get Pickups Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pickups',
      error: error.message
    });
  }
};

// @desc    Get pickup by ID
// @route   GET /api/pickup/:id
// @access  Private
const getPickupById = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Check if pickup belongs to user
    if (pickup.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this pickup'
      });
    }

    res.status(200).json({
      success: true,
      data: pickup
    });

  } catch (error) {
    console.error('Get Pickup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pickup',
      error: error.message
    });
  }
};

// @desc    Cancel pickup
// @route   PUT /api/pickup/:id/cancel
// @access  Private
const cancelPickup = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Check if pickup belongs to user
    if (pickup.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this pickup'
      });
    }

    // Check if pickup can be cancelled
    if (pickup.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed pickup'
      });
    }

    if (pickup.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Pickup is already cancelled'
      });
    }

    // Cancel pickup
    pickup.status = 'Cancelled';
    pickup.cancelledAt = Date.now();
    await pickup.save();

    // NEW: Update tracking status if exists
    try {
      const tracking = await WasteTracking.findOne({ pickupId: pickup._id });
      if (tracking) {
        tracking.status = 'Cancelled';
        tracking.statusHistory.push({
          status: 'Cancelled',
          timestamp: new Date(),
          updatedBy: req.user.name || req.user.companyName,
          notes: 'Pickup cancelled by user'
        });
        await tracking.save();
      }
    } catch (trackingError) {
      console.error('Failed to update tracking:', trackingError);
    }

    res.status(200).json({
      success: true,
      message: 'Pickup cancelled successfully',
      data: pickup
    });

  } catch (error) {
    console.error('Cancel Pickup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling pickup',
      error: error.message
    });
  }
};

// @desc    Complete pickup (Admin/Collector)
// @route   PUT /api/pickup/:id/complete
// @access  Private (Admin only for now)
const completePickup = async (req, res) => {
  try {
    const { actualWeight, rating, feedback } = req.body;
    
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    if (pickup.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Pickup is already completed'
      });
    }

    // Update pickup
    pickup.status = 'Completed';
    pickup.completedAt = Date.now();
    pickup.actualPickupDate = Date.now();
    
    if (actualWeight) {
      pickup.actualWeight = actualWeight;
    }

    // Calculate and award points
    const points = pickup.calculatePoints();
    pickup.pointsAwarded = points;

    // Award points to user
    await User.findByIdAndUpdate(pickup.userId, {
      $inc: { points: points }
    });

    // Save rating/feedback if provided
    if (rating) pickup.rating = rating;
    if (feedback) pickup.feedback = feedback;

    await pickup.save();

    // NEW: Update tracking status if exists
    try {
      const tracking = await WasteTracking.findOne({ pickupId: pickup._id });
      if (tracking) {
        tracking.status = 'Disposed';
        tracking.disposal.disposalDate = new Date();
        tracking.statusHistory.push({
          status: 'Disposed',
          timestamp: new Date(),
          updatedBy: req.user.name || 'Admin',
          notes: 'Pickup completed and waste disposed'
        });
        await tracking.save();
      }
    } catch (trackingError) {
      console.error('Failed to update tracking:', trackingError);
    }

    res.status(200).json({
      success: true,
      message: 'Pickup completed successfully',
      data: {
        pickup,
        pointsAwarded: points
      }
    });

  } catch (error) {
    console.error('Complete Pickup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing pickup',
      error: error.message
    });
  }
};

// @desc    Get pickup statistics
// @route   GET /api/pickup/stats
// @access  Private
const getPickupStats = async (req, res) => {
  try {
    // Total pickups
    const totalPickups = await Pickup.countDocuments({ userId: req.user._id });

    // Status breakdown
    const statusBreakdown = await Pickup.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total weight collected
    const weightData = await Pickup.aggregate([
      { 
        $match: { 
          userId: req.user._id,
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          totalWeight: { $sum: '$actualWeight.amount' }
        }
      }
    ]);

    // Total points earned from pickups
    const pointsData = await Pickup.aggregate([
      {
        $match: {
          userId: req.user._id,
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$pointsAwarded' }
        }
      }
    ]);

    // Upcoming pickups
    const upcomingPickups = await Pickup.countDocuments({
      userId: req.user._id,
      status: 'Scheduled',
      pickupDate: { $gte: new Date() }
    });

    res.status(200).json({
      success: true,
      data: {
        totalPickups,
        statusBreakdown,
        totalWeightCollected: weightData[0]?.totalWeight || 0,
        totalPointsEarned: pointsData[0]?.totalPoints || 0,
        upcomingPickups
      }
    });

  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = {
  schedulePickup,
  getMyPickups,
  getPickupById,
  cancelPickup,
  completePickup,
  getPickupStats
};