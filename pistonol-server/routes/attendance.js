// routes/attendance.js
const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attandance");
const Store = require("../models/Store");
 
 const geodesic = require("geographiclib-geodesic");
 const geod = geodesic.Geodesic.WGS84;
 



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
    const { attendanceId,userId ,latitude, longitude, image } = req.body;
  

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
    const { page = 1, limit = 30 } = req.query;
    const userId = req.user.id;

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