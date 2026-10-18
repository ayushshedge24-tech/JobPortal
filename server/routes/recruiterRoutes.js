const express = require("express");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const recruiterController = require("../controllers/recruiterController");
const messageController = require("../controllers/messageController");

const router = express.Router();

// Strict RBAC middleware: only RECRUITER, ADMIN, or legacy employer role
router.use(requireAuth, requireRole("RECRUITER", "ADMIN", "employer"));

// Messaging
router.get("/conversations", messageController.listConversations);
router.get("/messages/unread-count", messageController.getUnreadCount);

// Dashboard
router.get("/dashboard", recruiterController.getDashboardHandler);

// Jobs Management
router.get("/jobs", recruiterController.getJobsHandler);
router.post("/jobs", recruiterController.createJobHandler);
router.get("/jobs/:id", recruiterController.getJobByIdHandler);
router.put("/jobs/:id", recruiterController.updateJobHandler);
router.patch("/jobs/:id/status", recruiterController.updateJobStatusHandler);
router.delete("/jobs/:id", recruiterController.deleteJobHandler);

// Applications / ATS Pipeline
router.get("/jobs/:jobId/applications", recruiterController.getJobApplicationsHandler);
router.get("/applications", recruiterController.getAllApplicationsHandler);
router.get("/applications/:id", recruiterController.getApplicationByIdHandler);
router.patch("/applications/:id/status", recruiterController.updateApplicationStatusHandler);

// Company Profile
router.get("/company", recruiterController.getCompanyProfileHandler);
router.put("/company", recruiterController.updateCompanyProfileHandler);

module.exports = router;
