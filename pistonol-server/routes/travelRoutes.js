const express = require('express');
const router = express.Router();
const Travel = require('../models/travelModel');
const mongoose = require('mongoose');
const User = require('../models/User');

// Helper: Get today's date without time
const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Helper: Check if date is today
const isToday = (date) => {
  if (!date) return false;
  const today = getTodayDate();
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);
  return today.getTime() === inputDate.getTime();
};

// 1. Add/Update travel for today (User)
router.post('/add', async (req, res) => {
  try {
    const { userId, distance } = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    if (!distance || distance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid distance (greater than 0)'
      });
    }

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get today's date range
    const today = getTodayDate();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find or create today's entry
    let travelEntry = await Travel.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (travelEntry) {
      // Update existing entry
      travelEntry.distance = parseFloat(distance);
      travelEntry.updatedAt = new Date();
      await travelEntry.save();
    } else {
      // Create new entry
      travelEntry = new Travel({
        userId,
        distance: parseFloat(distance),
        date: new Date()
      });
      await travelEntry.save();
    }

    res.json({
      success: true,
      message: 'Travel distance saved successfully',
      data: travelEntry
    });

  } catch (error) {
    console.error('Travel add error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// 2. Get user's today travel (User)
router.get('/today/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Get today's date range
    const today = getTodayDate();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's travel
    const travel = await Travel.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    // If no travel found for today, return empty
    if (!travel) {
      return res.json({
        success: true,
        isToday: true,
        data: null
      });
    }

    res.json({
      success: true,
      isToday: true,
      data: travel
    });

  } catch (error) {
    console.error('Error fetching today travel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// 3. Get user's travel history with pagination (User)
router.get('/user-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { userId };
    
    // Date filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Get total count
    const total = await Travel.countDocuments(query);
    
    // Get paginated data
    const travels = await Travel.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get today's date for comparison
    const today = getTodayDate();

    res.json({
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      data: travels.map(travel => ({
        ...travel.toObject(),
        canEdit: isToday(travel.date) // Check if this entry is from today
      }))
    });

  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// 4. Edit travel entry (only if it's today)
router.put('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { distance } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid travel ID'
      });
    }

    if (!distance || distance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid distance'
      });
    }

    // Find the travel entry
    const travelEntry = await Travel.findById(id);
    
    if (!travelEntry) {
      return res.status(404).json({
        success: false,
        message: 'Travel entry not found'
      });
    }

    // Check if this entry is from today
    if (!isToday(travelEntry.date)) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit today\'s travel entry'
      });
    }

    // Update the entry
    travelEntry.distance = parseFloat(distance);
    travelEntry.updatedAt = new Date();
    await travelEntry.save();

    res.json({
      success: true,
      message: 'Travel entry updated successfully',
      data: travelEntry
    });

  } catch (error) {
    console.error('Error editing travel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// 5. Get user statistics
router.get('/user-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const today = getTodayDate();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's travel
    const todayTravel = await Travel.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    // Get total stats
    const totalStats = await Travel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distance' },
          totalEntries: { $sum: 1 }
        }
      }
    ]);

    // Get this week stats (last 7 days)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStats = await Travel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: weekStart }
        }
      },
      {
        $group: {
          _id: null,
          weekDistance: { $sum: '$distance' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        todayDistance: todayTravel?.distance || 0,
        totalDistance: totalStats[0]?.totalDistance || 0,
        totalEntries: totalStats[0]?.totalEntries || 0,
        weekDistance: weekStats[0]?.weekDistance || 0
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});











// 4. Admin: Get all travels with pagination, filters, search
router.get('/admin/all', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      startDate, 
      endDate,
      minDistance,
      maxDistance,
      userId,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};
    let userQuery = {};

    // Search by username, name, mobile
    if (search) {
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      query.userId = { $in: userIds };
    }

    // Filter by specific user
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Distance filter
    if (minDistance || maxDistance) {
      query.distance = {};
      if (minDistance) query.distance.$gte = parseFloat(minDistance);
      if (maxDistance) query.distance.$lte = parseFloat(maxDistance);
    }

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await Travel.countDocuments(query);
    
    // Get paginated data with user details
    const travels = await Travel.find(query)
      .populate('userId', 'username name mobile email role')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get summary statistics
    const stats = await Travel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distance' },
          averageDistance: { $avg: '$distance' },
          totalRecords: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      stats: stats[0] || {
        totalDistance: 0,
        averageDistance: 0,
        totalRecords: 0
      },
      filters: {
        search,
        startDate,
        endDate,
        minDistance,
        maxDistance,
        userId
      },
      data: travels
    });

  } catch (error) {
    console.error('Error fetching admin data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// 5. Admin: Get today's summary
router.get('/admin/today-summary', async (req, res) => {
  try {
    // Get today's date range
    const today = getTodayDate();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query = {
      date: { $gte: today, $lt: tomorrow }
    };

    // Get summary for today
    const summary = await Travel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalUsers: { $addToSet: '$userId' },
          totalDistance: { $sum: '$distance' },
          averageDistance: { $avg: '$distance' }
        }
      },
      {
        $project: {
          totalUsers: { $size: '$totalUsers' },
          totalDistance: 1,
          averageDistance: { $round: ['$averageDistance', 2] }
        }
      }
    ]);

    // Get latest travels
    const latestTravels = await Travel.find(query)
      .populate('userId', 'username name')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      summary: summary[0] || {
        totalUsers: 0,
        totalDistance: 0,
        averageDistance: 0
      },
      latestTravels
    });

  } catch (error) {
    console.error('Error fetching today summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

 
// 7. Delete travel (Admin only - optional)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid travel ID'
      });
    }

    const deleted = await Travel.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Travel record not found'
      });
    }

    res.json({
      success: true,
      message: 'Travel record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting travel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


















module.exports = router;