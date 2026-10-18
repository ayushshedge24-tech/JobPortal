const Job = require("../../models/Job");
const Application = require("../../models/Application");
const { logAuditEvent } = require("./adminAuditService");
const { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, JOB_MODERATION_STATUSES } = require("./adminConstants");

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * List platform jobs with admin filters, search, and application metrics
 */
async function getAdminJobs(query = {}) {
  const {
    q,
    status,
    workMode,
    jobType,
    category,
    recruiterId,
    sort = "newest",
    page = 1,
    limit = 20,
  } = query;

  const filter = {};

  if (q && q.trim()) {
    const kw = escapeRegex(q.trim());
    filter.$or = [
      { title: { $regex: kw, $options: "i" } },
      { company: { $regex: kw, $options: "i" } },
      { description: { $regex: kw, $options: "i" } },
      { skills: { $in: [new RegExp(kw, "i")] } },
    ];
  }

  if (status && status !== "ALL") {
    filter.status = status;
  }

  if (workMode && workMode !== "ALL") {
    filter.workMode = { $regex: `^${escapeRegex(workMode)}$`, $options: "i" };
  }

  if (jobType && jobType !== "ALL") {
    filter.jobType = { $regex: `^${escapeRegex(jobType)}$`, $options: "i" };
  }

  if (category && category !== "ALL") {
    filter.category = { $regex: escapeRegex(category), $options: "i" };
  }

  if (recruiterId && recruiterId !== "ALL") {
    filter.postedBy = recruiterId;
  }

  let sortOption = { createdAt: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };
  if (sort === "title") sortOption = { title: 1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate("postedBy", "name email role")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Job.countDocuments(filter),
  ]);

  // Aggregate application count
  const jobIds = jobs.map((j) => j._id);
  const appCounts = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: "$job", count: { $sum: 1 } } },
  ]);

  const appCountMap = {};
  appCounts.forEach((ac) => {
    appCountMap[ac._id.toString()] = ac.count;
  });

  const enrichedJobs = jobs.map((j) => ({
    ...j,
    status: j.status || "PUBLISHED",
    applicantCount: appCountMap[j._id.toString()] || 0,
  }));

  return {
    jobs: enrichedJobs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Get single job by ID with recruiter and full application stats
 */
async function getAdminJobById(jobId) {
  const job = await Job.findById(jobId).populate("postedBy", "name email phone location avatar").lean();
  if (!job) {
    const error = new Error("Job not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const applications = await Application.find({ job: jobId }).select("status").lean();
  const applicantCount = applications.length;

  return {
    ...job,
    status: job.status || "PUBLISHED",
    applicantCount,
  };
}

/**
 * Moderate job publication status (DRAFT, PUBLISHED, CLOSED, ARCHIVED)
 */
async function moderateJobStatus(jobId, newStatus, note = "", adminUser) {
  if (!JOB_MODERATION_STATUSES.includes(newStatus)) {
    const error = new Error(`Invalid status. Allowed: ${JOB_MODERATION_STATUSES.join(", ")}`);
    error.status = 400;
    error.code = "INVALID_STATUS";
    throw error;
  }

  const job = await Job.findById(jobId);
  if (!job) {
    const error = new Error("Job not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const oldStatus = job.status || "PUBLISHED";
  job.status = newStatus;
  await job.save();

  // Log audit
  await logAuditEvent({
    actor: adminUser._id,
    actorName: adminUser.name,
    actorEmail: adminUser.email,
    actorRole: "ADMIN",
    action: AUDIT_ACTIONS.JOB_MODERATED,
    entityType: AUDIT_ENTITY_TYPES.JOB,
    entityId: job._id,
    summary: `Moderated job "${job.title}" at ${job.company} from ${oldStatus} to ${newStatus}`,
    metadata: {
      jobId: job._id,
      title: job.title,
      company: job.company,
      oldStatus,
      newStatus,
      note,
    },
  });

  return {
    job,
    message: `Job status moderated to ${newStatus}`,
  };
}

module.exports = {
  getAdminJobs,
  getAdminJobById,
  moderateJobStatus,
};
