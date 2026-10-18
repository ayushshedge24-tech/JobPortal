const adminDashboardService = require("../services/admin/adminDashboardService");
const adminUserService = require("../services/admin/adminUserService");
const adminJobService = require("../services/admin/adminJobService");
const adminApplicationService = require("../services/admin/adminApplicationService");
const adminReportService = require("../services/admin/adminReportService");
const adminAuditService = require("../services/admin/adminAuditService");

/**
 * GET /api/admin/dashboard
 */
async function getDashboardHandler(req, res, next) {
  try {
    const data = await adminDashboardService.getAdminDashboardMetrics();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/users
 */
async function getUsersHandler(req, res, next) {
  try {
    const data = await adminUserService.getUsers(req.query);
    res.json({
      success: true,
      data: data.users,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/users/:id
 */
async function getUserByIdHandler(req, res, next) {
  try {
    const data = await adminUserService.getUserById(req.params.id);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/users/:id/role
 */
async function updateUserRoleHandler(req, res, next) {
  try {
    const { role } = req.body;
    const user = await adminUserService.updateUserRole(req.params.id, role, req.user);
    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/users/:id/status
 */
async function updateUserStatusHandler(req, res, next) {
  try {
    const { isActive, reason } = req.body;
    const user = await adminUserService.updateUserStatus(
      req.params.id,
      isActive,
      reason,
      req.user
    );
    res.json({
      success: true,
      message: `User account ${user.isActive ? "activated" : "deactivated"}`,
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/jobs
 */
async function getJobsHandler(req, res, next) {
  try {
    const data = await adminJobService.getAdminJobs(req.query);
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
 * GET /api/admin/jobs/:id
 */
async function getJobByIdHandler(req, res, next) {
  try {
    const job = await adminJobService.getAdminJobById(req.params.id);
    res.json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/jobs/:id/status
 */
async function moderateJobStatusHandler(req, res, next) {
  try {
    const { status, note } = req.body;
    const result = await adminJobService.moderateJobStatus(
      req.params.id,
      status,
      note,
      req.user
    );
    res.json({
      success: true,
      message: result.message,
      job: result.job,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/applications
 */
async function getApplicationsHandler(req, res, next) {
  try {
    const data = await adminApplicationService.getAdminApplications(req.query);
    res.json({
      success: true,
      data: data.applications,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/applications/:id
 */
async function getApplicationByIdHandler(req, res, next) {
  try {
    const application = await adminApplicationService.getAdminApplicationById(req.params.id);
    res.json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/applications/:id/status
 */
async function moderateApplicationStatusHandler(req, res, next) {
  try {
    const { status, note } = req.body;
    const result = await adminApplicationService.moderateApplicationStatus(
      req.params.id,
      status,
      note,
      req.user
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
 * GET /api/admin/reports
 */
async function getReportsHandler(req, res, next) {
  try {
    const reports = await adminReportService.getAdminReports();
    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/audit-logs
 */
async function getAuditLogsHandler(req, res, next) {
  try {
    const data = await adminAuditService.getAuditLogs(req.query);
    res.json({
      success: true,
      data: data.logs,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardHandler,
  getUsersHandler,
  getUserByIdHandler,
  updateUserRoleHandler,
  updateUserStatusHandler,
  getJobsHandler,
  getJobByIdHandler,
  moderateJobStatusHandler,
  getApplicationsHandler,
  getApplicationByIdHandler,
  moderateApplicationStatusHandler,
  getReportsHandler,
  getAuditLogsHandler,
};
