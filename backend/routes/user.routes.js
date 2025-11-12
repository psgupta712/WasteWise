const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');

// @desc    Get user profile with stats
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate stats for citizens
    let stats = {
      totalPickups: 0,
      wasteRecycled: 0,
      completedPickups: 0,
      pendingPickups: 0
    };

    // Only fetch pickup stats for citizens
    if (user.userType === 'citizen') {
      try {
        const Pickup = require('../models/Pickup');
        const pickups = await Pickup.find({ user: user._id });
        
        stats.totalPickups = pickups.length;
        stats.completedPickups = pickups.filter(p => p.status === 'completed').length;
        stats.pendingPickups = pickups.filter(p => p.status === 'scheduled' || p.status === 'in-progress').length;
        
        // Calculate total waste recycled (sum of all completed pickups)
        stats.wasteRecycled = pickups
          .filter(p => p.status === 'completed')
          .reduce((total, pickup) => total + (pickup.estimatedWeight || 0), 0);
      } catch (pickupError) {
        console.log('Pickup stats not available yet:', pickupError.message);
        // Keep default stats if Pickup model not available yet
      }
    }

    // Response data
    const profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      points: user.points || 0,
      badges: user.badges || [],
      level: user.level || 1,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      totalPickups: stats.totalPickups,
      wasteRecycled: Math.round(stats.wasteRecycled * 100) / 100, // Round to 2 decimals
      completedPickups: stats.completedPickups,
      pendingPickups: stats.pendingPickups
    };

    // Add address if available
    if (user.address) {
      profileData.address = `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''} ${user.address.pincode || ''}`.trim();
    } else {
      profileData.address = 'Not provided';
    }

    // Add industry-specific data if applicable
    if (user.userType === 'industry') {
      profileData.companyName = user.companyName;
      profileData.industryType = user.industryType;
      profileData.wasteGenerationCapacity = user.wasteGenerationCapacity;
    }

    res.status(200).json(profileData);

  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) {
      user.address = {
        street: address.street || user.address?.street,
        city: address.city || user.address?.city,
        state: address.state || user.address?.state,
        pincode: address.pincode || user.address?.pincode
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

module.exports = router;