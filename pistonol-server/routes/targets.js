const express = require("express");
const router = express.Router();
const Target = require("../models/Target");
const User = require("../models/User");
const TargetHistory = require("../models/TargetHistory");




router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { month } = req.query;
    
    let query = { userId };
    if (month) {
      query.month = month;
    }
    
    const history = await TargetHistory.find(query)
      .sort({ changedAt: -1 }) // Latest first
      .lean();
    
    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});









// Set target for any user (Admin only)
router.post("/set-target", async (req, res) => {
  try {
    const { userId, month, targetAmount } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "User not found" 
      });
    }


    // Create or update target
    const target = await Target.findOneAndUpdate(
      { userId, month },
      { targetAmount },
      { upsert: true, new: true }
    ).populate("userId", "username name role mobile");









    res.json({
      success: true,
      message: "Target set successfully",
      target
    });
  } catch (error) {
    console.error("Set target error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Update achieved amount
router.patch("/update-achieved", async (req, res) => {
  try {
    const { userId, month, achievedAmount } = req.body;

    const target = await Target.findOneAndUpdate(
      { userId, month },
      { 
        $inc: { achievedAmount: achievedAmount },
        updatedAt: Date.now()
      },
      { new: true }
    ).populate("userId", "username name role mobile");


    if (!target) {
      return res.status(404).json({ 
        success: false,
        message: "Target not found" 
      });
    }



  
  await TargetHistory.create({
      userId,
      month,
      targetAmount:achievedAmount
    });

    res.json({
      success: true,
      message: "Achieved amount updated successfully",
      target
    });
  } catch (error) {
    console.error("Update achieved error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Get targets for a specific user
router.get("/user-targets/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { month } = req.query;

    let query = { userId };
    if (month) {
      query.month = month;
    }

    const targets = await Target.find(query)
      .populate("userId", "username name role mobile")
      .sort({ month: -1 });

    res.json({
      success: true,
      targets
    });
  } catch (error) {
    console.error("Get user targets error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Get all targets for admin view (filter by role if needed)
router.get("/all-targets", async (req, res) => {
  try {
    const { role, month } = req.query;

    let userQuery = {};
    if (role) {
      userQuery.role = role;
    }

    let targetQuery = {};
    if (month) {
      targetQuery.month = month;
    }

    const targets = await Target.find(targetQuery)
      .populate({
        path: "userId",
        match: userQuery,
        select: "username name role mobile"
      })
      .sort({ month: -1 });

    // Filter out targets where user doesn't match the role filter
    const filteredTargets = targets.filter(target => target.userId);

    res.json({
      success: true,
      targets: filteredTargets
    });
  } catch (error) {
    console.error("Get all targets error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;