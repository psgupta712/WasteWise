// Import required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Import routes
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const wasteRoutes = require('./routes/waste.routes');
const pickupRoutes = require('./routes/pickup.routes');
const industryRoutes = require('./routes/industry.routes');
const wasteTrackingRoutes = require('./routes/wasteTracking.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const notificationRoutes = require('./routes/notification.routes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware - These help process requests
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Understand JSON data
app.use(express.urlencoded({ extended: true })); // Understand form data
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);

// Test route - Our first API endpoint!
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Smart Waste Management API!',
    status: 'Server is running 🚀',
    database: 'Connected ✅'
  });
});

// Test route for health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/waste-tracking', wasteTrackingRoutes); // NEW - Tracking routes

// Set port number
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
  console.log(`📦 Waste Tracking API: http://localhost:${PORT}/api/waste-tracking`);
});