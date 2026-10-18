const mongoose = require("mongoose");
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require("../services/notificationService");

/**
 * @route   GET /api/candidate/notifications
 * @desc    Get candidate notifications with pagination & filters
 * @access  Private (JOB_SEEKER, ADMIN)
 */
async function getNotificationsHandler(req, res) {
  try {
    const userId = req.user._id;
    const { page, limit, isRead, type } = req.query;

    const data = await getNotifications({
      userId,
      page,
      limit,
      isRead,
      type,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return res.status(500).json({
      success: false,
      error: { code: "FETCH_NOTIFICATIONS_ERROR", message: "Failed to retrieve notifications" },
    });
  }
}

/**
 * @route   GET /api/candidate/notifications/unread-count
 * @desc    Get accurate unread notification count
 * @access  Private (JOB_SEEKER, ADMIN)
 */
async function getUnreadCountHandler(req, res) {
  try {
    const userId = req.user._id;
    const count = await getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (err) {
    console.error("Failed to fetch unread count:", err);
    return res.status(500).json({
      success: false,
      error: { code: "UNREAD_COUNT_ERROR", message: "Failed to count unread notifications" },
    });
  }
}

/**
 * @route   PATCH /api/candidate/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private (JOB_SEEKER, ADMIN)
 */
async function markNotificationReadHandler(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_NOTIFICATION_ID", message: "A valid notification ID is required" },
      });
    }

    const notification = await markAsRead(id, userId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { code: "NOTIFICATION_NOT_FOUND", message: "Notification not found or unauthorized" },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (err) {
    console.error("Failed to mark notification read:", err);
    return res.status(500).json({
      success: false,
      error: { code: "MARK_READ_ERROR", message: "Failed to mark notification read" },
    });
  }
}

/**
 * @route   PATCH /api/candidate/notifications/read-all
 * @desc    Mark all unread notifications as read for candidate
 * @access  Private (JOB_SEEKER, ADMIN)
 */
async function markAllNotificationsReadHandler(req, res) {
  try {
    const userId = req.user._id;
    const result = await markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: result,
    });
  } catch (err) {
    console.error("Failed to mark all notifications read:", err);
    return res.status(500).json({
      success: false,
      error: { code: "MARK_ALL_READ_ERROR", message: "Failed to mark notifications read" },
    });
  }
}

module.exports = {
  getNotificationsHandler,
  getUnreadCountHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
};
