const User = require("../../models/User");
const Job = require("../../models/Job");
const Application = require("../../models/Application");
const { normalizeStatus, ATS_STATUSES } = require("../recruiter/recruiterConstants");

/**
 * Generate factual database-backed SaaS operational reports
 */
async function getAdminReports() {
  const [users, jobs, applications] = await Promise.all([
    User.find({}).select("role isActive createdAt").lean(),
    Job.find({}).select("status category workMode jobType createdAt").lean(),
    Application.find({}).select("status createdAt").lean(),
  ]);

  // 1. Users by Role
  const usersByRole = {
    JOB_SEEKER: 0,
    RECRUITER: 0,
    ADMIN: 0,
  };
  users.forEach((u) => {
    const r = u.role === "jobseeker" ? "JOB_SEEKER" : u.role === "employer" ? "RECRUITER" : u.role;
    if (usersByRole[r] !== undefined) usersByRole[r]++;
  });

  // 2. Jobs by Status
  const jobsByStatus = {
    PUBLISHED: 0,
    DRAFT: 0,
    CLOSED: 0,
    ARCHIVED: 0,
  };
  jobs.forEach((j) => {
    const s = j.status || "PUBLISHED";
    if (jobsByStatus[s] !== undefined) jobsByStatus[s]++;
  });

  // 3. Jobs by Category
  const jobsByCategory = {};
  jobs.forEach((j) => {
    const cat = j.category || "General";
    jobsByCategory[cat] = (jobsByCategory[cat] || 0) + 1;
  });

  // 4. Jobs by WorkMode
  const jobsByWorkMode = {
    Hybrid: 0,
    Remote: 0,
    "On-site": 0,
  };
  jobs.forEach((j) => {
    const wm = j.workMode || "Hybrid";
    if (jobsByWorkMode[wm] !== undefined) jobsByWorkMode[wm]++;
    else jobsByWorkMode[wm] = 1;
  });

  // 5. Applications by Status
  const applicationsByStatus = {
    [ATS_STATUSES.APPLIED]: 0,
    [ATS_STATUSES.UNDER_REVIEW]: 0,
    [ATS_STATUSES.SHORTLISTED]: 0,
    [ATS_STATUSES.INTERVIEW]: 0,
    [ATS_STATUSES.OFFER]: 0,
    [ATS_STATUSES.REJECTED]: 0,
    [ATS_STATUSES.WITHDRAWN]: 0,
  };
  applications.forEach((a) => {
    const norm = normalizeStatus(a.status);
    if (applicationsByStatus[norm] !== undefined) applicationsByStatus[norm]++;
  });

  return {
    usersByRole,
    jobsByStatus,
    jobsByCategory,
    jobsByWorkMode,
    applicationsByStatus,
    totalUsers: users.length,
    totalJobs: jobs.length,
    totalApplications: applications.length,
  };
}

module.exports = {
  getAdminReports,
};
