// routes/dmr.js
const express = require('express');
const router = express.Router();
const MonthlySale = require('../models/DMR');
const StockReport = require('../models/StockReport');

// Get current month and year
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
};

// Save or update monthly sale report
router.post('/monthly-sale', async (req, res) => {
  try {
    const { month, year } = getCurrentMonthYear();
    const { distributorId, ...reportData } = req.body;

    let report = await MonthlySale.findOne({
      distributor: distributorId,
      month,
      year
    });

    if (report && report.status === 'submitted') {
      return res.status(400).json({ 
        success: false,
        message: 'Report already submitted for this month' 
      });
    }

    if (report) {
      report = await MonthlySale.findByIdAndUpdate(report._id, reportData, { new: true });
    } else {
      report = new MonthlySale({
        distributor: distributorId,
        month,
        year,
        ...reportData
      });
      await report.save();
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit monthly sale report
router.post('/monthly-sale/submit', async (req, res) => {
  try {
    const { month, year } = getCurrentMonthYear();
    const { distributorId } = req.body;

    const report = await MonthlySale.findOne({
      distributor: distributorId,
      month,
      year
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = 'submitted';
    await report.save();

    res.json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save or update stock report
router.post('/stock-report', async (req, res) => {
  try {
    const { month, year } = getCurrentMonthYear();
    const { distributorId, stockItems } = req.body;

    let report = await StockReport.findOne({
      distributor: distributorId,
      month,
      year
    });

    if (report && report.status === 'submitted') {
      return res.status(400).json({ 
        success: false,
        message: 'Report already submitted for this month' 
      });
    }

    if (report) {
      report = await StockReport.findByIdAndUpdate(
        report._id, 
        { stockItems }, 
        { new: true }
      );
    } else {
      report = new StockReport({
        distributor: distributorId,
        month,
        year,
        stockItems
      });
      await report.save();
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit stock report
router.post('/stock-report/submit', async (req, res) => {
  try {
    const { month, year } = getCurrentMonthYear();
    const { distributorId } = req.body;

    const report = await StockReport.findOne({
      distributor: distributorId,
      month,
      year
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = 'submitted';
    await report.save();

    res.json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get distributor's current reports
router.get('/my-reports/:distributorId', async (req, res) => {
  try {
    const { distributorId } = req.params;
    const { month, year } = getCurrentMonthYear();

    const [monthlySale, stockReport] = await Promise.all([
      MonthlySale.findOne({ distributor: distributorId, month, year }),
      StockReport.findOne({ distributor: distributorId, month, year })
    ]);

    res.json({ success: true, data: { monthlySale, stockReport } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin - Get all reports
router.get('/admin/reports', async (req, res) => {
  try {
    const { month, year } = req.query;

    const filter = {};
    if (month && year) {
      filter.month = parseInt(month);
      filter.year = parseInt(year);
    }

    const [monthlySales, stockReports] = await Promise.all([
      MonthlySale.find(filter).populate('distributor', 'name businessName mobile'),
      StockReport.find(filter).populate('distributor', 'name businessName mobile')
    ]);

    res.json({ success: true, data: { monthlySales, stockReports } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;