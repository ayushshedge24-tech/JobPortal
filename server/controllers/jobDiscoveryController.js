/**
 * Job Discovery Controller
 * JobPortal 2.0 — Phase 4I Deterministic Job Discovery & Recommendations
 */

const CandidateProfile = require("../models/CandidateProfile");
const Resume = require("../models/Resume");
const { discoverRecommendedJobs } = require("../services/jobDiscovery");

/**
 * @desc    Get deterministic recommended jobs based on candidate profile, skills, & filters
 * @route   GET /api/candidate/jobs/recommended
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const getRecommendedJobsHandler = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch Candidate Profile & Primary Resume
    const candidateProfile = await CandidateProfile.findOne({ user: userId });
    const primaryResume = await Resume.findOne({ user: userId, isPrimary: true }) ||
      await Resume.findOne({ user: userId }).sort({ updatedAt: -1 });

    // 2. Discover & Rank Jobs Deterministically
    const discoveryPayload = await discoverRecommendedJobs({
      candidateProfile,
      primaryResume,
      queryParams: req.query,
    });

    return res.json({
      success: true,
      message: "Recommended jobs discovered successfully.",
      data: discoveryPayload,
    });
  } catch (error) {
    console.error("Error discovering recommended jobs:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "JOB_DISCOVERY_FAILED",
        message: "An error occurred while discovering recommended jobs.",
      },
    });
  }
};

module.exports = {
  getRecommendedJobsHandler,
};
