const mongoose = require('mongoose');

const wasteTrackingSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
    // Format: WM-YYYY-XXXXXX (e.g., WM-2024-000001)
  },
  industryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  industryName: {
    type: String,
    required: true,
  },
  pickupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup',
    required: true,
  },
  
  // Waste Manifest Details
  wasteManifest: {
    wasteType: {
      type: String,
      required: true,
      enum: ['Hazardous', 'Non-Hazardous', 'E-Waste', 'Biomedical', 'Plastic', 'Metal', 'Chemical', 'Other']
    },
    quantity: {
      amount: { type: Number, required: true },
      unit: { type: String, default: 'tons' }
    },
    description: String,
    hazardLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Extreme'],
      default: 'Low'
    },
  },
  
  // Collection Details
  collection: {
    scheduledDate: Date,
    collectedDate: Date,
    collectorName: String,
    vehicleNumber: String,
    collectorNotes: String,
  },
  
  // Disposal Details
  disposal: {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecyclingCenter'
    },
    facilityName: String,
    disposalDate: Date,
    disposalMethod: {
      type: String,
      enum: ['Recycling', 'Incineration', 'Landfill', 'Treatment', 'Composting', 'Other']
    },
    certificateUrl: String, // PDF certificate URL
  },
  
  // Status Tracking
  status: {
    type: String,
    required: true,
    enum: ['Scheduled', 'Collected', 'In Transit', 'At Facility', 'Disposed', 'Cancelled'],
    default: 'Scheduled'
  },
  
  // Status History (Timeline)
  statusHistory: [{
    status: {
      type: String,
      enum: ['Scheduled', 'Collected', 'In Transit', 'At Facility', 'Disposed', 'Cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: String,
    notes: String,
    location: {
      lat: Number,
      lng: Number,
      address: String
    }
  }],
  
  // Documents
  documents: [{
    name: String,
    type: String, // 'permit', 'manifest', 'certificate', 'photo'
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Compliance
  compliance: {
    isCompliant: {
      type: Boolean,
      default: true
    },
    violations: [String],
    certificationRequired: Boolean,
    certificationIssued: Boolean,
  },
  
}, {
  timestamps: true
});

// Generate unique tracking ID
wasteTrackingSchema.statics.generateTrackingId = async function() {
  const year = new Date().getFullYear();
  const prefix = `WM-${year}-`;
  
  // Find the last tracking ID for this year
  const lastTracking = await this.findOne({
    trackingId: new RegExp(`^${prefix}`)
  }).sort({ trackingId: -1 });
  
  let nextNumber = 1;
  if (lastTracking) {
    const lastNumber = parseInt(lastTracking.trackingId.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  // Pad with zeros (6 digits)
  const trackingId = `${prefix}${String(nextNumber).padStart(6, '0')}`;
  return trackingId;
};

// Method to add status update
wasteTrackingSchema.methods.addStatusUpdate = function(status, updatedBy, notes, location) {
  this.status = status;
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy,
    notes,
    location
  });
  return this.save();
};

// Index for faster queries
wasteTrackingSchema.index({ trackingId: 1 });
wasteTrackingSchema.index({ industryId: 1, createdAt: -1 });
wasteTrackingSchema.index({ status: 1 });

const WasteTracking = mongoose.model('WasteTracking', wasteTrackingSchema);

module.exports = WasteTracking;