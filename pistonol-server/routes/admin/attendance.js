// routes/attendance.js
const express = require('express');
const router = express.Router();
const Attendance = require('../../models/Attandance');
const User = require('../../models/User');


// Get all attendance records with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    let filter = {};
    
    // Search by employee name or store name
   







  if (req.query.search) {
      // पहले users को searcatth करें जो search term match करते हैं
      const users = await User.find({
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
       
          { email: { $regex: req.query.search, $options: 'i' } }
        ]
      }).select('_id');
      
      // User IDs array बनाएं
      const userIds = users.map(user => user._id);
      
      // Attendance में filter लगाएं
      filter.user = { $in: userIds };
    }





    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter['checkIn.time'] = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    const attendance = await Attendance.find(filter)
      .populate('user', 'name email avatar')
      .populate('store', 'name address')
      .sort({ 'checkIn.time': -1 })
      .skip(skip)
      .limit(limit);
    
    const totalCount = await Attendance.countDocuments(filter);
    
    res.json({
      attendance,
      currentPage: page,
      perPage: limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;