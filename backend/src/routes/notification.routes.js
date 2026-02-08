/**
 * Notification routes
 * Handles notification retrieval and management
 */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { fetchNotifications } = require("../utils/notification");
const Notification = require("../models/Notification.model");

// All notification routes require authentication
router.use(authMiddleware);

// GET /notifications - Get user's notifications
router.get("/", async (req, res) => {
  try {
    const { unreadOnly, limit } = req.query;
    const userId = req.user.id;

    const notifications = await fetchNotifications(
      userId,
      unreadOnly === "true",
      parseInt(limit) || 50,
    );

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
});

// PATCH /notifications/:id/read - Mark notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error updating notification" });
  }
});

// PATCH /notifications/read-all - Mark all notifications as read
router.patch("/read-all", async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany({ userId, read: false }, { read: true });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error updating notifications" });
  }
});

module.exports = router;
