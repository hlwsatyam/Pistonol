const Notification = require("../models/Notification");
const User = require("../models/User");

// Create notification for company employee
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type = "info" } = req.body;

    // Check if user exists and is company employee
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

 

    const notification = await Notification.create({
      userId,
      title,
      message,
      type
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
// exports.getRecentNotifications = async (req, res) => {
//   try {
//     const {role}=req.query
//     // Isko aap modify kar sakte ho ki last 50 notifications dikhaye
//     const notifications = await Notification.find()
//       .sort({ createdAt: -1 })
//       .limit(50)
//       .populate('userId', 'username name email mobile');
    
//     res.status(200).json({
//       success: true,
//       data: notifications
//     });
//   } catch (error) {
//     console.error('Get recent notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };
// Get user notifications



exports.getRecentNotifications = async (req, res) => {
  try {
    const { role } = req.query; // ?role=dealer

    const pipeline = [
      {
        $lookup: {
          from: "users", // 👈 Mongo collection name
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" }, // user array → object
    ];

    // 🔥 role filter
    if (role) {
      pipeline.push({
        $match: { "user.role": role },
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $project: {
          title: 1,
          message: 1,
          type: 1,
          isRead: 1,
          createdAt: 1,
          user: {
            _id: 1,
            username: 1,
            name: 1,
            email: 1,
            mobile: 1,
            role: 1,
          },
        },
      }
    );

    const notifications = await Notification.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};












exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        readAt: Date.now()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      {
        $set: {
          isRead: true,
          readAt: Date.now()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Notification.countDocuments({
      userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount: count
      }
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};