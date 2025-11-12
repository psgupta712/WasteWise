const Waste = require('../models/Waste');
const User = require('../models/User');
const { getWasteInfo, searchWasteItem } = require('../data/wasteGuide');

// @desc    Classify waste (simplified - using keywords for now)
// @route   POST /api/waste/classify
// @access  Private
const classifyWaste = async (req, res) => {
  try {
    const { wasteType, imageUrl, weight } = req.body;
    
    if (!wasteType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide waste type or description'
      });
    }

    // Get waste information from guide
    const wasteInfo = getWasteInfo(wasteType);
    
    // Create waste record
    const wasteRecord = await Waste.create({
      userId: req.user._id,
      wasteType: wasteInfo.wasteType,
      category: wasteInfo.category,
      imageUrl: imageUrl || null,
      confidence: 0.85,
      disposalInstructions: wasteInfo.disposalInstructions,
      binColor: wasteInfo.binColor,
      weight: weight || null,
      properlySegregated: true
    });

    // NOTE: Points will be awarded when pickup is completed, not for classification

    res.status(201).json({
      success: true,
      message: 'Waste classified successfully',
      data: {
        _id: wasteRecord._id,
        wasteType: wasteRecord.wasteType,
        category: wasteRecord.category,
        binColor: wasteRecord.binColor,
        disposalInstructions: wasteRecord.disposalInstructions,
        confidence: wasteRecord.confidence,
        tips: wasteInfo.tips,
        warning: wasteInfo.warning,
        recyclingBenefit: wasteInfo.recyclingBenefit
      }
    });

  } catch (error) {
    console.error('Waste Classification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error classifying waste',
      error: error.message
    });
  }
};

// @desc    Get waste classification history
// @route   GET /api/waste/history
// @access  Private
const getWasteHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's waste records
    const wasteRecords = await Waste.find({ userId: req.user._id })
      .sort({ classifiedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Waste.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        records: wasteRecords,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          recordsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching waste history',
      error: error.message
    });
  }
};

// @desc    Get waste statistics for user
// @route   GET /api/waste/stats
// @access  Private
const getWasteStats = async (req, res) => {
  try {
    // Get total classifications
    const totalClassifications = await Waste.countDocuments({ userId: req.user._id });

    // Get category breakdown
    const categoryStats = await Waste.aggregate([
      { $match: { userId: req.user._id } },
      { 
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate properly segregated percentage
    const properlySegreted = await Waste.countDocuments({
      userId: req.user._id,
      properlySegregated: true
    });

    const segregationRate = totalClassifications > 0 
      ? Math.round((properlySegreted / totalClassifications) * 100)
      : 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Waste.countDocuments({
      userId: req.user._id,
      classifiedAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalClassifications,
        categoryBreakdown: categoryStats,
        segregationRate: `${segregationRate}%`,
        recentActivity,
        pointsEarned: req.user.points || 0,
        level: req.user.level || 1
      }
    });

  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Search waste items in guide
// @route   GET /api/waste/search?q=plastic
// @access  Public
const searchWaste = async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide search query'
      });
    }

    const results = searchWasteItem(query);

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching waste items',
      error: error.message
    });
  }
};

// @desc    Delete waste record
// @route   DELETE /api/waste/:id
// @access  Private
const deleteWasteRecord = async (req, res) => {
  try {
    const waste = await Waste.findById(req.params.id);

    if (!waste) {
      return res.status(404).json({
        success: false,
        message: 'Waste record not found'
      });
    }

    // Check if waste belongs to user
    if (waste.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this record'
      });
    }

    await waste.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Waste record deleted successfully'
    });

  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting waste record',
      error: error.message
    });
  }
};

module.exports = {
  classifyWaste,
  getWasteHistory,
  getWasteStats,
  searchWaste,
  deleteWasteRecord
};