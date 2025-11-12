const WasteTracking = require('../models/WasteTracking');
const Pickup = require('../models/Pickup'); // Assuming you have this

// Create new tracking record (usually called after pickup is scheduled)
exports.createTracking = async (req, res) => {
  try {
    const { pickupId, wasteManifest, scheduledDate } = req.body;
    const industryId = req.user.id;
    const industryName = req.user.companyName || req.user.name;

    // Generate unique tracking ID
    const trackingId = await WasteTracking.generateTrackingId();

    // Create tracking record
    const tracking = new WasteTracking({
      trackingId,
      industryId,
      industryName,
      pickupId,
      wasteManifest,
      collection: {
        scheduledDate: scheduledDate || new Date()
      },
      status: 'Scheduled',
      statusHistory: [{
        status: 'Scheduled',
        timestamp: new Date(),
        updatedBy: industryName,
        notes: 'Waste pickup scheduled'
      }]
    });

    await tracking.save();

    res.status(201).json({
      success: true,
      message: 'Tracking record created successfully',
      data: tracking
    });
  } catch (error) {
    console.error('Create tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tracking record',
      error: error.message
    });
  }
};

// Get tracking by ID (public - anyone can track with ID)
exports.getTrackingById = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const tracking = await WasteTracking.findOne({ trackingId })
      .populate('industryId', 'companyName name email')
      .populate('disposal.facilityId', 'name address');

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Tracking record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tracking
    });
  } catch (error) {
    console.error('Get tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tracking',
      error: error.message
    });
  }
};

// Get all tracking for logged-in industry
exports.getMyTrackings = async (req, res) => {
  try {
    const industryId = req.user.id;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { industryId };
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    const trackings = await WasteTracking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('disposal.facilityId', 'name address');

    const total = await WasteTracking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: trackings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my trackings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trackings',
      error: error.message
    });
  }
};

// Update tracking status (Admin/Collector only)
exports.updateStatus = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { status, notes, location, collectorName, vehicleNumber, facilityName, disposalMethod } = req.body;
    const updatedBy = req.user.name || req.user.email;

    const tracking = await WasteTracking.findOne({ trackingId });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Tracking record not found'
      });
    }

    // Update main status
    tracking.status = status;

    // Add to status history
    tracking.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy,
      notes,
      location
    });

    // Update specific fields based on status
    if (status === 'Collected') {
      tracking.collection.collectedDate = new Date();
      if (collectorName) tracking.collection.collectorName = collectorName;
      if (vehicleNumber) tracking.collection.vehicleNumber = vehicleNumber;
    }

    if (status === 'At Facility' || status === 'Disposed') {
      if (facilityName) tracking.disposal.facilityName = facilityName;
      if (disposalMethod) tracking.disposal.disposalMethod = disposalMethod;
      if (status === 'Disposed') {
        tracking.disposal.disposalDate = new Date();
      }
    }

    await tracking.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: tracking
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// Get tracking statistics for industry dashboard
exports.getTrackingStats = async (req, res) => {
  try {
    const industryId = req.user.id;

    const stats = await WasteTracking.aggregate([
      { $match: { industryId: mongoose.Types.ObjectId(industryId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalWaste: { $sum: '$wasteManifest.quantity.amount' }
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      total: 0,
      scheduled: 0,
      collected: 0,
      inTransit: 0,
      atFacility: 0,
      disposed: 0,
      totalWasteDisposed: 0
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      const statusKey = stat._id.toLowerCase().replace(' ', '');
      formattedStats[statusKey] = stat.count;
      
      if (stat._id === 'Disposed') {
        formattedStats.totalWasteDisposed = stat.totalWaste;
      }
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Get tracking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
};

// Get all trackings (Admin only)
exports.getAllTrackings = async (req, res) => {
  try {
    const { status, industryId, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    
    if (status) filter.status = status;
    if (industryId) filter.industryId = industryId;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    const trackings = await WasteTracking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('industryId', 'companyName name email')
      .populate('disposal.facilityId', 'name address');

    const total = await WasteTracking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: trackings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all trackings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trackings',
      error: error.message
    });
  }
};

// Delete tracking (Admin only - for testing/cleanup)
exports.deleteTracking = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const tracking = await WasteTracking.findOneAndDelete({ trackingId });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Tracking record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tracking record deleted successfully'
    });
  } catch (error) {
    console.error('Delete tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tracking',
      error: error.message
    });
  }
};