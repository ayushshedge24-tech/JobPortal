const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actorName: {
      type: String,
      default: "Administrator",
    },
    actorEmail: {
      type: String,
      default: "",
    },
    actorRole: {
      type: String,
      default: "ADMIN",
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ["USER", "JOB", "APPLICATION", "COMPANY", "SYSTEM"],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    summary: {
      type: String,
      required: true,
      maxlength: 500,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // append-only
  }
);

// High-performance compound indexes for audit log queries
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
