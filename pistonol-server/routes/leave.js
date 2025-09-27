// routes/leave.js
const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");
 

// Apply for leave
router.post("/apply",  async (req, res) => {
  try {
    console.log(req.body)
    const { startDate,userId, endDate, reason, type, storeId } = req.body;
     

    // Check for overlapping leave requests
    const overlappingLeave = await Leave.findOne({
      user: userId,
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
        { startDate: { $gte: new Date(startDate) }, endDate: { $lte: new Date(endDate) } }
      ],
      status: { $in: ["pending", "approved"] }
    });

    if (overlappingLeave) {
      return res.status(400).json({ 
        message: "You already have a leave request for these dates" 
      });
    }

    const leave = new Leave({
      user: userId,
      
      startDate,
      endDate,
      reason,
      type
    });

    await leave.save();
   
    
    res.status(201).json({ message: "Leave application submitted", leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave history
router.get("/history",  async (req, res) => {
  try {
    const { page = 1,  userId, limit = 30 } = req.query;
   

    const leaves = await Leave.find({ user: userId })
 
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Leave.countDocuments({ user: userId });

    res.status(200).json({
      leaves,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
});

// Cancel leave request
router.put("/cancel/:id",  async (req, res) => {
  try {
    const leaveId = req.params.id;
    const userId = req.body.id;

    const leave = await Leave.findOne({ _id: leaveId, user: userId });
    
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({ 
        message: "Only pending leave requests can be cancelled" 
      });
    }

    leave.status = "cancelled";
    await leave.save();

    res.status(200).json({ message: "Leave request cancelled", leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;