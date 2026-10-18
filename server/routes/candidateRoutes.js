const express = require("express");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
} = require("../controllers/candidateProfileController");
const {
  getCandidateSkillsHandler,
} = require("../controllers/skillIntelligenceController");
const {
  getJobMatchHandler,
} = require("../controllers/jobMatchingController");
const {
  getCareerIntelligenceHandler,
} = require("../controllers/careerIntelligenceController");
const {
  getRecommendedJobsHandler,
} = require("../controllers/jobDiscoveryController");
const {
  saveJobHandler,
  unsaveJobHandler,
  getSavedJobsHandler,
  getSavedJobStatusHandler,
} = require("../controllers/savedJobController");
const {
  getCandidateApplicationsHandler,
  getCandidateApplicationByIdHandler,
  withdrawCandidateApplicationHandler,
} = require("../controllers/candidateApplicationController");
const {
  getNotificationsHandler,
  getUnreadCountHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
} = require("../controllers/notificationController");
const messageController = require("../controllers/messageController");
const resumeRoutes = require("./resumeRoutes");

const router = express.Router();

// ==========================================
// Phase 4N: Candidate Messaging Routes
// ==========================================
router.get("/conversations", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), messageController.listConversations);
router.get("/messages/unread-count", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), messageController.getUnreadCount);

// ==========================================
// Phase 4J: Saved Jobs & Pipeline Routes
// ==========================================
/**
 * @route   POST /api/candidate/saved-jobs/:jobId
 * @desc    Bookmark a job for candidate
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.post("/saved-jobs/:jobId", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), saveJobHandler);

/**
 * @route   DELETE /api/candidate/saved-jobs/:jobId
 * @desc    Remove a bookmarked job
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.delete("/saved-jobs/:jobId", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), unsaveJobHandler);

/**
 * @route   GET /api/candidate/saved-jobs
 * @desc    Get candidate's saved jobs list
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.get("/saved-jobs", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), getSavedJobsHandler);

/**
 * @route   GET /api/candidate/saved-jobs/:jobId/status
 * @desc    Check if a job is bookmarked
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.get("/saved-jobs/:jobId/status", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), getSavedJobStatusHandler);

/**
 * @route   GET /api/candidate/applications
 * @desc    Get candidate's submitted applications with pipeline metrics
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.get("/applications", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), getCandidateApplicationsHandler);

/**
 * @route   GET /api/candidate/applications/:id
 * @desc    Get detailed application record with factual timeline
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.get("/applications/:id", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), getCandidateApplicationByIdHandler);

/**
 * @route   PATCH /api/candidate/applications/:id/withdraw
 * @desc    Withdraw an active candidate application
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.patch("/applications/:id/withdraw", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), withdrawCandidateApplicationHandler);

// ==========================================
// Phase 4I: Job Discovery Route
// ==========================================
/**
 * @route   GET /api/candidate/jobs/recommended
 * @desc    Get deterministic recommended jobs based on candidate profile, skills, & filters
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.get("/jobs/recommended", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), getRecommendedJobsHandler);

// ==========================================
// Phase 4H: Career Intelligence Route
// ==========================================
/**
 * @route   GET /api/candidate/career-intelligence
 * @desc    Get aggregated Career Intelligence snapshot for candidate
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.get("/career-intelligence", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), getCareerIntelligenceHandler);

// ==========================================
// Phase 4G: Job Matching Route
// ==========================================
/**
 * @route   GET /api/candidate/jobs/:jobId/match
 * @desc    Get deterministic explainable job match evaluation for candidate
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.get("/jobs/:jobId/match", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), getJobMatchHandler);

// ==========================================
// Phase 4F: Skill Intelligence Route
// ==========================================
/**
 * @route   GET /api/candidate/skills
 * @desc    Get candidate-wide skill intelligence profile
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.get("/skills", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), getCandidateSkillsHandler);

// ==========================================
// Phase 4A: Candidate Profile Routes
// ==========================================
/**
 * @route   GET /api/candidate/profile
 * @desc    Get authenticated candidate's profile
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.get("/profile", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), getProfile);

/**
 * @route   PUT /api/candidate/profile
 * @desc    Update authenticated candidate's profile
 * @access  Private (JOB_SEEKER, ADMIN)
 */
router.put("/profile", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), updateProfile);

/**
 * @route   /api/candidate/resumes
 * @desc    Candidate Resume Management routes
 */
router.use("/resumes", resumeRoutes);

// ==========================================
// Phase 4K: Candidate Notification Routes
// ==========================================
router.get("/notifications", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), getNotificationsHandler);
router.get("/notifications/unread-count", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), getUnreadCountHandler);
router.patch("/notifications/:id/read", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), markNotificationReadHandler);
router.patch("/notifications/read-all", requireAuth, requireRole("JOB_SEEKER", "ADMIN"), markAllNotificationsReadHandler);

module.exports = router;
