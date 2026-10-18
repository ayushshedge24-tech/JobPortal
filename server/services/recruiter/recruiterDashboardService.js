const Job = require("../../models/Job");
const Application = require("../../models/Application");
const { normalizeStatus, ATS_STATUSES } = require("./recruiterConstants");

/**
 * Computes factual database metrics for the recruiter dashboard.
 * Zero synthetic analytics.
 */
async function getRecruiterDashboardMetrics(userId, isAdmin = false) {
  const jobFilter = isAdmin ? {} : { postedBy: userId };

  // Fetch all recruiter-owned jobs
  const jobs = await Job.find(jobFilter).select("_id title company location status createdAt").lean();
  const jobIds = jobs.map((j) => j._id);

  // Compute job metrics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => !j.status || j.status === "PUBLISHED").length;
  const draftJobs = jobs.filter((j) => j.status === "DRAFT").length;
  const closedJobs = jobs.filter((j) => j.status === "CLOSED" || j.status === "ARCHIVED").length;

  // Fetch all applications across recruiter jobs
  const applications = await Application.find({ job: { $in: jobIds } })
    .populate("applicant", "name email phone location avatar")
    .populate("job", "title company location status")
    .sort({ createdAt: -1 })
    .lean();

  const totalApplications = applications.length;

  // Breakdown applications by normalized status
  const statusCounts = {
    [ATS_STATUSES.APPLIED]: 0,
    [ATS_STATUSES.UNDER_REVIEW]: 0,
    [ATS_STATUSES.SHORTLISTED]: 0,
    [ATS_STATUSES.INTERVIEW]: 0,
    [ATS_STATUSES.OFFER]: 0,
    [ATS_STATUSES.REJECTED]: 0,
    [ATS_STATUSES.WITHDRAWN]: 0,
  };

  const applicationsByJobMap = {};
  jobIds.forEach((id) => {
    applicationsByJobMap[id.toString()] = 0;
  });

  applications.forEach((app) => {
    const norm = normalizeStatus(app.status);
    if (statusCounts[norm] !== undefined) {
      statusCounts[norm]++;
    }
    const jId = app.job?._id ? app.job._id.toString() : app.job ? app.job.toString() : null;
    if (jId && applicationsByJobMap[jId] !== undefined) {
      applicationsByJobMap[jId]++;
    }
  });

  // Recent 5 applications
  const recentApplications = applications.slice(0, 6).map((app) => ({
    _id: app._id,
    jobId: app.job?._id || app.job,
    jobTitle: app.job?.title || "Role",
    company: app.job?.company || "Company",
    candidateName: app.applicant?.name || app.applicantName || "Candidate",
    candidateEmail: app.applicant?.email || app.applicantEmail || "",
    candidateLocation: app.applicant?.location || app.currentLocation || "",
    candidateAvatar: app.applicant?.avatar || "",
    status: normalizeStatus(app.status),
    appliedAt: app.createdAt,
    hasResume: Boolean(app.resume || app.resumeId),
  }));

  // Top/recent jobs with application counts
  const recentJobs = jobs.slice(0, 5).map((job) => ({
    _id: job._id,
    title: job.title,
    company: job.company,
    location: job.location,
    status: job.status || "PUBLISHED",
    createdAt: job.createdAt,
    applicantCount: applicationsByJobMap[job._id.toString()] || 0,
  }));

  return {
    jobs: {
      total: totalJobs,
      active: activeJobs,
      draft: draftJobs,
      closed: closedJobs,
    },
    applications: {
      total: totalApplications,
      requiringAttention: (statusCounts[ATS_STATUSES.APPLIED] || 0) + (statusCounts[ATS_STATUSES.UNDER_REVIEW] || 0),
      applied: statusCounts[ATS_STATUSES.APPLIED] || 0,
      underReview: statusCounts[ATS_STATUSES.UNDER_REVIEW] || 0,
      shortlisted: statusCounts[ATS_STATUSES.SHORTLISTED] || 0,
      interview: statusCounts[ATS_STATUSES.INTERVIEW] || 0,
      offer: statusCounts[ATS_STATUSES.OFFER] || 0,
      rejected: statusCounts[ATS_STATUSES.REJECTED] || 0,
      withdrawn: statusCounts[ATS_STATUSES.WITHDRAWN] || 0,
    },
    recentApplications,
    recentJobs,
  };
}

module.exports = {
  getRecruiterDashboardMetrics,
};
