const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "APPLICATION_SUBMITTED",
        "APPLICATION_STATUS_CHANGED",
        "APPLICATION_WITHDRAWN",
        "JOB_SAVED",
        "PROFILE_INCOMPLETE",
        "RESUME_ANALYSIS_READY",
        "RESUME_UPDATED",
        "MESSAGE_RECEIVED",
      ],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    entityType: {
      type: String,
      enum: ["APPLICATION", "JOB", "RESUME", "PROFILE", "CONVERSATION", "MESSAGE"],
      default: "APPLICATION",
    },

    entityId: {
      type: mongoose.Schema.Types.Mixed,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    eventKey: {
      type: String,
      sparse: true,
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Performance compound indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
