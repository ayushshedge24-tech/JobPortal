const Job = require("../../models/Job");
const Application = require("../../models/Application");
const { JOB_STATUSES } = require("./recruiterConstants");

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * List recruiter-owned jobs with filtering, sorting, pagination, and application metrics
 */
async function getRecruiterJobs(userId, query = {}, isAdmin = false) {
  const {
    q,
    status,
    workMode,
    jobType,
    category,
    sort = "newest",
    page = 1,
    limit = 20,
  } = query;

  const filter = isAdmin ? {} : { postedBy: userId };

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
    if (status === "PUBLISHED") {
      filter.$or = [{ status: "PUBLISHED" }, { status: { $exists: false } }];
    } else {
      filter.status = status;
    }
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

  let sortOption = { createdAt: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };
  if (sort === "title") sortOption = { title: 1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
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

  // Aggregate application counts for each returned job
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
 * Get single recruiter job with ownership verification and detailed metrics
 */
async function getRecruiterJobById(jobId, userId, isAdmin = false) {
  const job = await Job.findById(jobId).populate("postedBy", "name email role").lean();
  if (!job) {
    const error = new Error("Job not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const isOwner = job.postedBy && (job.postedBy._id || job.postedBy).toString() === userId.toString();
  if (!isOwner && !isAdmin) {
    const error = new Error("Access denied. You do not own this job listing.");
    error.status = 403;
    error.code = "FORBIDDEN_OWNERSHIP";
    throw error;
  }

  // Get application count by status for this job
  const applications = await Application.find({ job: jobId }).select("status").lean();
  const applicantCount = applications.length;

  return {
    ...job,
    status: job.status || "PUBLISHED",
    applicantCount,
  };
}

/**
 * Create a new job listing for authenticated recruiter
 */
async function createRecruiterJob(userId, data) {
  const {
    title,
    company,
    location,
    workMode = "Hybrid",
    experience = "1-3 years",
    category = "Software Development",
    description,
    salary = "Competitive LPA",
    jobType = "Full-time",
    skills = [],
    benefits = [],
    status = "PUBLISHED",
  } = data;

  if (!title || !company || !location || !description) {
    const error = new Error("Title, company, location, and description are required.");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const skillsArr = Array.isArray(skills)
    ? skills.map((s) => String(s).trim()).filter(Boolean)
    : typeof skills === "string"
    ? skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const benefitsArr = Array.isArray(benefits)
    ? benefits.map((b) => String(b).trim()).filter(Boolean)
    : typeof benefits === "string"
    ? benefits.split(",").map((b) => b.trim()).filter(Boolean)
    : [];

  const validStatuses = Object.values(JOB_STATUSES);
  const jobStatus = validStatuses.includes(status) ? status : "PUBLISHED";

  const job = await Job.create({
    title: String(title).trim(),
    company: String(company).trim(),
    location: String(location).trim(),
    workMode,
    experience,
    category,
    description: String(description).trim(),
    salary: String(salary).trim(),
    jobType,
    skills: skillsArr,
    benefits: benefitsArr,
    status: jobStatus,
    postedBy: userId,
  });

  return job;
}

/**
 * Update recruiter job with ownership verification
 */
async function updateRecruiterJob(jobId, userId, data, isAdmin = false) {
  const job = await Job.findById(jobId);
  if (!job) {
    const error = new Error("Job not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const isOwner = job.postedBy && job.postedBy.toString() === userId.toString();
  if (!isOwner && !isAdmin) {
    const error = new Error("Access denied. You can only edit jobs you posted.");
    error.status = 403;
    error.code = "FORBIDDEN_OWNERSHIP";
    throw error;
  }

  // Prevent mass-assignment tampering of postedBy
  const updates = { ...data };
  delete updates.postedBy;
  delete updates._id;

  if (updates.skills) {
    updates.skills = Array.isArray(updates.skills)
      ? updates.skills.map((s) => String(s).trim()).filter(Boolean)
      : typeof updates.skills === "string"
      ? updates.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : job.skills;
  }

  if (updates.benefits) {
    updates.benefits = Array.isArray(updates.benefits)
      ? updates.benefits.map((b) => String(b).trim()).filter(Boolean)
      : typeof updates.benefits === "string"
      ? updates.benefits.split(",").map((b) => b.trim()).filter(Boolean)
      : job.benefits;
  }

  const updatedJob = await Job.findByIdAndUpdate(jobId, updates, {
    new: true,
    runValidators: true,
  });

  return updatedJob;
}

/**
 * Update job publication status
 */
async function updateJobStatus(jobId, userId, status, isAdmin = false) {
  const validStatuses = Object.values(JOB_STATUSES);
  if (!validStatuses.includes(status)) {
    const error = new Error(`Invalid status. Allowed: ${validStatuses.join(", ")}`);
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

  const isOwner = job.postedBy && job.postedBy.toString() === userId.toString();
  if (!isOwner && !isAdmin) {
    const error = new Error("Access denied. You can only modify your own jobs.");
    error.status = 403;
    error.code = "FORBIDDEN_OWNERSHIP";
    throw error;
  }

  job.status = status;
  await job.save();

  return job;
}

/**
 * Delete or archive recruiter job
 */
async function deleteRecruiterJob(jobId, userId, isAdmin = false) {
  const job = await Job.findById(jobId);
  if (!job) {
    const error = new Error("Job not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const isOwner = job.postedBy && job.postedBy.toString() === userId.toString();
  if (!isOwner && !isAdmin) {
    const error = new Error("Access denied. You can only delete your own jobs.");
    error.status = 403;
    error.code = "FORBIDDEN_OWNERSHIP";
    throw error;
  }

  await Job.findByIdAndDelete(jobId);
  return { success: true, message: "Job deleted successfully" };
}

module.exports = {
  getRecruiterJobs,
  getRecruiterJobById,
  createRecruiterJob,
  updateRecruiterJob,
  updateJobStatus,
  deleteRecruiterJob,
};
