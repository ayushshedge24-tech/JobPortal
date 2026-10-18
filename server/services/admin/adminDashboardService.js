const User = require("../../models/User");
const Job = require("../../models/Job");
const Application = require("../../models/Application");
const AuditLog = require("../../models/AuditLog");
const { normalizeStatus, ATS_STATUSES } = require("../recruiter/recruiterConstants");

/**
 * Computes factual platform-wide SaaS operations metrics.
 * Strictly zero synthetic AI/health scores.
 */
async function getAdminDashboardMetrics() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    users,
    jobs,
    applications,
    recentUsers,
    recentJobs,
    recentApplications,
    recentAudits,
  ] = await Promise.all([
    User.find({}).select("role isActive createdAt").lean(),
    Job.find({}).select("status createdAt").lean(),
    Application.find({}).select("status createdAt").lean(),
    User.find({}).select("name email role isActive createdAt avatar").sort({ createdAt: -1 }).limit(5).lean(),
    Job.find({}).populate("postedBy", "name email").sort({ createdAt: -1 }).limit(5).lean(),
    Application.find({}).populate("applicant", "name email").populate("job", "title company").sort({ createdAt: -1 }).limit(5).lean(),
    AuditLog.find({}).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  // Compute User tallies
  const totalUsers = users.length;
  let candidatesCount = 0;
  let recruitersCount = 0;
  let adminsCount = 0;
  let activeUsersCount = 0;
  let newUsersToday = 0;
  let newUsersThisWeek = 0;

  users.forEach((u) => {
    const r = u.role === "jobseeker" ? "JOB_SEEKER" : u.role === "employer" ? "RECRUITER" : u.role;
    if (r === "JOB_SEEKER") candidatesCount++;
    else if (r === "RECRUITER") recruitersCount++;
    else if (r === "ADMIN") adminsCount++;

    if (u.isActive !== false) activeUsersCount++;

    if (u.createdAt >= startOfToday) newUsersToday++;
    if (u.createdAt >= startOfWeek) newUsersThisWeek++;
  });

  // Compute Job tallies
  const totalJobs = jobs.length;
  let activeJobs = 0;
  let draftJobs = 0;
  let closedJobs = 0;
  let newJobsToday = 0;
  let newJobsThisWeek = 0;

  jobs.forEach((j) => {
    const s = j.status || "PUBLISHED";
    if (s === "PUBLISHED") activeJobs++;
    else if (s === "DRAFT") draftJobs++;
    else if (s === "CLOSED" || s === "ARCHIVED") closedJobs++;

    if (j.createdAt >= startOfToday) newJobsToday++;
    if (j.createdAt >= startOfWeek) newJobsThisWeek++;
  });

  // Compute Application tallies
  const totalApplications = applications.length;
  const statusCounts = {
    [ATS_STATUSES.APPLIED]: 0,
    [ATS_STATUSES.UNDER_REVIEW]: 0,
    [ATS_STATUSES.SHORTLISTED]: 0,
    [ATS_STATUSES.INTERVIEW]: 0,
    [ATS_STATUSES.OFFER]: 0,
    [ATS_STATUSES.REJECTED]: 0,
    [ATS_STATUSES.WITHDRAWN]: 0,
  };
  let newAppsToday = 0;
  let newAppsThisWeek = 0;

  applications.forEach((app) => {
    const norm = normalizeStatus(app.status);
    if (statusCounts[norm] !== undefined) {
      statusCounts[norm]++;
    }
    if (app.createdAt >= startOfToday) newAppsToday++;
    if (app.createdAt >= startOfWeek) newAppsThisWeek++;
  });

  return {
    overview: {
      users: {
        total: totalUsers,
        candidates: candidatesCount,
        recruiters: recruitersCount,
        admins: adminsCount,
        active: activeUsersCount,
        inactive: totalUsers - activeUsersCount,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        draft: draftJobs,
        closed: closedJobs,
        newToday: newJobsToday,
        newThisWeek: newJobsThisWeek,
      },
      applications: {
        total: totalApplications,
        applied: statusCounts[ATS_STATUSES.APPLIED] || 0,
        underReview: statusCounts[ATS_STATUSES.UNDER_REVIEW] || 0,
        shortlisted: statusCounts[ATS_STATUSES.SHORTLISTED] || 0,
        interview: statusCounts[ATS_STATUSES.INTERVIEW] || 0,
        offer: statusCounts[ATS_STATUSES.OFFER] || 0,
        rejected: statusCounts[ATS_STATUSES.REJECTED] || 0,
        withdrawn: statusCounts[ATS_STATUSES.WITHDRAWN] || 0,
        newToday: newAppsToday,
        newThisWeek: newAppsThisWeek,
      },
    },
    recentActivity: {
      recentUsers: recentUsers.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role === "jobseeker" ? "JOB_SEEKER" : u.role === "employer" ? "RECRUITER" : u.role,
        isActive: u.isActive !== false,
        createdAt: u.createdAt,
      })),
      recentJobs: recentJobs.map((j) => ({
        _id: j._id,
        title: j.title,
        company: j.company,
        status: j.status || "PUBLISHED",
        postedBy: j.postedBy ? { name: j.postedBy.name, email: j.postedBy.email } : null,
        createdAt: j.createdAt,
      })),
      recentApplications: recentApplications.map((a) => ({
        _id: a._id,
        applicantName: a.applicant?.name || "Candidate",
        applicantEmail: a.applicant?.email || "",
        jobTitle: a.job?.title || "Role",
        company: a.job?.company || "Company",
        status: normalizeStatus(a.status),
        createdAt: a.createdAt,
      })),
      recentAudits: recentAudits.map((l) => ({
        _id: l._id,
        action: l.action,
        actorName: l.actorName,
        entityType: l.entityType,
        summary: l.summary,
        createdAt: l.createdAt,
      })),
    },
  };
}

module.exports = {
  getAdminDashboardMetrics,
};
