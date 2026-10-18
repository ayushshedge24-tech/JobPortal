const AuditLog = require("../../models/AuditLog");

/**
 * Log a structured, immutable administrative audit event
 */
async function logAuditEvent({
  actor,
  actorName = "Administrator",
  actorEmail = "",
  actorRole = "ADMIN",
  action,
  entityType,
  entityId = null,
  summary,
  metadata = {},
}) {
  try {
    // Sanitize metadata to guarantee zero secrets/passwords are recorded
    const sanitizedMeta = { ...metadata };
    delete sanitizedMeta.password;
    delete sanitizedMeta.passwordHash;
    delete sanitizedMeta.token;
    delete sanitizedMeta.accessToken;
    delete sanitizedMeta.refreshToken;

    const log = await AuditLog.create({
      actor,
      actorName,
      actorEmail,
      actorRole,
      action,
      entityType,
      entityId: entityId ? entityId.toString() : null,
      summary,
      metadata: sanitizedMeta,
    });
    return log;
  } catch (err) {
    console.error("Failed to persist audit log:", err);
    return null;
  }
}

/**
 * Get paginated, filtered audit logs
 */
async function getAuditLogs(query = {}) {
  const {
    action,
    entityType,
    actorId,
    q,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = query;

  const filter = {};

  if (action && action !== "ALL") {
    filter.action = action;
  }

  if (entityType && entityType !== "ALL") {
    filter.entityType = entityType;
  }

  if (actorId && actorId !== "ALL") {
    filter.actor = actorId;
  }

  if (q && q.trim()) {
    const kw = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { summary: { $regex: kw, $options: "i" } },
      { actorName: { $regex: kw, $options: "i" } },
      { actorEmail: { $regex: kw, $options: "i" } },
      { action: { $regex: kw, $options: "i" } },
    ];
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

module.exports = {
  logAuditEvent,
  getAuditLogs,
};
