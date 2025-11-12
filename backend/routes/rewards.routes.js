const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');
const Pickup = require('../models/Pickup');

// @desc    Get community leaderboard
// @route   GET /api/rewards/leaderboard
// @access  Private
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get top users by points
    const users = await User.find({ userType: 'citizen' })
      .select('name points level')
      .sort({ points: -1 })
      .limit(parseInt(limit));

    // Enrich with pickup data
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const pickups = await Pickup.find({ 
          user: user._id, 
          status: 'completed' 
        });

        const pickupsCompleted = pickups.length;
        const wasteRecycled = pickups.reduce((total, pickup) => {
          return total + (pickup.actualWeight || pickup.estimatedWeight || 0);
        }, 0);

        return {
          _id: user._id,
          name: user.name,
          points: user.points,
          level: user.level,
          pickupsCompleted,
          wasteRecycled: Math.round(wasteRecycled * 100) / 100
        };
      })
    );

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
});

// @desc    Get user rank in leaderboard
// @route   GET /api/rewards/my-rank
// @access  Private
router.get('/my-rank', protect, async (req, res) => {
  try {
    // Get all users sorted by points
    const allUsers = await User.find({ userType: 'citizen' })
      .select('_id points')
      .sort({ points: -1 });

    // Find user's rank
    const rank = allUsers.findIndex(user => 
      user._id.toString() === req.user._id.toString()
    ) + 1;

    // Get users around current user
    const startIdx = Math.max(0, rank - 3);
    const endIdx = Math.min(allUsers.length, rank + 2);
    const nearbyUsers = allUsers.slice(startIdx, endIdx);

    res.status(200).json({
      success: true,
      data: {
        rank,
        totalUsers: allUsers.length,
        percentile: Math.round((1 - (rank / allUsers.length)) * 100),
        nearbyUsers
      }
    });

  } catch (error) {
    console.error('Get rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rank',
      error: error.message
    });
  }
});

// @desc    Award points to user
// @route   POST /api/rewards/award-points
// @access  Private (Admin only - can add middleware)
router.post('/award-points', protect, async (req, res) => {
  try {
    const { userId, points, reason } = req.body;

    if (!userId || !points) {
      return res.status(400).json({
        success: false,
        message: 'User ID and points are required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Award points
    user.points += parseInt(points);
    
    // Calculate new level
    user.calculateLevel();
    
    await user.save();

    res.status(200).json({
      success: true,
      message: `${points} points awarded successfully`,
      data: {
        newPoints: user.points,
        newLevel: user.level,
        reason
      }
    });

  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({
      success: false,
      message: 'Error awarding points',
      error: error.message
    });
  }
});

// @desc    Get user badges
// @route   GET /api/rewards/badges
// @access  Private
router.get('/badges', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get pickup stats
    const pickups = await Pickup.find({ 
      user: req.user._id, 
      status: 'completed' 
    });

    const totalPickups = pickups.length;
    const wasteRecycled = pickups.reduce((total, pickup) => {
      return total + (pickup.actualWeight || pickup.estimatedWeight || 0);
    }, 0);

    // Define badge criteria
    const badges = [
      {
        id: 'first_pickup',
        name: 'First Step',
        description: 'Complete your first pickup',
        unlocked: totalPickups >= 1,
        unlockedAt: totalPickups >= 1 ? pickups[0].createdAt : null
      },
      {
        id: 'eco_warrior',
        name: 'Eco Warrior',
        description: 'Complete 10 pickups',
        unlocked: totalPickups >= 10,
        unlockedAt: totalPickups >= 10 ? pickups[9].createdAt : null
      },
      {
        id: 'recycling_hero',
        name: 'Recycling Hero',
        description: 'Recycle 50kg of waste',
        unlocked: wasteRecycled >= 50,
        unlockedAt: wasteRecycled >= 50 ? new Date() : null
      },
      {
        id: 'waste_master',
        name: 'Waste Master',
        description: 'Complete 25 pickups',
        unlocked: totalPickups >= 25,
        unlockedAt: totalPickups >= 25 ? pickups[24].createdAt : null
      },
      {
        id: 'green_champion',
        name: 'Green Champion',
        description: 'Reach Level 10',
        unlocked: user.level >= 10,
        unlockedAt: user.level >= 10 ? new Date() : null
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        badges,
        totalUnlocked: badges.filter(b => b.unlocked).length,
        totalBadges: badges.length
      }
    });

  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges',
      error: error.message
    });
  }
});

// @desc    Redeem reward
// @route   POST /api/rewards/redeem
// @access  Private
router.post('/redeem', protect, async (req, res) => {
  try {
    const { rewardId, pointsCost } = req.body;

    if (!rewardId || !pointsCost) {
      return res.status(400).json({
        success: false,
        message: 'Reward ID and points cost are required'
      });
    }

    const user = await User.findById(req.user._id);

    // Check if user has enough points
    if (user.points < pointsCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points to redeem this reward'
      });
    }

    // Deduct points
    user.points -= pointsCost;
    await user.save();

    // In production, you would:
    // 1. Create a redemption record
    // 2. Send email with reward details
    // 3. Generate coupon code if applicable

    res.status(200).json({
      success: true,
      message: 'Reward redeemed successfully',
      data: {
        rewardId,
        pointsDeducted: pointsCost,
        remainingPoints: user.points,
        message: 'Check your email for reward details'
      }
    });

  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Error redeeming reward',
      error: error.message
    });
  }
});

module.exports = router;