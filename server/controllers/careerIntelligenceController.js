/**
 * Career Intelligence Controller
 * JobPortal 2.0 — Phase 4H Candidate Career Intelligence Workspace
 */

const CandidateProfile = require("../models/CandidateProfile");
const Resume = require("../models/Resume");
const { buildCareerIntelligence } = require("../services/careerIntelligence");

/**
 * @desc    Get aggregated Career Intelligence snapshot for authenticated candidate
 * @route   GET /api/candidate/career-intelligence
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const getCareerIntelligenceHandler = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch Candidate Profile
    const candidateProfile = await CandidateProfile.findOne({ user: userId });

    // 2. Fetch all Resumes belonging strictly to authenticated user
    const allResumes = await Resume.find({ user: userId }).sort({ updatedAt: -1 });

    // 3. Identify Primary Resume (or first most recently updated)
    let primaryResume = allResumes.find((r) => r.isPrimary);
    if (!primaryResume && allResumes.length > 0) {
      primaryResume = allResumes[0];
    }

    // 4. Build Career Intelligence Snapshot
    const careerIntelligence = buildCareerIntelligence({
      candidateProfile,
      primaryResume,
      allResumes,
    });

    return res.json({
      success: true,
      message: "Career intelligence data aggregated successfully.",
      data: careerIntelligence,
    });
  } catch (error) {
    console.error("Error generating career intelligence:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "CAREER_INTELLIGENCE_FAILED",
        message: "An error occurred while compiling career intelligence.",
      },
    });
  }
};

module.exports = {
  getCareerIntelligenceHandler,
};
