// routes/leaves.js
const express = require('express');
const router = express.Router();
const Leave = require('../../models/Leave');
const User = require('../../models/User');
 

// Get all leave requests with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    let filter = {};
    
    // Search by employee name
   


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
      filter.startDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    const leaves = await Leave.find(filter)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalCount = await Leave.countDocuments(filter);
    
    res.json({
      leaves,
      currentPage: page,
      perPage: limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve a leave request
router.put('/:id/approve', async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    leave.status = 'approved';
  
    await leave.save();
    
    // Populate user data before sending response
    await leave.populate('user', 'name email avatar');
    
    res.json(leave);
  } catch (error) {
    console.error('Error approving leave:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject a leave request
router.put('/:id/reject', async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    leave.status = 'rejected';
 
    await leave.save();
    
    // Populate user data before sending response
    await leave.populate('user', 'name email avatar');
    
    res.json(leave);
  } catch (error) {
    console.error('Error rejecting leave:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;