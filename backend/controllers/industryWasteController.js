const IndustryWaste = require('../models/IndustryWaste');
const User = require('../models/User');

// @desc    Submit waste declaration
// @route   POST /api/industry/waste/declare
// @access  Private (Industry only)
const submitWasteDeclaration = async (req, res) => {
  try {
    const { declarationPeriod, wasteCategories, compliance, documents } = req.body;

    // Check if user is industry
    if (req.user.userType !== 'Industry') {
      return res.status(403).json({
        success: false,
        message: 'Only industries can submit waste declarations'
      });
    }

    // Check if declaration already exists for this period
    const existingDeclaration = await IndustryWaste.findOne({
      industryId: req.user._id,
      'declarationPeriod.month': declarationPeriod.month,
      'declarationPeriod.year': declarationPeriod.year
    });

    if (existingDeclaration) {
      return res.status(400).json({
        success: false,
        message: 'Declaration already exists for this period'
      });
    }

    // Create declaration
    const declaration = await IndustryWaste.create({
      industryId: req.user._id,
      declarationPeriod,
      wasteCategories,
      compliance: compliance || {},
      documents: documents || [],
      status: 'Submitted',
      submittedAt: Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Waste declaration submitted successfully',
      data: declaration
    });

  } catch (error) {
    console.error('Submit Declaration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting declaration',
      error: error.message
    });
  }
};

// @desc    Get all declarations for industry
// @route   GET /api/industry/waste/declarations
// @access  Private (Industry only)
const getMyDeclarations = async (req, res) => {
  try {
    const { status, year } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { industryId: req.user._id };
    if (status) query.status = status;
    if (year) query['declarationPeriod.year'] = parseInt(year);

    // Get declarations
    const declarations = await IndustryWaste.find(query)
      .sort({ 'declarationPeriod.year': -1, 'declarationPeriod.month': -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await IndustryWaste.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        declarations,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalDeclarations: total
        }
      }
    });

  } catch (error) {
    console.error('Get Declarations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching declarations',
      error: error.message
    });
  }
};

// @desc    Get declaration by tracking ID
// @route   GET /api/industry/waste/track/:trackingId
// @access  Public (anyone can track)
const trackWaste = async (req, res) => {
  try {
    const declaration = await IndustryWaste.findOne({ 
      trackingId: req.params.trackingId 
    }).populate('industryId', 'companyName industryType')
      .populate('linkedPickupId');

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Declaration not found with this tracking ID'
      });
    }

    res.status(200).json({
      success: true,
      data: declaration
    });

  } catch (error) {
    console.error('Track Waste Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking waste',
      error: error.message
    });
  }
};

// @desc    Get industry statistics
// @route   GET /api/industry/waste/stats
// @access  Private (Industry only)
const getIndustryStats = async (req, res) => {
  try {
    // Total declarations
    const totalDeclarations = await IndustryWaste.countDocuments({ 
      industryId: req.user._id 
    });

    // Status breakdown
    const statusBreakdown = await IndustryWaste.aggregate([
      { $match: { industryId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total waste generated (current year)
    const currentYear = new Date().getFullYear();
    const yearlyWaste = await IndustryWaste.aggregate([
      {
        $match: {
          industryId: req.user._id,
          'declarationPeriod.year': currentYear
        }
      },
      {
        $group: {
          _id: null,
          totalWaste: { $sum: '$totalWasteGenerated.amount' }
        }
      }
    ]);

    // Category breakdown
    const categoryBreakdown = await IndustryWaste.aggregate([
      { $match: { industryId: req.user._id } },
      { $unwind: '$wasteCategories' },
      {
        $group: {
          _id: '$wasteCategories.category',
          totalQuantity: { $sum: '$wasteCategories.quantity.amount' }
        }
      }
    ]);

    // Pending approvals
    const pendingApprovals = await IndustryWaste.countDocuments({
      industryId: req.user._id,
      status: { $in: ['Submitted', 'Under Review'] }
    });

    res.status(200).json({
      success: true,
      data: {
        totalDeclarations,
        statusBreakdown,
        totalWasteThisYear: yearlyWaste[0]?.totalWaste || 0,
        categoryBreakdown,
        pendingApprovals
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

// @desc    Generate compliance certificate
// @route   GET /api/industry/waste/certificate/:declarationId
// @access  Private (Industry only)
const generateCertificate = async (req, res) => {
  try {
    const declaration = await IndustryWaste.findById(req.params.declarationId)
      .populate('industryId', 'companyName industryType email phone address');

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Declaration not found'
      });
    }

    // Check if declaration belongs to user
    if (declaration.industryId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if declaration is approved
    if (declaration.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Certificate can only be generated for approved declarations'
      });
    }

    // Return certificate data (frontend will generate PDF)
    const certificateData = {
      trackingId: declaration.trackingId,
      companyName: declaration.industryId.companyName,
      industryType: declaration.industryId.industryType,
      declarationPeriod: declaration.declarationPeriod,
      totalWaste: declaration.totalWasteGenerated,
      wasteCategories: declaration.wasteCategories,
      compliance: declaration.compliance,
      approvedAt: declaration.approvedAt,
      generatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      data: certificateData
    });

  } catch (error) {
    console.error('Generate Certificate Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating certificate',
      error: error.message
    });
  }
};

// @desc    Delete declaration (only if draft)
// @route   DELETE /api/industry/waste/:id
// @access  Private (Industry only)
const deleteDeclaration = async (req, res) => {
  try {
    const declaration = await IndustryWaste.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Declaration not found'
      });
    }

    // Check ownership
    if (declaration.industryId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Can only delete drafts
    if (declaration.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft declarations can be deleted'
      });
    }

    await declaration.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Declaration deleted successfully'
    });

  } catch (error) {
    console.error('Delete Declaration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting declaration',
      error: error.message
    });
  }
};

module.exports = {
  submitWasteDeclaration,
  getMyDeclarations,
  trackWaste,
  getIndustryStats,
  generateCertificate,
  deleteDeclaration
};