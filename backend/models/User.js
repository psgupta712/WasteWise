const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User Schema - Structure of user data
const userSchema = new mongoose.Schema({
  // User Type: Citizen, Industry, or Admin
  userType: {
    type: String,
    enum: ['citizen', 'industry', 'pickup_agent', 'admin'],
    default: 'citizen',
    required: true
  },

  // Basic Information (for all users)
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Don't return password in queries
  },
  phone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
  },

  // Address (for Citizens and Industries)
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Industry-specific fields (only if userType is 'Industry')
  companyName: {
    type: String,
    required: function() {
      return this.userType === 'industry';
    }
  },
  industryType: {
    type: String,
    enum: ['Manufacturing', 'Chemical', 'Textile', 'Pharmaceutical', 'Food Processing', 'Electronics', 'Other'],
    required: function() {
      return this.userType === 'industry';
    }
  },
  wasteGenerationCapacity: {
    amount: {
      type: Number, // in tons per month
      required: function() {
        return this.userType === 'industry';
      }
    },
    unit: {
      type: String,
      default: 'tons/month'
    }
  },
  
  // Verification and Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    documentType: String,
    documentUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Gamification (for Citizens)
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  level: {
    type: Number,
    default: 1
  },

  // Password Reset Fields
  resetPasswordToken: {
    type: String,
    default: undefined
  },
  resetPasswordExpire: {
    type: Date,
    default: undefined
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to calculate user level based on points
userSchema.methods.calculateLevel = function() {
  // Every 100 points = 1 level
  this.level = Math.floor(this.points / 100) + 1;
};

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ resetPasswordToken: 1 });

// Create and export model
const User = mongoose.model('User', userSchema);

module.exports = User;