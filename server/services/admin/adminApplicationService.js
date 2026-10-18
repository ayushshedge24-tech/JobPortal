const Application = require("../../models/Application");
const Job = require("../../models/Job");
const { logAuditEvent } = require("./adminAuditService");
const { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } = require("./adminConstants");
const { createNotification, NOTIFICATION_TYPES } = require("../notificationService");
const { normalizeStatus, ATS_STATUSES } = require("../recruiter/recruiterConstants");

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * List platform applications with multi-filtering
 */
async function getAdminApplications(query = {}) {
  const {
    jobId,
    status,
    q,
    location,
    sort = "newest",
    page = 1,
    limit = 20,
  } = query;

  const filter = {};

  if (jobId && jobId !== "ALL") {
    filter.job = jobId;
  }

  if (status && status !== "ALL") {
    const norm = normalizeStatus(status);
    filter.$or = [
      { status: norm },
      { status: status },
      { status: new RegExp(`^${escapeRegex(status)}$`, "i") },
    ];
  }

  if (q && q.trim()) {
    const kw = escapeRegex(q.trim());
    filter.$or = [
      { applicantName: { $regex: kw, $options: "i" } },
      { applicantEmail: { $regex: kw, $options: "i" } },
      { coverLetter: { $regex: kw, $options: "i" } },
      { resumeTitle: { $regex: kw, $options: "i" } },
      { currentLocation: { $regex: kw, $options: "i" } },
    ];
  }

  if (location && location !== "ALL") {
    filter.currentLocation = { $regex: escapeRegex(location), $options: "i" };
  }

  let sortOption = { createdAt: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate("applicant", "name email phone location avatar")
      .populate("job", "title company location status postedBy")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Application.countDocuments(filter),
  ]);

  const sanitized = applications.map((app) => ({
    _id: app._id,
    job: app.job,
    applicant: app.applicant
      ? {
          _id: app.applicant._id,
          name: app.applicant.name,
          email: app.applicant.email,
          phone: app.applicant.phone,
          location: app.applicant.location,
          avatar: app.applicant.avatar,
        }
      : null,
    applicantName: app.applicantName || app.applicant?.name || "Candidate",
    applicantEmail: app.applicantEmail || app.applicant?.email || "",
    phone: app.phone || app.applicant?.phone || "",
    currentLocation: app.currentLocation || app.applicant?.location || "",
    experienceYears: app.experienceYears || "",
    coverLetter: app.coverLetter || "",
    resume: app.resume || "",
    resumeId: app.resumeId,
    resumeVersion: app.resumeVersion,
    resumeTitle: app.resumeTitle,
    status: normalizeStatus(app.status),
    statusHistory: app.statusHistory || [],
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  }));

  return {
    applications: sanitized,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Get single application details with frozen resume snapshot
 */
async function getAdminApplicationById(applicationId) {
  const application = await Application.findById(applicationId)
    .populate("job")
    .populate("applicant", "name email phone location avatar")
    .populate("resumeId");

  if (!application) {
    const error = new Error("Application not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  return {
    _id: application._id,
    job: application.job,
    applicant: application.applicant
      ? {
          _id: application.applicant._id,
          name: application.applicant.name,
          email: application.applicant.email,
          phone: application.applicant.phone,
          location: application.applicant.location,
          avatar: application.applicant.avatar,
        }
      : null,
    applicantName: application.applicantName || application.applicant?.name || "Candidate",
    applicantEmail: application.applicantEmail || application.applicant?.email || "",
    phone: application.phone || application.applicant?.phone || "",
    currentLocation: application.currentLocation || application.applicant?.location || "",
    experienceYears: application.experienceYears || "",
    currentCtc: application.currentCtc || "",
    expectedCtc: application.expectedCtc || "",
    noticePeriod: application.noticePeriod || "",
    portfolio: application.portfolio || "",
    coverLetter: application.coverLetter || "",
    resume: application.resume || "",
    resumeId: application.resumeId,
    resumeVersion: application.resumeVersion,
    resumeTitle: application.resumeTitle,
    status: normalizeStatus(application.status),
    statusHistory: application.statusHistory || [],
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
}

/**
 * Moderate application status with audit log and Phase 4K candidate notification
 */
async function moderateApplicationStatus(applicationId, newStatus, note = "", adminUser) {
  const normStatus = normalizeStatus(newStatus);
  const application = await Application.findById(applicationId).populate("job");
  if (!application) {
    const error = new Error("Application not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const oldStatus = normalizeStatus(application.status);
  if (oldStatus === normStatus) {
    return {
      application,
      changed: false,
      message: `Application is already in ${normStatus} status.`,
    };
  }

  application.status = normStatus;
  if (!Array.isArray(application.statusHistory)) {
    application.statusHistory = [];
  }

  application.statusHistory.push({
    status: normStatus,
    changedAt: new Date(),
    note: note && note.trim() ? note.trim() : "Status updated by Administrator",
  });

  await application.save();

  // Audit log
  await logAuditEvent({
    actor: adminUser._id,
    actorName: adminUser.name,
    actorEmail: adminUser.email,
    actorRole: "ADMIN",
    action: AUDIT_ACTIONS.APPLICATION_MODERATED,
    entityType: AUDIT_ENTITY_TYPES.APPLICATION,
    entityId: application._id,
    summary: `Moderated application status for ${application.applicantName || "Candidate"} to ${normStatus}`,
    metadata: {
      applicationId: application._id,
      jobId: application.job?._id,
      oldStatus,
      newStatus: normStatus,
      note,
    },
  });

  // Emit Phase 4K candidate notification
  try {
    const applicantId = application.applicant?._id || application.applicant;
    if (applicantId) {
      await createNotification({
        user: applicantId,
        type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
        title: "Application Status Updated",
        message: `Your application status for ${application.job?.title || "Role"} at ${application.job?.company || "Company"} was updated to ${normStatus}.`,
        entityType: "APPLICATION",
        entityId: application._id,
        metadata: { jobId: application.job?._id, status: normStatus },
        eventKey: `${applicantId}_STATUS_${application._id}_${normStatus}`,
      });
    }
  } catch (notifErr) {
    console.warn("Notification dispatch notice:", notifErr.message);
  }

  return {
    application,
    changed: true,
    message: `Application status updated to ${normStatus}`,
  };
}

module.exports = {
  getAdminApplications,
  getAdminApplicationById,
  moderateApplicationStatus,
};
