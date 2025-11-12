const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Notification = require('../models/Notification');

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 20, page = 1, unreadOnly = false } = req.query;

    const query = { user: req.user._id };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: notifications
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('relatedPickup')
      .populate('relatedFeedback');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this notification'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification',
      error: error.message
    });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check ownership
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Mark as read
    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, read: false },
      { 
        $set: { 
          read: true, 
          readAt: new Date() 
        } 
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all as read',
      error: error.message
    });
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check ownership
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
});

// @desc    Delete all notifications
// @route   DELETE /api/notifications/all
// @access  Private
router.delete('/all/clear', protect, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: 'All notifications deleted',
      count: result.deletedCount
    });

  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notifications',
      error: error.message
    });
  }
});

// @desc    Get notification settings
// @route   GET /api/notifications/settings
// @access  Private
router.get('/settings/preferences', protect, async (req, res) => {
  try {
    // In production, fetch from user settings
    const settings = {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      notifyPickupScheduled: true,
      notifyPickupCompleted: true,
      notifyBadgeEarned: true,
      notifyRewardAvailable: true,
      notifyFeedbackResponse: true
    };

    res.status(200).json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

// Function to create notification (can be called from other controllers)
const createNotification = async (userId, data) => {
  try {
    const notification = await Notification.createNotification({
      user: userId,
      ...data
    });
    
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

module.exports = router;
module.exports.createNotification = createNotification;