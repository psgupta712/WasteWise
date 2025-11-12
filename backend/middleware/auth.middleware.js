const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Check if user is logged in
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next(); // Continue to next middleware/controller
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Authorize specific user types (e.g., only Admin can access)
const authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `User type '${req.user.userType}' is not authorized to access this route`
      });
    }
    next();
  };
};

// NEW: Check if user is industry
const isIndustry = (req, res, next) => {
  if (req.user.userType !== 'industry') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Industry role required.'
    });
  }
  next();
};

// NEW: Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// NEW: Check if user is admin or collector
const isAdminOrCollector = (req, res, next) => {
  if (req.user.userType !== 'admin' && req.user.userType !== 'collector') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Collector role required.'
    });
  }
  next();
};

// ALIAS: For backwards compatibility with tracking routes
const verifyToken = protect;

module.exports = { 
  protect, 
  authorize,
  verifyToken,  // Alias for protect
  isIndustry,   // NEW
  isAdmin,      // NEW
  isAdminOrCollector  // NEW
};