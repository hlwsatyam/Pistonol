const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Create notification (admin only)
router.post("/create", notificationController.createNotification);
router.get('/recent', notificationController.getRecentNotifications);
// Get user notifications
router.get("/user/:userId", notificationController.getUserNotifications);

// Mark as read
router.patch("/:notificationId/read", notificationController.markAsRead);

// Mark all as read
router.patch("/user/:userId/read-all", notificationController.markAllAsRead);

// Delete notification
router.delete("/:notificationId", notificationController.deleteNotification);

// Get unread count
router.get("/user/:userId/unread-count", notificationController.getUnreadCount);

module.exports = router;