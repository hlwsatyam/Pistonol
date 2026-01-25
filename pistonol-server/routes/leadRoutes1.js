const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');

// Get all leads with pagination and filtering (ADMIN)
router.get('/admin/leads', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
console.log(req.query)
    // Date filter
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      filter.createdAt = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      filter.createdAt = { $lte: new Date(req.query.endDate) };
    }


if (req.query.isOnlyServiceOffer === "true") {
  filter.$expr = {
    $gt: [{ $strLenCP: { $trim: { input: "$servicesOffered" } } }, 0]
  };
}




    // Other filters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.state) filter.state = { $regex: req.query.state, $options: 'i' };
    if (req.query.city) filter.city = { $regex: req.query.city, $options: 'i' };
    
    // Search filter
    if (req.query.search) {
      filter.$or = [
        { garageName: { $regex: req.query.search, $options: 'i' } },
        { contactName: { $regex: req.query.search, $options: 'i' } },
        { city: { $regex: req.query.search, $options: 'i' } },
        { mobile: { $regex: req.query.search, $options: 'i' } },
        { businessCardNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get total count
    const totalLeads = await Lead.countDocuments(filter);

    // Get paginated leads
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email phone');

    res.json({
      success: true,
      leads,
      currentPage: page,
      totalPages: Math.ceil(totalLeads / limit),
      totalLeads
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads'
    });
  }
});

// Get lead statistics (ADMIN)
router.get('/admin/stats', async (req, res) => {
  try {
    // Build match query based on filters
    const matchQuery = {};
    
    // Date filter
    if (req.query.startDate && req.query.endDate) {
      matchQuery.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    if (req.query.state) matchQuery.state = req.query.state;
    if (req.query.city) matchQuery.city = req.query.city;
    if (req.query.status) matchQuery.status = req.query.status;

    // Total leads
    const totalLeads = await Lead.countDocuments(matchQuery);

    // Today's leads
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todaysLeads = await Lead.countDocuments({
      ...matchQuery,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    // This week's leads
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekLeads = await Lead.countDocuments({
      ...matchQuery,
      createdAt: { $gte: weekStart, $lte: todayEnd }
    });

    // This month's leads
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const thisMonthLeads = await Lead.countDocuments({
      ...matchQuery,
      createdAt: { $gte: monthStart, $lte: todayEnd }
    });

    // Status distribution
    const statusDistribution = await Lead.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // State distribution (top 10)
    const stateDistribution = await Lead.aggregate([
      { $match: { ...matchQuery, state: { $exists: true, $ne: '' } } },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // City distribution (top 10)
    const cityDistribution = await Lead.aggregate([
      { $match: { ...matchQuery, city: { $exists: true, $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await Lead.aggregate([
      { 
        $match: { 
          ...matchQuery,
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

    // Format monthly trend
    const formattedMonthlyTrend = monthlyTrend.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      count: item.count
    }));

    // Daily trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const dailyTrend = await Lead.aggregate([
      { 
        $match: { 
          ...matchQuery,
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Format daily trend
    const formattedDailyTrend = dailyTrend.map(item => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
      count: item.count
    }));

    // Get conversion rate
    const qualifiedLeads = await Lead.countDocuments({
      ...matchQuery,
      status: 'Qualified'
    });

    const conversionRate = totalLeads > 0 
      ? ((qualifiedLeads / totalLeads) * 100).toFixed(2)
      : 0;

    // Get unique states and cities for filter dropdowns
    const states = await Lead.distinct('state', matchQuery).then(states => 
      states.filter(Boolean).sort()
    );

    const cities = await Lead.distinct('city', matchQuery).then(cities => 
      cities.filter(Boolean).sort()
    );

    res.json({
      success: true,
      stats: {
        totalLeads,
        todaysLeads,
        thisWeekLeads,
        thisMonthLeads,
        conversionRate: parseFloat(conversionRate),
        qualifiedLeads
      },
      distributions: {
        status: statusDistribution,
        state: stateDistribution,
        city: cityDistribution
      },
      trends: {
        monthly: formattedMonthlyTrend,
        daily: formattedDailyTrend
      },
      filters: {
        states,
        cities
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Export leads to Excel (ADMIN)
router.get('/admin/export', async (req, res) => {
  try {
    // Build filter object (same as leads endpoint)
    const filter = {};

    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.state) filter.state = { $regex: req.query.state, $options: 'i' };
    if (req.query.city) filter.city = { $regex: req.query.city, $options: 'i' };
    
    if (req.query.search) {
      filter.$or = [
        { garageName: { $regex: req.query.search, $options: 'i' } },
        { contactName: { $regex: req.query.search, $options: 'i' } },
        { mobile: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get all leads matching filter
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Garage Name', key: 'garageName', width: 30 },
      { header: 'Contact Name', key: 'contactName', width: 25 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Business Card', key: 'businessCardNumber', width: 20 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'State', key: 'state', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Pincode', key: 'pincode', width: 10 },
      { header: 'Services Offered', key: 'servicesOffered', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created By', key: 'createdBy', width: 25 },
      { header: 'Created Date', key: 'createdAt', width: 20 },
      { header: 'Latitude', key: 'latitude', width: 12 },
      { header: 'Longitude', key: 'longitude', width: 12 }
    ];

    // Add data rows
    leads.forEach(lead => {
      worksheet.addRow({
        id: lead._id.toString(),
        garageName: lead.garageName || '',
        contactName: lead.contactName || '',
        mobile: lead.mobile || '',
        businessCardNumber: lead.businessCardNumber || '',
        address: lead.address || '',
        state: lead.state || '',
        city: lead.city || '',
        pincode: lead.pincode || '',
        servicesOffered: lead.servicesOffered || '',
        status: lead.status || '',
        createdBy: lead.createdBy ? `${lead.createdBy.name} (${lead.createdBy.email})` : '',
        createdAt: lead.createdAt.toLocaleString(),
        latitude: lead.currentLocation?.latitude || '',
        longitude: lead.currentLocation?.longitude || ''
      });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Set response headers for Excel file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=leads_export_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting leads'
    });
  }
});

// Get single lead details (ADMIN)
router.get('/admin/leads/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('createdBy', 'name email phone role')
  

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead details'
    });
  }
});

module.exports = router;