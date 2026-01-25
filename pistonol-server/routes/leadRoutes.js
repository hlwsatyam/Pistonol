const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController.js');
const Lead = require('../models/Lead.js');
const { default: mongoose } = require('mongoose');

router.post('/', leadController.createLead);
router.get('/', leadController.getUserLeads);
router.get('/analytics/:id', leadController.getLeadAnalytics);





router.get('/:id', leadController.getLeadById);
router.put('/:id', leadController.updateLead);
router.post('/:id/feedbacks', leadController.addFeedback);
router.put('/:leadId/feedbacks/:feedbackId', leadController.updateFeedback);







// Get all leads with pagination and filtering
router.get('/all/lead/list',    async (req, res) => {
    
 
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
   
    // Build filter object
    const filter = {   };

if (req.query.id){
  filter.createdBy=req.query.id
}
 


if (req.query.getOrderSeparate === "true") {
  filter.$expr = {
    $gt: [{ $strLenCP: { $trim: { input: "$servicesOffered" } } }, 0]
  };
}



    if (req.query.status) filter.status = req.query.status;
    if (req.query.state) filter.state = req.query.state;
    if (req.query.city) filter.city = req.query.city;
    if (req.query.search) {
      filter.$or = [
        { garageName: { $regex: req.query.search, $options: 'i' } },
        { contactName: { $regex: req.query.search, $options: 'i' } },
        { mobile: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');
    
    const total = await Lead.countDocuments(filter);
    
    res.json({
      leads,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLeads: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});







router.get('/stats/by/all', async (req, res) => {
  try {
    const { 
      status, 
      state, 
      city, 
      startDate, 
      endDate, 
      timePeriod = 'monthly' 
    } = req.query;

    // Build match query
    const matchQuery = {};
    
    if (status) matchQuery.status = status;
    if (state) matchQuery.state = state;
    if (city) matchQuery.city = city;
    
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Total leads
    const totalLeads = await Lead.countDocuments(matchQuery);

    // Status distribution
    const statusDistribution = await Lead.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // State distribution
    const stateDistribution = await Lead.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // City distribution
    const cityDistribution = await Lead.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Time series data based on timePeriod
    let groupByFormat = {};
    switch (timePeriod) {
      case 'daily':
        groupByFormat = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        };
        break;
      case 'weekly':
        groupByFormat = {
          $dateToString: { format: '%Y-%U', date: '$createdAt' }
        };
        break;
      case 'monthly':
        groupByFormat = {
          $dateToString: { format: '%Y-%m', date: '$createdAt' }
        };
        break;
      case 'yearly':
        groupByFormat = {
          $dateToString: { format: '%Y', date: '$createdAt' }
        };
        break;
      default:
        groupByFormat = {
          $dateToString: { format: '%Y-%m', date: '$createdAt' }
        };
    }

    const timeSeries = await Lead.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupByFormat,
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get qualified and lost leads count
    const qualifiedLeads = await Lead.countDocuments({
      ...matchQuery,
      status: 'Qualified'
    });

    const lostLeads = await Lead.countDocuments({
      ...matchQuery,
      status: 'Lost'
    });

    // Get new leads this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newLeadsThisMonth = await Lead.countDocuments({
      ...matchQuery,
      status: 'New',
      createdAt: { $gte: startOfMonth }
    });

    // Get today's new leads
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const newLeadsToday = await Lead.countDocuments({
      ...matchQuery,
      status: 'New',
      createdAt: { $gte: startOfToday }
    });

    // Calculate rates
    const conversionRate = totalLeads > 0 
      ? ((qualifiedLeads / totalLeads) * 100).toFixed(1)
      : 0;

    const contactRate = totalLeads > 0
      ? ((statusDistribution.find(s => s._id === 'Contacted')?.count || 0) / totalLeads * 100).toFixed(1)
      : 0;

    const qualificationRate = statusDistribution.find(s => s._id === 'Contacted')?.count > 0
      ? (qualifiedLeads / statusDistribution.find(s => s._id === 'Contacted')?.count * 100).toFixed(1)
      : 0;

    const lossRate = totalLeads > 0
      ? ((lostLeads / totalLeads) * 100).toFixed(1)
      : 0;

    // Calculate average daily leads
    const dateRangeDays = startDate && endDate 
      ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
      : 30; // Default to 30 days

    const avgDailyLeads = (totalLeads / dateRangeDays).toFixed(1);

    // Get unique states and cities for filter dropdowns
    const states = await Lead.distinct('state', matchQuery).then(states => 
      states.filter(Boolean).map(state => ({ _id: state }))
    );

    const cities = await Lead.distinct('city', matchQuery).then(cities => 
      cities.filter(Boolean).map(city => ({ _id: city }))
    );

    res.json({
      success: true,
      totalLeads,
      statusDistribution,
      stateDistribution,
      cityDistribution,
      timeSeries,
      qualifiedLeads,
      lostLeads,
      newLeadsThisMonth,
      newLeadsToday,
      conversionRate: parseFloat(conversionRate),
      contactRate: parseFloat(contactRate),
      qualificationRate: parseFloat(qualificationRate),
      lossRate: parseFloat(lossRate),
      avgDailyLeads: parseFloat(avgDailyLeads),
      avgLeadValue: 75, // Placeholder - you can calculate based on your business logic
      avgResponseTime: 24, // Placeholder - you can calculate from feedback timestamps
      states,
      cities
    });

  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Optional: Get lead growth over time
router.get('/growth', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = {};
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const growthData = await Lead.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          qualified: {
            $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      growthData
    });
  } catch (error) {
    console.error('Error fetching growth data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching growth data'
    });
  }
});











// Get single lead
router.get('/single/:id',   async (req, res) => {
  try {
    const lead = await Lead.findOne({ 
      _id: req.params.id, 
      createdBy: req.user.id 
    }).populate('createdBy', 'name email');
    
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new lead
router.post('/all/lead/list',   async (req, res) => {
  try {
    const lead = new Lead({
      ...req.body,
      
    });
    
    const savedLead = await lead.save();
    await savedLead.populate('createdBy', 'name email');
    
    res.status(201).json(savedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update lead
router.put('/all/lead/list/:id',  async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete lead
router.delete('/all/lead/list/:id',    async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ 
      _id: req.params.id, 
     
    });
    
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add feedback to lead
router.post('/all/:id/feedback',  async (req, res) => {
  try {
    const lead = await Lead.findOne({ 
      _id: req.params.id, 
      createdBy: req.user.id 
    });
    
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    lead.feedbacks.push({
      message: req.body.message,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    lead.updatedAt = Date.now();
    await lead.save();
    await lead.populate('createdBy', 'name email');
    
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});











router.get('/aa/bb/cc/stats/:id',  async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(req.query)
    // Get total leads count
    const totalLeads = await Lead.countDocuments({ createdBy: userId });
    console.log(totalLeads)
    // Get leads by status
    const leadsByStatus = await Lead.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get leads by state
    const leadsByState = await Lead.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId), state: { $exists: true, $ne: '' } } },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get monthly leads data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyLeads = await Lead.aggregate([
      { 
        $match: { 
          createdBy: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Format monthly data for frontend
    const formattedMonthlyData = monthlyLeads.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      count: item.count
    }));
    
    // Get recent leads
    const recentLeads = await Lead.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name email');
    
    res.json({
      totalLeads,
      leadsByStatus,
      leadsByState,
      monthlyLeads: formattedMonthlyData,
      recentLeads
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
});

// Get leads conversion rate over time
router.get('/aa/bb/cc/conversion/:id', async (req, res) => {
  try {
   const userId = req.params.id;
    
    // Get conversion rate by month
    const conversionData = await Lead.aggregate([
      { 
        $match: { 
          createdBy:new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Format conversion data
    const formattedConversionData = [];
    const monthsSet = new Set();
    
    conversionData.forEach(item => {
      const monthKey = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
      monthsSet.add(monthKey);
      
      if (!formattedConversionData[monthKey]) {
        formattedConversionData[monthKey] = {};
      }
      
      formattedConversionData[monthKey][item._id.status] = item.count;
    });
    
    // Calculate conversion rates
    const conversionRates = Array.from(monthsSet).map(month => {
      const monthData = formattedConversionData[month] || {};
      const total = Object.values(monthData).reduce((sum, count) => sum + count, 0);
      const qualified = monthData.Qualified || 0;
      const conversionRate = total > 0 ? (qualified / total) * 100 : 0;
      
      return {
        month,
        conversionRate: Math.round(conversionRate * 100) / 100,
        total,
        qualified
      };
    });
    
    res.json(conversionRates);
  } catch (error) {
      console.log(error)
    res.status(500).json({ message: error.message });
  }
});




module.exports = router;