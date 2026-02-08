/**
 * Notification utility
 * Handles creating and fetching notifications for tickets
 */

const Notification = require("../models/Notification.model");
const User = require("../models/User.model");

/**
 * Create a notification for a specific user
 * @param {String} userId - User ID to notify
 * @param {String} message - Notification message
 * @param {String} ticketId - Related ticket ID (optional)
 */
const createNotification = async (userId, message, ticketId = null) => {
  try {
    const notification = new Notification({
      userId,
      message,
      ticketId,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Notify all admins about a new ticket
 * @param {Object} ticket - The ticket object
 * @param {String} creatorUsername - Username of ticket creator
 */
const notifyAdminsNewTicket = async (ticket, creatorUsername) => {
  try {
    // Find all admin users
    const admins = await User.find({ role: "Admin" }).select("_id");

    // Create notification for each admin
    const message = `New ticket created by ${creatorUsername}: "${ticket.title}"`;

    const notifications = admins.map((admin) =>
      createNotification(admin._id, message, ticket._id),
    );

    await Promise.all(notifications);
    return notifications.length;
  } catch (error) {
    console.error("Error notifying admins:", error);
    throw error;
  }
};

/**
 * Notify user when their ticket status changes
 * @param {String} userId - User ID to notify
 * @param {Object} ticket - The ticket object
 * @param {String} oldStatus - Previous status
 * @param {String} newStatus - New status
 */
const notifyStatusChange = async (userId, ticket, oldStatus, newStatus) => {
  try {
    const message = `Your ticket "${ticket.title}" status changed from ${oldStatus} to ${newStatus}`;

    await createNotification(userId, message, ticket._id);
  } catch (error) {
    console.error("Error notifying status change:", error);
    throw error;
  }
};

/**
 * Fetch notifications for a specific user
 * @param {String} userId - User ID
 * @param {Boolean} unreadOnly - Fetch only unread notifications (default: false)
 * @param {Number} limit - Limit number of results (default: 50)
 */
const fetchNotifications = async (userId, unreadOnly = false, limit = 50) => {
  try {
    const query = { userId };

    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate("ticketId", "title status")
      .sort({ createdAt: -1 })
      .limit(limit);

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {String} notificationId - Notification ID
 */
const markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true },
    );

    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {String} userId - User ID
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true },
    );

    return result.modifiedCount;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 * @param {String} userId - User ID
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({ userId, read: false });
    return count;
  } catch (error) {
    console.error("Error getting unread count:", error);
    throw error;
  }
};

module.exports = {
  createNotification,
  notifyAdminsNewTicket,
  notifyStatusChange,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
