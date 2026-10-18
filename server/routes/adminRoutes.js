const express = require("express");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Strict Admin RBAC
router.use(requireAuth, requireRole("ADMIN"));

// Dashboard
router.get("/dashboard", adminController.getDashboardHandler);

// Users & Roles
router.get("/users", adminController.getUsersHandler);
router.get("/users/:id", adminController.getUserByIdHandler);
router.patch("/users/:id/role", adminController.updateUserRoleHandler);
router.patch("/users/:id/status", adminController.updateUserStatusHandler);

// Jobs Moderation
router.get("/jobs", adminController.getJobsHandler);
router.get("/jobs/:id", adminController.getJobByIdHandler);
router.patch("/jobs/:id/status", adminController.moderateJobStatusHandler);

// Applications Oversight
router.get("/applications", adminController.getApplicationsHandler);
router.get("/applications/:id", adminController.getApplicationByIdHandler);
router.patch("/applications/:id/status", adminController.moderateApplicationStatusHandler);

// Reports
router.get("/reports", adminController.getReportsHandler);

// Audit Logs
router.get("/audit-logs", adminController.getAuditLogsHandler);

module.exports = router;
