/**
 * Skill Intelligence Controller
 * JobPortal 2.0 — Phase 4F Deterministic Skill Intelligence
 */

const Resume = require("../models/Resume");
const CandidateProfile = require("../models/CandidateProfile");
const Job = require("../models/Job");
const {
  analyzeResumeSkills,
  analyzeResumeSkillGapAgainstJob,
  buildCandidateSkillProfile,
  SKILL_INTELLIGENCE_VERSION,
} = require("../services/skillIntelligence");

/**
 * @desc    Get candidate-wide skill intelligence profile (from primary resume or candidate profile)
 * @route   GET /api/candidate/skills
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const getCandidateSkillsHandler = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Try to find primary resume first
    let resume = await Resume.findOne({ user: userId, isPrimary: true });

    // 2. If no primary, find most recently updated resume
    if (!resume) {
      resume = await Resume.findOne({ user: userId }).sort({ updatedAt: -1 });
    }

    if (resume) {
      const analysis = analyzeResumeSkills(resume);
      return res.json({
        success: true,
        message: "Candidate skill intelligence retrieved successfully.",
        data: analysis,
      });
    }

    // 3. If no resumes, inspect candidate profile
    const profile = await CandidateProfile.findOne({ user: userId });
    if (profile) {
      const candidateProfileSkills = buildCandidateSkillProfile(profile, {
        candidateId: userId,
        title: "Candidate Career Profile",
      });
      return res.json({
        success: true,
        message: "Candidate profile skill intelligence retrieved successfully.",
        data: {
          version: SKILL_INTELLIGENCE_VERSION,
          ...candidateProfileSkills,
        },
      });
    }

    // 4. Fallback empty
    return res.json({
      success: true,
      message: "No skills recorded yet.",
      data: {
        version: SKILL_INTELLIGENCE_VERSION,
        candidateId: String(userId),
        resumeId: null,
        resumeTitle: "No Resume Created",
        generatedAt: new Date().toISOString(),
        skills: [],
        explicitSkills: [],
        mentionedSkills: [],
        categories: {},
        aliasesDetected: [],
        metrics: {
          totalSkills: 0,
          explicitSkillsCount: 0,
          mentionedSkillsCount: 0,
          declaredLevelsCount: 0,
          unspecifiedLevelsCount: 0,
          categoriesRepresented: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching candidate skills:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "CANDIDATE_SKILLS_FETCH_FAILED",
        message: "Failed to retrieve candidate skill intelligence.",
      },
    });
  }
};

/**
 * @desc    Get skill intelligence for a specific resume
 * @route   GET /api/candidate/resumes/:id/skills
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const getResumeSkillsHandler = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESUME_NOT_FOUND",
          message: "Resume not found.",
        },
      });
    }

    const analysis = analyzeResumeSkills(resume);

    return res.json({
      success: true,
      message: "Resume skill intelligence retrieved successfully.",
      data: analysis,
    });
  } catch (error) {
    console.error("Error fetching resume skills:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "RESUME_SKILLS_FETCH_FAILED",
        message: "Failed to retrieve resume skills.",
      },
    });
  }
};

/**
 * @desc    Analyze deterministic skill gap for a specific resume against a target job
 * @route   GET /api/candidate/resumes/:resumeId/skills/gap/:jobId
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const getResumeSkillGapHandler = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESUME_NOT_FOUND",
          message: "Resume not found.",
        },
      });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: "JOB_NOT_FOUND",
          message: "Target job not found.",
        },
      });
    }

    const gapResult = analyzeResumeSkillGapAgainstJob(resume, job);

    return res.json({
      success: true,
      message: "Skill gap analyzed successfully.",
      data: gapResult,
    });
  } catch (error) {
    console.error("Error analyzing skill gap:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "SKILL_GAP_ANALYSIS_FAILED",
        message: "Failed to analyze skill gap against the specified job.",
      },
    });
  }
};

module.exports = {
  getCandidateSkillsHandler,
  getResumeSkillsHandler,
  getResumeSkillGapHandler,
};
