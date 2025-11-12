const mongoose = require('mongoose');

// Function to generate tracking ID
const generateTrackingId = (month, year) => {
  const yearStr = year.toString();
  const monthStr = String(month).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `IW${yearStr}${monthStr}-${random}`;
};

// Define Industry Waste Declaration Schema
const industryWasteSchema = new mongoose.Schema({
  // Industry/Company ID
  industryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Declaration Period
  declarationPeriod: {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    }
  },

  // Waste Categories with Quantities
  wasteCategories: [{
    category: {
      type: String,
      enum: ['Biodegradable', 'Recyclable', 'E-waste', 'Hazardous', 'Chemical', 'Metal Scrap', 'Plastic Waste', 'Other'],
      required: true
    },
    quantity: {
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        enum: ['kg', 'tons'],
        default: 'tons'
      }
    },
    description: String,
    disposalMethod: {
      type: String,
      enum: ['Recycling', 'Incineration', 'Landfill', 'Treatment', 'Other'],
      required: true
    }
  }],

  // Total Waste Generated
  totalWasteGenerated: {
    amount: Number,
    unit: {
      type: String,
      default: 'tons'
    }
  },

  // Tracking ID (unique identifier)
  trackingId: {
    type: String,
    unique: true
  },

  // Status
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
    default: 'Draft'
  },

  // Compliance Details
  compliance: {
    isPollutionCertValid: {
      type: Boolean,
      default: false
    },
    certificateNumber: String,
    certificateExpiry: Date,
    isProperlySegregated: {
      type: Boolean,
      default: true
    }
  },

  // Documents
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['Manifest', 'Certificate', 'Report', 'Other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Linked Pickup (if waste collected)
  linkedPickupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup'
  },

  // Admin Review
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  reviewedAt: Date,

  // Timestamps
  submittedAt: Date,
  approvedAt: Date
}, {
  timestamps: true
});

// Generate unique tracking ID and calculate total BEFORE validation
industryWasteSchema.pre('validate', function(next) {
  // Generate tracking ID if not set
  if (!this.trackingId) {
    this.trackingId = generateTrackingId(this.declarationPeriod.month, this.declarationPeriod.year);
  }
  
  // Calculate total waste if not set
  if (!this.totalWasteGenerated || !this.totalWasteGenerated.amount) {
    if (this.wasteCategories && this.wasteCategories.length > 0) {
      const total = this.wasteCategories.reduce((sum, cat) => {
        // Convert kg to tons if needed
        const amount = cat.quantity.unit === 'kg' 
          ? cat.quantity.amount / 1000 
          : cat.quantity.amount;
        return sum + amount;
      }, 0);
      
      this.totalWasteGenerated = {
        amount: Math.round(total * 100) / 100,
        unit: 'tons'
      };
    }
  }
  
  next();
});

// Index for faster queries
industryWasteSchema.index({ industryId: 1, 'declarationPeriod.year': -1, 'declarationPeriod.month': -1 });
industryWasteSchema.index({ trackingId: 1 });
industryWasteSchema.index({ status: 1 });

// Create and export model
const IndustryWaste = mongoose.model('IndustryWaste', industryWasteSchema);

module.exports = IndustryWaste;