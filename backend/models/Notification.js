const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Notification type
  type: {
    type: String,
    enum: [
      'pickup_scheduled',
      'pickup_confirmed', 
      'pickup_in_progress',
      'pickup_completed',
      'pickup_cancelled',
      'pickup_reminder',
      'badge_earned',
      'level_up',
      'reward_available',
      'points_earned',
      'feedback_response',
      'system_update',
      'reminder',
      'alert'
    ],
    required: true
  },

  // Title and message
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },

  // Icon and color for UI
  icon: {
    type: String,
    enum: ['calendar', 'check', 'award', 'message', 'gift', 'alert', 'recycle', 'bell'],
    default: 'bell'
  },

  color: {
    type: String,
    default: '#667eea'
  },

  // Read status
  read: {
    type: Boolean,
    default: false,
    index: true
  },

  readAt: {
    type: Date
  },

  // Related entities (optional)
  relatedPickup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup'
  },

  relatedFeedback: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback'
  },

  // Action button (optional)
  actionUrl: {
    type: String
  },

  actionLabel: {
    type: String
  },

  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // Expiry (optional)
  expiresAt: {
    type: Date
  }

}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read method
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = await this.create(data);
    
    // In production, you would emit socket event here
    // io.to(data.user).emit('notification', notification);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ user: userId, read: false });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;