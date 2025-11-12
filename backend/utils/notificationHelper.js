const Notification = require('../models/Notification');

/**
 * Notification Helper Functions
 * These functions create notifications for various events
 */

// Pickup Notifications
const notifyPickupScheduled = async (userId, pickupData) => {
  return await Notification.createNotification({
    user: userId,
    type: 'pickup_scheduled',
    title: 'Pickup Scheduled',
    message: `Your ${pickupData.wasteType} waste pickup has been scheduled for ${new Date(pickupData.pickupDate).toLocaleDateString()}`,
    icon: 'calendar',
    color: '#667eea',
    relatedPickup: pickupData._id,
    actionUrl: '/my-pickups',
    actionLabel: 'View Pickup'
  });
};

const notifyPickupCompleted = async (userId, pickupData, pointsEarned) => {
  return await Notification.createNotification({
    user: userId,
    type: 'pickup_completed',
    title: 'Pickup Completed!',
    message: `Your ${pickupData.wasteType} waste pickup was completed successfully. +${pointsEarned} points earned!`,
    icon: 'check',
    color: '#4caf50',
    relatedPickup: pickupData._id,
    actionUrl: '/rewards',
    actionLabel: 'View Rewards'
  });
};

const notifyPickupCancelled = async (userId, pickupData, reason) => {
  return await Notification.createNotification({
    user: userId,
    type: 'pickup_cancelled',
    title: 'Pickup Cancelled',
    message: `Your pickup scheduled for ${new Date(pickupData.pickupDate).toLocaleDateString()} was cancelled. ${reason || ''}`,
    icon: 'alert',
    color: '#f44336',
    relatedPickup: pickupData._id,
    priority: 'high'
  });
};

const notifyPickupReminder = async (userId, pickupData) => {
  return await Notification.createNotification({
    user: userId,
    type: 'pickup_reminder',
    title: 'Pickup Reminder',
    message: `Your pickup is scheduled for tomorrow. Please keep waste ready at the designated location.`,
    icon: 'calendar',
    color: '#ff9800',
    relatedPickup: pickupData._id,
    priority: 'high'
  });
};

// Reward Notifications
const notifyBadgeEarned = async (userId, badgeName) => {
  return await Notification.createNotification({
    user: userId,
    type: 'badge_earned',
    title: 'New Badge Unlocked!',
    message: `Congratulations! You've earned the "${badgeName}" badge`,
    icon: 'award',
    color: '#ffc107',
    actionUrl: '/rewards',
    actionLabel: 'View Badges',
    priority: 'high'
  });
};

const notifyLevelUp = async (userId, newLevel) => {
  return await Notification.createNotification({
    user: userId,
    type: 'level_up',
    title: 'Level Up! 🎉',
    message: `Amazing! You've reached Level ${newLevel}. Keep up the great work!`,
    icon: 'award',
    color: '#9c27b0',
    actionUrl: '/rewards',
    actionLabel: 'View Progress',
    priority: 'high'
  });
};

const notifyRewardAvailable = async (userId, rewardName, pointsCost) => {
  return await Notification.createNotification({
    user: userId,
    type: 'reward_available',
    title: 'Reward Available!',
    message: `You have enough points to redeem: ${rewardName} (${pointsCost} points)`,
    icon: 'gift',
    color: '#9c27b0',
    actionUrl: '/rewards',
    actionLabel: 'Redeem Now'
  });
};

const notifyPointsEarned = async (userId, points, reason) => {
  return await Notification.createNotification({
    user: userId,
    type: 'points_earned',
    title: 'Points Earned!',
    message: `You earned ${points} points ${reason ? `for ${reason}` : ''}`,
    icon: 'award',
    color: '#ffc107',
    actionUrl: '/rewards'
  });
};

// Feedback Notifications
const notifyFeedbackResponse = async (userId, feedbackData) => {
  return await Notification.createNotification({
    user: userId,
    type: 'feedback_response',
    title: 'Feedback Response',
    message: `We've responded to your ${feedbackData.type}: "${feedbackData.subject}"`,
    icon: 'message',
    color: '#2196f3',
    relatedFeedback: feedbackData._id,
    actionUrl: '/feedback',
    actionLabel: 'View Response'
  });
};

// System Notifications
const notifySystemUpdate = async (userId, updateTitle, updateMessage) => {
  return await Notification.createNotification({
    user: userId,
    type: 'system_update',
    title: updateTitle,
    message: updateMessage,
    icon: 'bell',
    color: '#667eea',
    priority: 'medium'
  });
};

// Bulk notification to all users
const notifyAllUsers = async (notificationData) => {
  try {
    const User = require('../models/User');
    const users = await User.find({ userType: 'citizen' }).select('_id');
    
    const notifications = users.map(user => ({
      user: user._id,
      ...notificationData
    }));

    await Notification.insertMany(notifications);
    
    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Bulk notify error:', error);
    throw error;
  }
};

module.exports = {
  notifyPickupScheduled,
  notifyPickupCompleted,
  notifyPickupCancelled,
  notifyPickupReminder,
  notifyBadgeEarned,
  notifyLevelUp,
  notifyRewardAvailable,
  notifyPointsEarned,
  notifyFeedbackResponse,
  notifySystemUpdate,
  notifyAllUsers
};