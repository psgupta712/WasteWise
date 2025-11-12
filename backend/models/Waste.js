const mongoose = require('mongoose');

// Define Waste Record Schema
const wasteSchema = new mongoose.Schema({
  // User who classified this waste
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Waste Classification Result
  wasteType: {
    type: String,
    required: true,
    enum: [
      'Biodegradable',
      'Recyclable - Plastic',
      'Recyclable - Paper',
      'Recyclable - Glass',
      'Recyclable - Metal',
      'E-waste',
      'Hazardous',
      'Other'
    ]
  },

  // Category (main group)
  category: {
    type: String,
    required: true,
    enum: ['Biodegradable', 'Recyclable', 'E-waste', 'Hazardous']
  },

  // Image information
  imageUrl: {
    type: String,
    default: null
  },

  // AI Confidence score (0 to 1)
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },

  // Was it properly segregated?
  properlySegregated: {
    type: Boolean,
    default: true
  },

  // Disposal instructions
  disposalInstructions: {
    type: String,
    required: true
  },

  // Bin color
  binColor: {
    type: String,
    enum: ['Green', 'Blue', 'Yellow', 'Red'],
    required: true
  },

  // Optional: Weight/quantity
  weight: {
    amount: Number,
    unit: {
      type: String,
      enum: ['kg', 'grams', 'pieces'],
      default: 'kg'
    }
  },

  // Location where classified (optional)
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },

  // User feedback
  userFeedback: {
    isCorrect: {
      type: Boolean,
      default: null
    },
    actualType: String,
    comments: String
  },

  // Timestamps
  classifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
wasteSchema.index({ userId: 1, classifiedAt: -1 });
wasteSchema.index({ category: 1 });

// Create and export model
const Waste = mongoose.model('Waste', wasteSchema);

module.exports = Waste;