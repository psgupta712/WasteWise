const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  // User who requested the pickup
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Waste details
  wasteType: {
    type: String,
    enum: ['biodegradable', 'recyclable', 'e-waste', 'hazardous'],
    required: [true, 'Please specify waste type']
  },

  // Pickup schedule
  pickupDate: {
    type: Date,
    required: [true, 'Please specify pickup date']
  },
  
  timeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    required: [true, 'Please specify time slot']
  },

  // Location
  address: {
    type: String,
    required: [true, 'Please provide pickup address']
  },
  
  coordinates: {
    latitude: Number,
    longitude: Number
  },

  // Additional details
  estimatedWeight: {
    type: Number,
    default: 0,
    min: 0
  },

  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required']
  },

  specialInstructions: {
    type: String,
    trim: true
  },

  // Pickup status
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },

  // Assigned collector
  assignedCollector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Actual pickup details (filled after completion)
  actualWeight: {
    type: Number,
    default: 0
  },

  actualPickupTime: {
    type: Date
  },

  completionPhoto: {
    type: String // URL to photo
  },

  // Verification
  verificationCode: {
    type: String,
    unique: true,
    sparse: true
  },

  // Rating and feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },

  feedback: {
    type: String,
    trim: true
  },

  // Points awarded
  pointsAwarded: {
    type: Number,
    default: 0
  },

  // Cancellation
  cancellationReason: {
    type: String
  },

  cancelledBy: {
    type: String,
    enum: ['user', 'collector', 'admin']
  },

  cancelledAt: {
    type: Date
  }

}, {
  timestamps: true
});

// Generate verification code before saving
pickupSchema.pre('save', function(next) {
  if (this.isNew && !this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Calculate points based on waste type and weight
pickupSchema.methods.calculatePoints = function() {
  const basePoints = {
    'biodegradable': 10,
    'recyclable': 15,
    'e-waste': 20,
    'hazardous': 25
  };

  const weightBonus = Math.floor(this.actualWeight || this.estimatedWeight || 0);
  this.pointsAwarded = basePoints[this.wasteType] + weightBonus;
  
  return this.pointsAwarded;
};

// Indexes for better performance
pickupSchema.index({ user: 1, status: 1 });
pickupSchema.index({ pickupDate: 1, status: 1 });
pickupSchema.index({ assignedCollector: 1, status: 1 });

const Pickup = mongoose.model('Pickup', pickupSchema);

module.exports = Pickup;