const express = require("express");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
  setPrimaryResume,
  updateResumeContent,
  updateResumeTemplate,
  importProfileToResume,
  analyzeResumeHandler,
} = require("../controllers/resumeController");
const {
  getResumeSkillsHandler,
  getResumeSkillGapHandler,
} = require("../controllers/skillIntelligenceController");

const router = express.Router();

// All resume routes require authentication and candidate role
router.use(requireAuth);
router.use(requireRole("JOB_SEEKER", "ADMIN"));

/**
 * @route   GET /api/candidate/resumes
 * @desc    Get all resumes of candidate
 */
router.get("/", getResumes);

/**
 * @route   POST /api/candidate/resumes
 * @desc    Create new resume (max 5)
 */
router.post("/", createResume);

/**
 * @route   GET /api/candidate/resumes/:id/analyze
 * @desc    Get deterministic, explainable analysis of resume content
 */
router.get("/:id/analyze", analyzeResumeHandler);

/**
 * @route   GET /api/candidate/resumes/:id/skills
 * @desc    Get normalized skill intelligence for a specific resume
 */
router.get("/:id/skills", getResumeSkillsHandler);

/**
 * @route   GET /api/candidate/resumes/:resumeId/skills/gap/:jobId
 * @desc    Get explainable deterministic skill gap against a target job
 */
router.get("/:resumeId/skills/gap/:jobId", getResumeSkillGapHandler);

/**
 * @route   GET /api/candidate/resumes/:id
 * @desc    Get single resume details (including full structured content)
 */
router.get("/:id", getResumeById);

/**
 * @route   PUT /api/candidate/resumes/:id
 * @desc    Update resume metadata (title, template, status)
 */
router.put("/:id", updateResume);

/**
 * @route   DELETE /api/candidate/resumes/:id
 * @desc    Delete resume (safely re-promotes primary if needed)
 */
router.delete("/:id", deleteResume);

/**
 * @route   POST /api/candidate/resumes/:id/duplicate
 * @desc    Duplicate resume (max 5)
 */
router.post("/:id/duplicate", duplicateResume);

/**
 * @route   PATCH /api/candidate/resumes/:id/primary
 * @desc    Set resume as single primary
 */
router.patch("/:id/primary", setPrimaryResume);

/**
 * @route   PUT /api/candidate/resumes/:id/content
 * @desc    Update structured resume content (increments version)
 */
router.put("/:id/content", updateResumeContent);

/**
 * @route   PATCH /api/candidate/resumes/:id/template
 * @desc    Update resume template layout without mutating content
 */
router.patch("/:id/template", updateResumeTemplate);

/**
 * @route   POST /api/candidate/resumes/:id/import-profile
 * @desc    Snapshot copy candidate profile into resume content
 */
router.post("/:id/import-profile", importProfileToResume);

module.exports = router;

