const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // User who submitted feedback
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Feedback type
  type: {
    type: String,
    enum: ['complaint', 'suggestion', 'praise', 'query'],
    required: [true, 'Please specify feedback type']
  },

  // Subject and description
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true,
    maxlength: 200
  },

  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: 2000
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'in_review', 'resolved', 'closed'],
    default: 'pending'
  },

  // Related pickup (optional)
  relatedPickup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup'
  },

  relatedPickupId: {
    type: String
  },

  // Contact preference
  contactMethod: {
    type: String,
    enum: ['email', 'phone', 'app'],
    default: 'email'
  },

  // Response from support team
  response: {
    type: String,
    trim: true
  },

  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  respondedAt: {
    type: Date
  },

  // Resolution
  resolvedAt: {
    type: Date
  },

  closedAt: {
    type: Date
  },

  // User rating of response
  rating: {
    type: String,
    enum: ['helpful', 'not_helpful']
  },

  ratingComment: {
    type: String,
    trim: true
  },

  // Attachments (URLs)
  attachments: [{
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Internal notes (admin only)
  internalNotes: {
    type: String,
    trim: true
  },

  // Assigned to
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

// Indexes for better performance
feedbackSchema.index({ user: 1, status: 1 });
feedbackSchema.index({ type: 1, priority: 1 });
feedbackSchema.index({ status: 1, createdAt: -1 });

// Auto-update status timestamps
feedbackSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    }
    if (this.status === 'closed' && !this.closedAt) {
      this.closedAt = new Date();
    }
  }
  next();
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;