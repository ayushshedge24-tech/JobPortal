const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const NOTIFICATION_TYPES = Object.freeze({
  APPLICATION_SUBMITTED: "APPLICATION_SUBMITTED",
  APPLICATION_STATUS_CHANGED: "APPLICATION_STATUS_CHANGED",
  APPLICATION_WITHDRAWN: "APPLICATION_WITHDRAWN",
  JOB_SAVED: "JOB_SAVED",
  PROFILE_INCOMPLETE: "PROFILE_INCOMPLETE",
  RESUME_ANALYSIS_READY: "RESUME_ANALYSIS_READY",
  RESUME_UPDATED: "RESUME_UPDATED",
  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
});

/**
 * Creates a notification with idempotent eventKey deduplication
 */
async function createNotification({
  user,
  type,
  title,
  message,
  entityType = "APPLICATION",
  entityId = null,
  metadata = {},
  eventKey = null,
}) {
  try {
    if (!user || !type || !title || !message) {
      return null;
    }

    // Deduplication check if eventKey is provided
    if (eventKey) {
      const existing = await Notification.findOne({ eventKey }).lean();
      if (existing) {
        return existing;
      }
    }

    const notification = await Notification.create({
      user,
      type,
      title,
      message,
      entityType,
      entityId,
      metadata,
      eventKey,
      isRead: false,
    });

    return notification;
  } catch (err) {
    if (err.code === 11000 && eventKey) {
      // Duplicate eventKey caught safely
      return await Notification.findOne({ eventKey }).lean();
    }
    console.error("Failed to create notification:", err);
    return null;
  }
}

/**
 * Retrieves paginated notifications for candidate
 */
async function getNotifications({ userId, page = 1, limit = 20, isRead = null, type = null }) {
  const boundedPage = Math.max(1, parseInt(page, 10) || 1);
  const boundedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

  const query = { user: userId };

  if (isRead !== null && isRead !== undefined && isRead !== "") {
    query.isRead = isRead === true || isRead === "true";
  }

  if (type && Object.values(NOTIFICATION_TYPES).includes(type)) {
    query.type = type;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((boundedPage - 1) * boundedLimit)
      .limit(boundedLimit)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  const totalPages = Math.ceil(total / boundedLimit) || 1;

  return {
    notifications,
    pagination: {
      page: boundedPage,
      limit: boundedLimit,
      total,
      totalPages,
    },
    unreadCount,
  };
}

/**
 * Returns accurate unread count for candidate
 */
async function getUnreadCount(userId) {
  return await Notification.countDocuments({ user: userId, isRead: false });
}

/**
 * Marks single notification as read with strict ownership check
 */
async function markAsRead(notificationId, userId) {
  if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
    return null;
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  ).lean();

  return notification;
}

/**
 * Marks all unread notifications as read for candidate
 */
async function markAllAsRead(userId) {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return { modifiedCount: result.modifiedCount };
}

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
