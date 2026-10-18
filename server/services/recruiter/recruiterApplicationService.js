const Application = require("../../models/Application");
const Job = require("../../models/Job");
const { createNotification, NOTIFICATION_TYPES } = require("../notificationService");
const {
  ATS_STATUSES,
  RECRUITER_ALLOWED_STATUSES,
  normalizeStatus,
} = require("./recruiterConstants");

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Get applications for a specific recruiter job with ownership enforcement
 */
async function getJobApplications(jobId, userId, query = {}, isAdmin = false) {
  const job = await Job.findById(jobId).select("_id title company location postedBy").lean();
  if (!job) {
    const error = new Error("Job not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const isOwner = job.postedBy && job.postedBy.toString() === userId.toString();
  if (!isOwner && !isAdmin) {
    const error = new Error("Access denied. You can only view applications for your own jobs.");
    error.status = 403;
    error.code = "FORBIDDEN_OWNERSHIP";
    throw error;
  }

  const {
    status,
    q,
    location,
    experience,
    sort = "newest",
    page = 1,
    limit = 50,
  } = query;

  const filter = { job: jobId };

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

  if (experience && experience !== "ALL") {
    filter.experienceYears = { $regex: escapeRegex(experience), $options: "i" };
  }

  let sortOption = { createdAt: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate("applicant", "name email phone location avatar")
      .populate("job", "title company location status")
      .populate("resumeId", "title targetRole skills totalExperienceYears")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Application.countDocuments(filter),
  ]);

  const sanitizedApplications = applications.map((app) => ({
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
    currentCtc: app.currentCtc || "",
    expectedCtc: app.expectedCtc || "",
    noticePeriod: app.noticePeriod || "",
    portfolio: app.portfolio || "",
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
    job,
    applications: sanitizedApplications,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Get all applications across all jobs owned by recruiter
 */
async function getAllRecruiterApplications(userId, query = {}, isAdmin = false) {
  const jobFilter = isAdmin ? {} : { postedBy: userId };
  const jobs = await Job.find(jobFilter).select("_id").lean();
  const jobIds = jobs.map((j) => j._id);

  const {
    jobId,
    status,
    q,
    location,
    experience,
    sort = "newest",
    page = 1,
    limit = 50,
  } = query;

  let targetJobIds = jobIds;
  if (jobId && jobId !== "ALL") {
    targetJobIds = jobIds.filter((id) => id.toString() === jobId.toString());
  }

  const filter = { job: { $in: targetJobIds } };

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

  if (experience && experience !== "ALL") {
    filter.experienceYears = { $regex: escapeRegex(experience), $options: "i" };
  }

  let sortOption = { createdAt: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate("applicant", "name email phone location avatar")
      .populate("job", "title company location status")
      .populate("resumeId", "title targetRole skills totalExperienceYears")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Application.countDocuments(filter),
  ]);

  const sanitizedApplications = applications.map((app) => ({
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
    currentCtc: app.currentCtc || "",
    expectedCtc: app.expectedCtc || "",
    noticePeriod: app.noticePeriod || "",
    portfolio: app.portfolio || "",
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
    applications: sanitizedApplications,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Get single application by ID with strict job ownership verification
 */
async function getRecruiterApplicationById(applicationId, userId, isAdmin = false) {
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

  const jobOwnerId = application.job?.postedBy ? (application.job.postedBy._id || application.job.postedBy).toString() : null;
  const isOwner = jobOwnerId && jobOwnerId === userId.toString();

  if (!isOwner && !isAdmin) {
    const error = new Error("Access denied. You can only view applications for your own job listings.");
    error.status = 403;
    error.code = "FORBIDDEN_OWNERSHIP";
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
 * Update candidate application status with strict ownership, transition logging, and Phase 4K notifications
 */
async function updateRecruiterApplicationStatus(applicationId, userId, userRole, newStatus, note = "") {
  const normalizedNewStatus = normalizeStatus(newStatus);

  if (!RECRUITER_ALLOWED_STATUSES.includes(normalizedNewStatus)) {
    const error = new Error(`Invalid status for recruiter. Allowed: ${RECRUITER_ALLOWED_STATUSES.join(", ")}`);
    error.status = 400;
    error.code = "INVALID_STATUS";
    throw error;
  }

  const application = await Application.findById(applicationId).populate("job");
  if (!application) {
    const error = new Error("Application not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const isAdmin = userRole === "ADMIN";
  const jobOwnerId = application.job?.postedBy ? (application.job.postedBy._id || application.job.postedBy).toString() : null;
  const isOwner = jobOwnerId && jobOwnerId === userId.toString();

  if (!isOwner && !isAdmin) {
    const error = new Error("Access denied. You can only update applications for your own job listings.");
    error.status = 403;
    error.code = "FORBIDDEN_OWNERSHIP";
    throw error;
  }

  const currentNormalizedStatus = normalizeStatus(application.status);

  // Same-status redundant transition protection
  if (currentNormalizedStatus === normalizedNewStatus) {
    return {
      application,
      changed: false,
      message: `Application is already in ${normalizedNewStatus} status.`,
    };
  }

  application.status = normalizedNewStatus;
  if (!Array.isArray(application.statusHistory)) {
    application.statusHistory = [];
  }

  application.statusHistory.push({
    status: normalizedNewStatus,
    changedAt: new Date(),
    note: note && note.trim() ? note.trim() : `Status updated to ${normalizedNewStatus} by ${isAdmin ? "Administrator" : "Recruiter"}`,
  });

  await application.save();

  // Dispatch Phase 4K candidate notification
  try {
    const applicantId = application.applicant?._id || application.applicant;
    if (applicantId) {
      await createNotification({
        user: applicantId,
        type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
        title: "Application Status Updated",
        message: `Your application status for ${application.job?.title || "Role"} at ${application.job?.company || "Company"} was updated to ${normalizedNewStatus}.`,
        entityType: "APPLICATION",
        entityId: application._id,
        metadata: { jobId: application.job?._id, status: normalizedNewStatus },
        eventKey: `${applicantId}_STATUS_${application._id}_${normalizedNewStatus}`,
      });
    }
  } catch (notifErr) {
    console.warn("Notification dispatch notice:", notifErr.message);
  }

  return {
    application,
    changed: true,
    message: `Application status updated to ${normalizedNewStatus}`,
  };
}

module.exports = {
  getJobApplications,
  getAllRecruiterApplications,
  getRecruiterApplicationById,
  updateRecruiterApplicationStatus,
};
