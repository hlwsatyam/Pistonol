// routes/attendance.js
const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attandance");
const Store = require("../models/Store");
 
 const geodesic = require("geographiclib-geodesic");
const User = require("../models/User");
 const geod = geodesic.Geodesic.WGS84;
 





router.get('/complete-data', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Set start and end of day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all company employees
    const employees = await User.find({
      role: 'company-employee'
    })
    .select('name email mobile role photo storeId createdAt updatedAt')
    .lean();

    // Get all attendance records for the day
    const attendanceRecords = await Attendance.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    })
    .populate('store', 'name location')
    .lean();

    // Create a map for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.user.toString()] = record;
    });

    // Get all store IDs
    const storeIds = [...new Set(
      employees.flatMap(emp => emp.storeId || [])
    )].filter(id => id);

    // Get store details
    const stores = await Store.find({ _id: { $in: storeIds } })
      .select('name address location')
      .lean();

    const storeMap = {};
    stores.forEach(store => {
      storeMap[store._id.toString()] = store;
    });

    // Combine all data
    const employeesWithData = employees.map(employee => {
      const attendance = attendanceMap[employee._id.toString()];
      
      // Get primary store (first in array)
      const primaryStoreId = employee.storeId?.[0];
      const store = primaryStoreId ? storeMap[primaryStoreId.toString()] : null;

      return {
        ...employee,
        attendance: attendance ? {
          status: attendance.status || 'absent',
          checkIn: attendance.checkIn,
          checkOut: attendance.checkOut,
          workingHours: attendance.workingHours || 0,
          isLate: attendance.isLate || false
        } : null,
        store
      };
    });

    // Calculate statistics
    const totalEmployees = employees.length;
    const presentEmployees = employeesWithData.filter(emp => 
      emp.attendance?.status === 'present'
    );
    const absentEmployees = employeesWithData.filter(emp => 
      !emp.attendance || emp.attendance.status === 'absent'
    );
    
    const presentCount = presentEmployees.length;
    const absentCount = absentEmployees.length;
    const attendanceRate = totalEmployees > 0 ? 
      (presentCount / totalEmployees * 100) : 0;

    // Calculate late count
    const lateCount = employeesWithData.filter(emp => 
      emp.attendance?.isLate
    ).length;

    // Get recent attendance history (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAttendance = await Attendance.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          presentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          totalCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': -1 } }
    ]);

    // Format history data
    const attendanceHistory = recentAttendance.map(item => ({
      date: item._id.date,
      presentCount: item.presentCount,
      absentCount: item.totalCount - item.presentCount,
      totalCount: item.totalCount
    }));

    // Get top performers (employees with best attendance in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const topPerformersAgg = await Attendance.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: 'present'
        }
      },
      {
        $group: {
          _id: '$user',
          presentDays: { $sum: 1 }
        }
      },
      { $sort: { presentDays: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          photo: '$user.photo',
          mobile: '$user.mobile',
          presentDays: 1,
          attendanceRate: { $multiply: [{ $divide: ['$presentDays', 30] }, 100] }
        }
      }
    ]);

    res.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      totalEmployees,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: attendanceRate.toFixed(2),
      
      employees: employeesWithData,
      presentEmployees: presentEmployees.slice(0, 10), // Top 10 present
      absentEmployees: absentEmployees.slice(0, 10), // Top 10 absent
      
      statistics: {
        dailyAverage: (totalEmployees / 30).toFixed(1),
        weeklyAverage: (presentCount / 7).toFixed(1),
        monthlyAverage: (presentCount / 30).toFixed(1)
      },
      
      history: attendanceHistory,
      topPerformers: topPerformersAgg,
      
      summary: {
        message: `Attendance for ${targetDate.toLocaleDateString()}`,
        status: presentCount > (totalEmployees * 0.8) ? 'Good' : 
                presentCount > (totalEmployees * 0.5) ? 'Average' : 'Poor'
      }
    });

  } catch (error) {
    console.error('Error in complete-data route:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complete attendance data',
      error: error.message
    });
  }
});








router.get("/today", async (req, res) => {
  try {
    const { date, userId } = req.query;
    if (!date || !userId) {
      return res.status(400).json({ message: "Date and userId are required" });
    }

    // Parse the given date (format: YYYY-MM-DD)
    const [year, month, day] = date.split("-");
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      user: userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).populate("store", "name location");

    if (!attendance) {

      return res.status(404).json({ message: "No attendance found for today" });
    }

    res.status(200).json( attendance );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});














 














// Check-in endpoint
router.post("/checkin",  async (req, res) => {
  try {
    console.log(req.body)
    const { storeId, userId,latitude, longitude, image } = req.body;
     

    // Find store
    const user = await User.findById(userId);


    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (!user.storeId.includes(storeId)) {
      return res.status(404).json({ message: "this is not your distributor point." });
    }

 



    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }


    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await Attendance.findOne({
      user: userId,
      createdAt: { $gte: today }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    // Create attendance record
    const attendance = new Attendance({
      user: userId,
      store: storeId,
      checkIn: {
        time: new Date(),
        location: { latitude, longitude },
        image:{
          url:image
        },
        address: req.body.address || "Unknown location"
      }
    });

    await attendance.save();
    res.status(200).json({ message: "Check-in successful", attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check-out endpoint
router.post("/checkout",  async (req, res) => {
  try {
    const { attendanceId,userId ,storeId,latitude, longitude, image } = req.body;
  
console.log(req.body)



    const user = await User.findById(userId);


    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (!user.storeId.includes(storeId)) {
      return res.status(404).json({ message: "this is not your distributor point." });
    }

 


    // Find attendance record
    const attendance = await Attendance.findOne({
      _id: attendanceId,
      user: userId
    });

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (attendance.checkOut.time) {
      return res.status(400).json({ message: "Already checked out" });
    }

    // Update attendance with check-out details
    attendance.checkOut = {
      time: new Date(),
      location: { latitude, longitude },
  image:{
          url:image
        },
      address: req.body.address || "Unknown location"
    };

    // Calculate working hours
    const checkInTime = new Date(attendance.checkIn.time);
    const checkOutTime = new Date(attendance.checkOut.time);
    const diffMs = checkOutTime - checkInTime;
    attendance.workingHours = diffMs / (1000 * 60 * 60); // Convert to hours

    await attendance.save();
    res.status(200).json({ message: "Check-out successful", attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance history
router.get("/history",  async (req, res) => {
  try {
    const { page = 1,userId, limit = 30 } = req.query;
    

    const attendance = await Attendance.find({ user: userId })
      .populate("store", "name location")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments({ user: userId });

    res.status(200).json({
      attendance,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;