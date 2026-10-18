const recruiterDashboardService = require("../services/recruiter/recruiterDashboardService");
const recruiterJobService = require("../services/recruiter/recruiterJobService");
const recruiterApplicationService = require("../services/recruiter/recruiterApplicationService");
const companyProfileService = require("../services/recruiter/companyProfileService");

/**
 * GET /api/recruiter/dashboard
 */
async function getDashboardHandler(req, res, next) {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const data = await recruiterDashboardService.getRecruiterDashboardMetrics(
      req.user._id,
      isAdmin
    );
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/recruiter/jobs
 */
async function getJobsHandler(req, res, next) {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const data = await recruiterJobService.getRecruiterJobs(
      req.user._id,
      req.query,
      isAdmin
    );
    res.json({
      success: true,
      data: data.jobs,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/recruiter/jobs/:id
 */
async function getJobByIdHandler(req, res, next) {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const job = await recruiterJobService.getRecruiterJobById(
      req.params.id,
      req.user._id,
      isAdmin
    );
    res.json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/recruiter/jobs
 */
async function createJobHandler(req, res, next) {
  try {
    const job = await recruiterJobService.createRecruiterJob(
      req.user._id,
      req.body
    );
    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/recruiter/jobs/:id
 */
async function updateJobHandler(req, res, next) {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const job = await recruiterJobService.updateRecruiterJob(
      req.params.id,
      req.user._id,
      req.body,
      isAdmin
    );
    res.json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/recruiter/jobs/:id/status
 */
async function updateJobStatusHandler(req, res, next) {
  try {
    const { status } = req.body;
    const isAdmin = req.user.role === "ADMIN";
    const job = await recruiterJobService.updateJobStatus(
      req.params.id,
      req.user._id,
      status,
      isAdmin
    );
    res.json({
      success: true,
      message: `Job publication status updated to ${status}`,
      job,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/recruiter/jobs/:id
 */
async function deleteJobHandler(req, res, next) {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const result = await recruiterJobService.deleteRecruiterJob(
      req.params.id,
      req.user._id,
      isAdmin
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/recruiter/jobs/:jobId/applications
 */
async function getJobApplicationsHandler(req, res, next) {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const data = await recruiterApplicationService.getJobApplications(
      req.params.jobId,
      req.user._id,
      req.query,
      isAdmin
    );
    res.json({
      success: true,
      job: data.job,
      applications: data.applications,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/recruiter/applications
 */
async function getAllApplicationsHandler(req, res, next) {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const data = await recruiterApplicationService.getAllRecruiterApplications(
      req.user._id,
      req.query,
      isAdmin
    );
    res.json({
      success: true,
      applications: data.applications,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/recruiter/applications/:id
 */
async function getApplicationByIdHandler(req, res, next) {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const application = await recruiterApplicationService.getRecruiterApplicationById(
      req.params.id,
      req.user._id,
      isAdmin
    );
    res.json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/recruiter/applications/:id/status
 */
async function updateApplicationStatusHandler(req, res, next) {
  try {
    const { status, note } = req.body;
    const result = await recruiterApplicationService.updateRecruiterApplicationStatus(
      req.params.id,
      req.user._id,
      req.user.role,
      status,
      note
    );
    res.json({
      success: true,
      message: result.message,
      changed: result.changed,
      application: result.application,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/recruiter/company
 */
async function getCompanyProfileHandler(req, res, next) {
  try {
    const profile = await companyProfileService.getCompanyProfile(req.user._id);
    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/recruiter/company
 */
async function updateCompanyProfileHandler(req, res, next) {
  try {
    const profile = await companyProfileService.upsertCompanyProfile(
      req.user._id,
      req.body
    );
    res.json({
      success: true,
      message: "Company profile updated successfully",
      profile,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardHandler,
  getJobsHandler,
  getJobByIdHandler,
  createJobHandler,
  updateJobHandler,
  updateJobStatusHandler,
  deleteJobHandler,
  getJobApplicationsHandler,
  getAllApplicationsHandler,
  getApplicationByIdHandler,
  updateApplicationStatusHandler,
  getCompanyProfileHandler,
  updateCompanyProfileHandler,
};
