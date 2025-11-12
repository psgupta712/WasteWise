const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Feedback = require('../models/Feedback');
const Pickup = require('../models/Pickup');

// @desc    Submit new feedback
// @route   POST /api/feedback/submit
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const {
      type,
      subject,
      description,
      priority,
      relatedPickupId,
      contactMethod
    } = req.body;

    // Validation
    if (!type || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, subject, and description'
      });
    }

    // Verify pickup if provided
    let relatedPickup = null;
    if (relatedPickupId) {
      relatedPickup = await Pickup.findOne({
        _id: relatedPickupId,
        user: req.user._id
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      user: req.user._id,
      type,
      subject,
      description,
      priority: priority || 'medium',
      relatedPickup: relatedPickup?._id,
      relatedPickupId: relatedPickupId || null,
      contactMethod: contactMethod || 'email'
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
});

// @desc    Get user's feedback
// @route   GET /api/feedback/my-feedback
// @access  Private
router.get('/my-feedback', protect, async (req, res) => {
  try {
    const { status, type, limit = 20, page = 1 } = req.query;

    const query = { user: req.user._id };

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('relatedPickup', 'wasteType pickupDate status');

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: feedbacks
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

// @desc    Get single feedback details
// @route   GET /api/feedback/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('relatedPickup')
      .populate('respondedBy', 'name');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user has access
    if (feedback.user._id.toString() !== req.user._id.toString() &&
        req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this feedback'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error('Get feedback details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback details',
      error: error.message
    });
  }
});

// @desc    Rate feedback response
// @route   PUT /api/feedback/:id/rate
// @access  Private
router.put('/:id/rate', protect, async (req, res) => {
  try {
    const { rating, ratingComment } = req.body;

    if (!rating || !['helpful', 'not_helpful'].includes(rating)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid rating (helpful or not_helpful)'
      });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check ownership
    if (feedback.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if feedback has response
    if (!feedback.response) {
      return res.status(400).json({
        success: false,
        message: 'Cannot rate feedback without a response'
      });
    }

    feedback.rating = rating;
    feedback.ratingComment = ratingComment || '';
    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Rate feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message
    });
  }
});

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Private
router.get('/my/stats', protect, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id });

    const stats = {
      total: feedbacks.length,
      pending: feedbacks.filter(f => f.status === 'pending').length,
      in_review: feedbacks.filter(f => f.status === 'in_review').length,
      resolved: feedbacks.filter(f => f.status === 'resolved').length,
      closed: feedbacks.filter(f => f.status === 'closed').length,
      byType: {
        complaint: feedbacks.filter(f => f.type === 'complaint').length,
        suggestion: feedbacks.filter(f => f.type === 'suggestion').length,
        praise: feedbacks.filter(f => f.type === 'praise').length,
        query: feedbacks.filter(f => f.type === 'query').length
      },
      avgResponseTime: calculateAvgResponseTime(feedbacks)
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics',
      error: error.message
    });
  }
});

// Helper function to calculate average response time
function calculateAvgResponseTime(feedbacks) {
  const respondedFeedbacks = feedbacks.filter(f => f.respondedAt);
  
  if (respondedFeedbacks.length === 0) return 0;

  const totalTime = respondedFeedbacks.reduce((sum, f) => {
    const responseTime = f.respondedAt - f.createdAt;
    return sum + responseTime;
  }, 0);

  const avgMilliseconds = totalTime / respondedFeedbacks.length;
  const avgHours = Math.round(avgMilliseconds / (1000 * 60 * 60));

  return avgHours;
}

// ==================== ADMIN ROUTES ====================

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized - Admin only'
      });
    }

    const { status, type, priority, limit = 50, page = 1 } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user', 'name email phone userType')
      .populate('relatedPickup', 'wasteType pickupDate');

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: feedbacks
    });

  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

// @desc    Respond to feedback (Admin)
// @route   PUT /api/feedback/:id/respond
// @access  Private/Admin
router.put('/:id/respond', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized - Admin only'
      });
    }

    const { response, status, internalNotes } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a response'
      });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    feedback.response = response;
    feedback.respondedBy = req.user._id;
    feedback.respondedAt = new Date();
    
    if (status) {
      feedback.status = status;
    } else if (feedback.status === 'pending') {
      feedback.status = 'in_review';
    }

    if (internalNotes) {
      feedback.internalNotes = internalNotes;
    }

    await feedback.save();

    // In production, send notification to user via email/app

    res.status(200).json({
      success: true,
      message: 'Response submitted successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Respond to feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to feedback',
      error: error.message
    });
  }
});

module.exports = router;