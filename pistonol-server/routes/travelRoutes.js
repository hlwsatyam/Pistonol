// const express = require('express');
// const router = express.Router();
// const Travel = require('../models/travelModel');
// const mongoose = require('mongoose');
// const User = require('../models/User');

// // Helper: Get today's date without time
// const getTodayDate = () => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   return today;
// };

// // Helper: Check if date is today
// const isToday = (date) => {
//   if (!date) return false;
//   const today = getTodayDate();
//   const inputDate = new Date(date);
//   inputDate.setHours(0, 0, 0, 0);
//   return today.getTime() === inputDate.getTime();
// };

// // 1. Add/Update travel for today (User)
// router.post('/add', async (req, res) => {
//   try {
//     const { userId, distance } = req.body;
    
//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid user ID'
//       });
//     }
    
//     if (!distance || distance <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide valid distance (greater than 0)'
//       });
//     }

//     // Check if user exists
//     const userExists = await User.findById(userId);
//     if (!userExists) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Get today's date range
//     const today = getTodayDate();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Find or create today's entry
//     let travelEntry = await Travel.findOne({
//       userId,
//       date: { $gte: today, $lt: tomorrow }
//     });

//     if (travelEntry) {
//       // Update existing entry
//       travelEntry.distance = parseFloat(distance);
//       travelEntry.updatedAt = new Date();
//       await travelEntry.save();
//     } else {
//       // Create new entry
//       travelEntry = new Travel({
//         userId,
//         distance: parseFloat(distance),
//         date: new Date()
//       });
//       await travelEntry.save();
//     }

//     res.json({
//       success: true,
//       message: 'Travel distance saved successfully',
//       data: travelEntry
//     });

//   } catch (error) {
//     console.error('Travel add error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // 2. Get user's today travel (User)
// router.get('/today/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
    
//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid user ID'
//       });
//     }

//     // Get today's date range
//     const today = getTodayDate();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Find today's travel
//     const travel = await Travel.findOne({
//       userId,
//       date: { $gte: today, $lt: tomorrow }
//     });

//     // If no travel found for today, return empty
//     if (!travel) {
//       return res.json({
//         success: true,
//         isToday: true,
//         data: null
//       });
//     }

//     res.json({
//       success: true,
//       isToday: true,
//       data: travel
//     });

//   } catch (error) {
//     console.error('Error fetching today travel:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // 3. Get user's travel history with pagination (User)
// router.get('/user-history/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1, limit = 10, startDate, endDate } = req.query;
    
//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid user ID'
//       });
//     }

//     // Pagination
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const skip = (pageNum - 1) * limitNum;

//     // Build query
//     let query = { userId };
    
//     // Date filter
//     if (startDate || endDate) {
//       query.date = {};
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         query.date.$gte = start;
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         query.date.$lte = end;
//       }
//     }

//     // Get total count
//     const total = await Travel.countDocuments(query);
    
//     // Get paginated data
//     const travels = await Travel.find(query)
//       .sort({ date: -1 })
//       .skip(skip)
//       .limit(limitNum);

//     // Get today's date for comparison
//     const today = getTodayDate();

//     res.json({
//       success: true,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total,
//         pages: Math.ceil(total / limitNum)
//       },
//       data: travels.map(travel => ({
//         ...travel.toObject(),
//         canEdit: isToday(travel.date) // Check if this entry is from today
//       }))
//     });

//   } catch (error) {
//     console.error('Error fetching user history:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // 4. Edit travel entry (only if it's today)
// router.put('/edit/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { distance } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid travel ID'
//       });
//     }

//     if (!distance || distance <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide valid distance'
//       });
//     }

//     // Find the travel entry
//     const travelEntry = await Travel.findById(id);
    
//     if (!travelEntry) {
//       return res.status(404).json({
//         success: false,
//         message: 'Travel entry not found'
//       });
//     }

//     // Check if this entry is from today
//     if (!isToday(travelEntry.date)) {
//       return res.status(403).json({
//         success: false,
//         message: 'You can only edit today\'s travel entry'
//       });
//     }

//     // Update the entry
//     travelEntry.distance = parseFloat(distance);
//     travelEntry.updatedAt = new Date();
//     await travelEntry.save();

//     res.json({
//       success: true,
//       message: 'Travel entry updated successfully',
//       data: travelEntry
//     });

//   } catch (error) {
//     console.error('Error editing travel:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // 5. Get user statistics
// router.get('/user-stats/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
    
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid user ID'
//       });
//     }

//     const today = getTodayDate();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Get today's travel
//     const todayTravel = await Travel.findOne({
//       userId,
//       date: { $gte: today, $lt: tomorrow }
//     });

//     // Get total stats
//     const totalStats = await Travel.aggregate([
//       { $match: { userId: new mongoose.Types.ObjectId(userId) } },
//       {
//         $group: {
//           _id: null,
//           totalDistance: { $sum: '$distance' },
//           totalEntries: { $sum: 1 }
//         }
//       }
//     ]);

//     // Get this week stats (last 7 days)
//     const weekStart = new Date();
//     weekStart.setDate(weekStart.getDate() - 7);
//     const weekStats = await Travel.aggregate([
//       {
//         $match: {
//           userId: new mongoose.Types.ObjectId(userId),
//           date: { $gte: weekStart }
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           weekDistance: { $sum: '$distance' }
//         }
//       }
//     ]);

//     res.json({
//       success: true,
//       stats: {
//         todayDistance: todayTravel?.distance || 0,
//         totalDistance: totalStats[0]?.totalDistance || 0,
//         totalEntries: totalStats[0]?.totalEntries || 0,
//         weekDistance: weekStats[0]?.weekDistance || 0
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching user stats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });











// // 4. Admin: Get all travels with pagination, filters, search
// router.get('/admin/all', async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 20, 
//       search, 
//       startDate, 
//       endDate,
//       minDistance,
//       maxDistance,
//       userId,
//       sortBy = 'date',
//       sortOrder = 'desc'
//     } = req.query;

//     // Pagination
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const skip = (pageNum - 1) * limitNum;

//     // Build query
//     let query = {};
//     let userQuery = {};

//     // Search by username, name, mobile
//     if (search) {
//       const users = await User.find({
//         $or: [
//           { username: { $regex: search, $options: 'i' } },
//           { name: { $regex: search, $options: 'i' } },
//           { mobile: { $regex: search, $options: 'i' } }
//         ]
//       }).select('_id');
      
//       const userIds = users.map(user => user._id);
//       query.userId = { $in: userIds };
//     }

//     // Filter by specific user
//     if (userId && mongoose.Types.ObjectId.isValid(userId)) {
//       query.userId = userId;
//     }

//     // Date range filter
//     if (startDate || endDate) {
//       query.date = {};
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         query.date.$gte = start;
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         query.date.$lte = end;
//       }
//     }

//     // Distance filter
//     if (minDistance || maxDistance) {
//       query.distance = {};
//       if (minDistance) query.distance.$gte = parseFloat(minDistance);
//       if (maxDistance) query.distance.$lte = parseFloat(maxDistance);
//     }

//     // Sort
//     const sort = {};
//     sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

//     // Get total count
//     const total = await Travel.countDocuments(query);
    
//     // Get paginated data with user details
//     const travels = await Travel.find(query)
//       .populate('userId', 'username name mobile email role')
//       .sort(sort)
//       .skip(skip)
//       .limit(limitNum);

//     // Get summary statistics
//     const stats = await Travel.aggregate([
//       { $match: query },
//       {
//         $group: {
//           _id: null,
//           totalDistance: { $sum: '$distance' },
//           averageDistance: { $avg: '$distance' },
//           totalRecords: { $sum: 1 }
//         }
//       }
//     ]);

//     res.json({
//       success: true,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total,
//         pages: Math.ceil(total / limitNum)
//       },
//       stats: stats[0] || {
//         totalDistance: 0,
//         averageDistance: 0,
//         totalRecords: 0
//       },
//       filters: {
//         search,
//         startDate,
//         endDate,
//         minDistance,
//         maxDistance,
//         userId
//       },
//       data: travels
//     });

//   } catch (error) {
//     console.error('Error fetching admin data:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // 5. Admin: Get today's summary
// router.get('/admin/today-summary', async (req, res) => {
//   try {
//     // Get today's date range
//     const today = getTodayDate();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     const query = {
//       date: { $gte: today, $lt: tomorrow }
//     };

//     // Get summary for today
//     const summary = await Travel.aggregate([
//       { $match: query },
//       {
//         $group: {
//           _id: null,
//           totalUsers: { $addToSet: '$userId' },
//           totalDistance: { $sum: '$distance' },
//           averageDistance: { $avg: '$distance' }
//         }
//       },
//       {
//         $project: {
//           totalUsers: { $size: '$totalUsers' },
//           totalDistance: 1,
//           averageDistance: { $round: ['$averageDistance', 2] }
//         }
//       }
//     ]);

//     // Get latest travels
//     const latestTravels = await Travel.find(query)
//       .populate('userId', 'username name')
//       .sort({ updatedAt: -1 })
//       .limit(10);

//     res.json({
//       success: true,
//       summary: summary[0] || {
//         totalUsers: 0,
//         totalDistance: 0,
//         averageDistance: 0
//       },
//       latestTravels
//     });

//   } catch (error) {
//     console.error('Error fetching today summary:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

 
// // 7. Delete travel (Admin only - optional)
// router.delete('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid travel ID'
//       });
//     }

//     const deleted = await Travel.findByIdAndDelete(id);
    
//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message: 'Travel record not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Travel record deleted successfully'
//     });

//   } catch (error) {
//     console.error('Error deleting travel:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });


















// module.exports = router;










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

// Helper: Get month start and end dates
const getMonthRange = (year, month) => {
  const y = year || new Date().getFullYear();
  const m = month || new Date().getMonth() + 1;
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
};

// Helper: Calculate total travel (Out - In)
const calculateTotalTravel = (inDist, outDist) => {
  return Math.max(0, (outDist || 0) - (inDist || 0));
};

// 1. Add/Update distance (User)
router.post('/add-distance', async (req, res) => {
  try {
    const { userId, distance, type, notes } = req.body; // type = 'in' or 'out'
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    if (distance === undefined || distance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid distance (0 or greater)'
      });
    }

    if (!['in', 'out'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Use "in" or "out"'
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

    // Find today's entry
    let travelEntry = await Travel.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!travelEntry) {
      // Create new entry for today
      travelEntry = new Travel({
        userId,
        date: new Date()
      });
    }

    // Check if already entered
    if (type === 'in' && travelEntry.inEntered) {
      return res.status(400).json({
        success: false,
        message: 'Distance In already entered for today'
      });
    }

    if (type === 'out' && travelEntry.outEntered) {
      return res.status(400).json({
        success: false,
        message: 'Distance Out already entered for today'
      });
    }

    // Update the appropriate distance
    if (type === 'in') {
      travelEntry.distanceIn = parseFloat(distance);
      travelEntry.inEntered = true;
    } else {
      travelEntry.distanceOut = parseFloat(distance);
      travelEntry.outEntered = true;
    }

    // Add notes if provided
    if (notes && notes.trim()) {
      travelEntry.notes = notes.trim();
    }

    // Save will automatically calculate totalDistance (Out - In)
    await travelEntry.save();

    res.json({
      success: true,
      message: `Distance ${type === 'in' ? 'In' : 'Out'} saved successfully`,
      data: {
        ...travelEntry.toObject(),
        totalTravel: travelEntry.totalDistance // Explicitly show total travel
      }
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

    const defaultData = {
      distanceIn: 0,
      distanceOut: 0,
      totalDistance: 0,
      inEntered: false,
      outEntered: false,
      travelCompleted: false,
      notes: ''
    };

    res.json({
      success: true,
      data: travel ? {
        ...travel.toObject(),
        // Calculate real-time total for safety
        calculatedTotal: calculateTotalTravel(travel.distanceIn, travel.distanceOut)
      } : defaultData
    });

  } catch (error) {
    console.error('Error fetching today travel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// 3. Get user's detailed monthly summary (User)
router.get('/monthly-summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const currentYear = parseInt(year) || new Date().getFullYear();
    const currentMonth = parseInt(month) || new Date().getMonth() + 1;
    
    const { start, end } = getMonthRange(currentYear, currentMonth);

    // Get all travels for the specified month
    const monthTravels = await Travel.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    // Calculate comprehensive summary
    let totalIn = 0;
    let totalOut = 0;
    let totalTravelDistance = 0;
    let completedDays = 0;
    let maxTravelDay = { date: null, distance: 0 };
    let minTravelDay = { date: null, distance: Infinity };

    const dailyData = monthTravels.map(travel => {
      const dayTravel = {
        date: travel.date,
        day: travel.date.getDate(),
        dayName: travel.date.toLocaleDateString('en-IN', { weekday: 'short' }),
        distanceIn: travel.distanceIn,
        distanceOut: travel.distanceOut,
        totalDistance: travel.totalDistance,
        inEntered: travel.inEntered,
        outEntered: travel.outEntered,
        travelCompleted: travel.travelCompleted,
        notes: travel.notes
      };

      // Update totals
      totalIn += travel.distanceIn;
      totalOut += travel.distanceOut;
      totalTravelDistance += travel.totalDistance;
      
      if (travel.travelCompleted) completedDays++;
      
      // Track max/min travel days
      if (travel.totalDistance > maxTravelDay.distance) {
        maxTravelDay = { date: travel.date, distance: travel.totalDistance };
      }
      if (travel.totalDistance < minTravelDay.distance && travel.travelCompleted) {
        minTravelDay = { date: travel.date, distance: travel.totalDistance };
      }

      return dayTravel;
    });

    // Calculate averages
    const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const averageDailyTravel = completedDays > 0 ? totalTravelDistance / completedDays : 0;
    const completionRate = (completedDays / totalDaysInMonth) * 100;

    // Get today's data separately
    const today = getTodayDate();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTravel = await Travel.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    res.json({
      success: true,
      summary: {
        month: currentMonth,
        year: currentYear,
        monthName: new Date(currentYear, currentMonth - 1, 1).toLocaleDateString('en-IN', { month: 'long' }),
        totalDaysInMonth,
        totalIn,
        totalOut,
        totalTravelDistance,
        netDistance: totalOut - totalIn,
        averageDailyTravel,
        completedDays,
        completionRate,
        maxTravelDay,
        minTravelDay: minTravelDay.distance === Infinity ? null : minTravelDay
      },
      dailyData,
      today: todayTravel || {
        distanceIn: 0,
        distanceOut: 0,
        totalDistance: 0,
        inEntered: false,
        outEntered: false,
        travelCompleted: false,
        notes: ''
      }
    });

  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// 4. Get user's travel history with pagination (User - Read Only)
router.get('/user-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
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

    // Get total count
    const total = await Travel.countDocuments({ userId });
    
    // Get paginated data with sorting by date descending
    const travels = await Travel.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    // Format response data
    const formattedTravels = travels.map(travel => ({
      ...travel.toObject(),
      calculatedTotal: calculateTotalTravel(travel.distanceIn, travel.distanceOut)
    }));

    res.json({
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      data: formattedTravels
    });

  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// 5. Get user's travel statistics (User)
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

    // Get this week's stats (last 7 days)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6); // Last 7 days including today
    weekStart.setHours(0, 0, 0, 0);

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
          totalIn: { $sum: '$distanceIn' },
          totalOut: { $sum: '$distanceOut' },
          totalTravel: { $sum: '$totalDistance' },
          daysCompleted: {
            $sum: { $cond: [{ $and: ['$inEntered', '$outEntered'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get this month's stats
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthStats = await Travel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: null,
          totalIn: { $sum: '$distanceIn' },
          totalOut: { $sum: '$distanceOut' },
          totalTravel: { $sum: '$totalDistance' }
        }
      }
    ]);

    // Get all-time stats
    const allTimeStats = await Travel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalIn: { $sum: '$distanceIn' },
          totalOut: { $sum: '$distanceOut' },
          totalTravel: { $sum: '$totalDistance' },
          totalEntries: { $sum: 1 },
          daysCompleted: {
            $sum: { $cond: [{ $and: ['$inEntered', '$outEntered'] }, 1, 0] }
          }
        }
      }
    ]);

    const todayTotal = todayTravel ? calculateTotalTravel(todayTravel.distanceIn, todayTravel.distanceOut) : 0;
    const weekData = weekStats[0] || { totalIn: 0, totalOut: 0, totalTravel: 0, daysCompleted: 0 };
    const monthData = monthStats[0] || { totalIn: 0, totalOut: 0, totalTravel: 0 };
    const allTimeData = allTimeStats[0] || { totalIn: 0, totalOut: 0, totalTravel: 0, totalEntries: 0, daysCompleted: 0 };

    res.json({
      success: true,
      stats: {
        today: {
          in: todayTravel?.distanceIn || 0,
          out: todayTravel?.distanceOut || 0,
          total: todayTotal,
          completed: todayTravel?.travelCompleted || false
        },
        week: {
          in: weekData.totalIn,
          out: weekData.totalOut,
          total: weekData.totalTravel,
          daysCompleted: weekData.daysCompleted,
          averageDaily: weekData.daysCompleted > 0 ? weekData.totalTravel / weekData.daysCompleted : 0
        },
        month: {
          in: monthData.totalIn,
          out: monthData.totalOut,
          total: monthData.totalTravel,
          net: monthData.totalOut - monthData.totalIn
        },
        allTime: {
          in: allTimeData.totalIn,
          out: allTimeData.totalOut,
          total: allTimeData.totalTravel,
          totalEntries: allTimeData.totalEntries,
          daysCompleted: allTimeData.daysCompleted,
          net: allTimeData.totalOut - allTimeData.totalIn,
          averagePerDay: allTimeData.daysCompleted > 0 ? allTimeData.totalTravel / allTimeData.daysCompleted : 0
        }
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

// 6. Admin: Get all travels (Admin - Read Only)
router.get('/admin/all', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      startDate, 
      endDate,
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
      query.userId = new mongoose.Types.ObjectId(userId);
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

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await Travel.countDocuments(query);
    
    // Get paginated data with user details
    const travels = await Travel.find(query)
      .populate('userId', 'username name mobile email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Format data with calculated totals
    const formattedTravels = travels.map(travel => ({
      ...travel.toObject(),
      calculatedTotal: calculateTotalTravel(travel.distanceIn, travel.distanceOut),
      netDistance: (travel.distanceOut || 0) - (travel.distanceIn || 0)
    }));

    // Get comprehensive statistics
    const stats = await Travel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalDistanceIn: { $sum: '$distanceIn' },
          totalDistanceOut: { $sum: '$distanceOut' },
          totalTravelDistance: { $sum: '$totalDistance' },
          uniqueUsers: { $addToSet: '$userId' },
          completedEntries: {
            $sum: { $cond: [{ $and: ['$inEntered', '$outEntered'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          totalRecords: 1,
          totalDistanceIn: 1,
          totalDistanceOut: 1,
          totalTravelDistance: 1,
          netDistance: { $subtract: ['$totalDistanceOut', '$totalDistanceIn'] },
          uniqueUsersCount: { $size: '$uniqueUsers' },
          completedEntries: 1,
          completionRate: {
            $multiply: [{ $divide: ['$completedEntries', '$totalRecords'] }, 100]
          },
          averageTravelPerEntry: { $divide: ['$totalTravelDistance', '$totalRecords'] }
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
        totalRecords: 0,
        totalDistanceIn: 0,
        totalDistanceOut: 0,
        totalTravelDistance: 0,
        netDistance: 0,
        uniqueUsersCount: 0,
        completedEntries: 0,
        completionRate: 0,
        averageTravelPerEntry: 0
      },
      data: formattedTravels
    });

  } catch (error) {
    console.error('Error fetching admin data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// 7. Admin: Get today's summary
router.get('/admin/today-summary', async (req, res) => {
  try {
    // Get today's date range
    const today = getTodayDate();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query = {
      date: { $gte: today, $lt: tomorrow }
    };

    // Get detailed summary for today
    const summary = await Travel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalUsers: { $addToSet: '$userId' },
          totalDistanceIn: { $sum: '$distanceIn' },
          totalDistanceOut: { $sum: '$distanceOut' },
          totalTravelDistance: { $sum: '$totalDistance' },
          recordsCount: { $sum: 1 },
          completedEntries: {
            $sum: { $cond: [{ $and: ['$inEntered', '$outEntered'] }, 1, 0] }
          },
          pendingEntries: {
            $sum: { $cond: [{ $or: [{ $not: '$inEntered' }, { $not: '$outEntered' }] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          totalUsers: { $size: '$totalUsers' },
          totalDistanceIn: 1,
          totalDistanceOut: 1,
          totalTravelDistance: 1,
          netDistance: { $subtract: ['$totalDistanceOut', '$totalDistanceIn'] },
          recordsCount: 1,
          completedEntries: 1,
          pendingEntries: 1,
          completionRate: {
            $multiply: [{ $divide: ['$completedEntries', '$recordsCount'] }, 100]
          },
          averageTravelPerUser: { $divide: ['$totalTravelDistance', { $size: '$totalUsers' }] }
        }
      }
    ]);

    // Get latest travels with user details
    const latestTravels = await Travel.find(query)
      .populate('userId', 'username name')
      .sort({ updatedAt: -1 })
      .limit(10);

    // Format latest travels with calculated totals
    const formattedLatestTravels = latestTravels.map(travel => ({
      ...travel.toObject(),
      calculatedTotal: calculateTotalTravel(travel.distanceIn, travel.distanceOut)
    }));

    res.json({
      success: true,
      summary: summary[0] || {
        totalUsers: 0,
        totalDistanceIn: 0,
        totalDistanceOut: 0,
        totalTravelDistance: 0,
        netDistance: 0,
        recordsCount: 0,
        completedEntries: 0,
        pendingEntries: 0,
        completionRate: 0,
        averageTravelPerUser: 0
      },
      latestTravels: formattedLatestTravels
    });

  } catch (error) {
    console.error('Error fetching today summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// 8. Admin: Get monthly overview with analytics
router.get('/admin/monthly-overview', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    
    const start = new Date(targetYear, targetMonth, 1);
    const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    // Get monthly data grouped by day
    const dailyData = await Travel.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' }
          },
          totalDistanceIn: { $sum: '$distanceIn' },
          totalDistanceOut: { $sum: '$distanceOut' },
          totalTravelDistance: { $sum: '$totalDistance' },
          userCount: { $addToSet: '$userId' },
          entryCount: { $sum: 1 },
          completedEntries: {
            $sum: { $cond: [{ $and: ['$inEntered', '$outEntered'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          day: '$_id.day',
          totalDistanceIn: 1,
          totalDistanceOut: 1,
          totalTravelDistance: 1,
          netDistance: { $subtract: ['$totalDistanceOut', '$totalDistanceIn'] },
          userCount: { $size: '$userCount' },
          entryCount: 1,
          completedEntries: 1,
          completionRate: {
            $multiply: [{ $divide: ['$completedEntries', '$entryCount'] }, 100]
          }
        }
      },
      {
        $sort: { day: 1 }
      }
    ]);

    // Get overall monthly statistics
    const monthlyStats = await Travel.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalDistanceIn: { $sum: '$distanceIn' },
          totalDistanceOut: { $sum: '$distanceOut' },
          totalTravelDistance: { $sum: '$totalDistance' },
          totalRecords: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          completedEntries: {
            $sum: { $cond: [{ $and: ['$inEntered', '$outEntered'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          totalDistanceIn: 1,
          totalDistanceOut: 1,
          totalTravelDistance: 1,
          netDistance: { $subtract: ['$totalDistanceOut', '$totalDistanceIn'] },
          totalRecords: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' },
          completedEntries: 1,
          completionRate: {
            $multiply: [{ $divide: ['$completedEntries', '$totalRecords'] }, 100]
          },
          averageTravelPerUser: { $divide: ['$totalTravelDistance', { $size: '$uniqueUsers' }] },
          averageTravelPerDay: { $divide: ['$totalTravelDistance', new Date(targetYear, targetMonth + 1, 0).getDate()] }
        }
      }
    ]);

    // Get top traveling users for the month
    const topUsers = await Travel.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalTravelDistance: { $sum: '$totalDistance' },
          totalIn: { $sum: '$distanceIn' },
          totalOut: { $sum: '$distanceOut' },
          daysCompleted: {
            $sum: { $cond: [{ $and: ['$inEntered', '$outEntered'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { totalTravelDistance: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          userId: '$_id',
          username: '$userInfo.username',
          name: '$userInfo.name',
          totalTravelDistance: 1,
          totalIn: 1,
          totalOut: 1,
          netDistance: { $subtract: ['$totalOut', '$totalIn'] },
          daysCompleted: 1,
          averagePerDay: { $divide: ['$totalTravelDistance', '$daysCompleted'] }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        month: targetMonth + 1,
        year: targetYear,
        monthName: new Date(targetYear, targetMonth, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        totalDaysInMonth: new Date(targetYear, targetMonth + 1, 0).getDate(),
        dailyData,
        stats: monthlyStats[0] || {
          totalDistanceIn: 0,
          totalDistanceOut: 0,
          totalTravelDistance: 0,
          netDistance: 0,
          totalRecords: 0,
          uniqueUsersCount: 0,
          completedEntries: 0,
          completionRate: 0,
          averageTravelPerUser: 0,
          averageTravelPerDay: 0
        },
        topUsers
      }
    });

  } catch (error) {
    console.error('Error fetching monthly overview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// 9. Get user's yearly overview (User)
router.get('/yearly-overview/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { year } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const targetYear = parseInt(year) || new Date().getFullYear();
    const start = new Date(targetYear, 0, 1);
    const end = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    // Get monthly aggregated data for the year
    const monthlyData = await Travel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' }
          },
          totalDistanceIn: { $sum: '$distanceIn' },
          totalDistanceOut: { $sum: '$distanceOut' },
          totalTravelDistance: { $sum: '$totalDistance' },
          daysCompleted: {
            $sum: { $cond: [{ $and: ['$inEntered', '$outEntered'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          month: '$_id.month',
          totalDistanceIn: 1,
          totalDistanceOut: 1,
          totalTravelDistance: 1,
          netDistance: { $subtract: ['$totalDistanceOut', '$totalDistanceIn'] },
          daysCompleted: 1,
          averagePerDay: { $divide: ['$totalTravelDistance', '$daysCompleted'] }
        }
      },
      {
        $sort: { month: 1 }
      }
    ]);

    // Get yearly totals
    const yearlyStats = await Travel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalDistanceIn: { $sum: '$distanceIn' },
          totalDistanceOut: { $sum: '$distanceOut' },
          totalTravelDistance: { $sum: '$totalDistance' },
          totalEntries: { $sum: 1 },
          daysCompleted: {
            $sum: { $cond: [{ $and: ['$inEntered', '$outEntered'] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = yearlyStats[0] || {
      totalDistanceIn: 0,
      totalDistanceOut: 0,
      totalTravelDistance: 0,
      totalEntries: 0,
      daysCompleted: 0
    };

    res.json({
      success: true,
      year: targetYear,
      monthlyData,
      yearlyStats: {
        ...stats,
        netDistance: stats.totalDistanceOut - stats.totalDistanceIn,
        averagePerDay: stats.daysCompleted > 0 ? stats.totalTravelDistance / stats.daysCompleted : 0,
        completionRate: (stats.daysCompleted / 365) * 100 // Assuming 365 days in year
      }
    });

  } catch (error) {
    console.error('Error fetching yearly overview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;