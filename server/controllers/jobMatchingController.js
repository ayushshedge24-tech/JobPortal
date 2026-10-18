/**
 * Job Matching Controller
 * JobPortal 2.0 — Phase 4G Explainable Job Matching Engine
 */

const mongoose = require("mongoose");
const Job = require("../models/Job");
const Resume = require("../models/Resume");
const CandidateProfile = require("../models/CandidateProfile");
const { evaluateJobMatch } = require("../services/jobMatching");

/**
 * @desc    Get deterministic, explainable job match evaluation for authenticated candidate
 * @route   GET /api/candidate/jobs/:jobId/match
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const getJobMatchHandler = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    // 1. Validate Job ID format
    if (!jobId || typeof jobId !== "string" || jobId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_JOB_ID",
          message: "A valid job ID must be provided.",
        },
      });
    }

    // 2. Fetch Job document
    let job = null;
    if (mongoose.Types.ObjectId.isValid(jobId)) {
      job = await Job.findById(jobId);
    } else {
      job = await Job.findOne({ _id: jobId });
    }

    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: "JOB_NOT_FOUND",
          message: "The requested job was not found.",
        },
      });
    }

    // 3. Find Candidate source: primary resume -> most recent resume -> candidate profile
    let sourceDoc = await Resume.findOne({ user: userId, isPrimary: true });
    let resumeId = sourceDoc?._id || null;

    if (!sourceDoc) {
      sourceDoc = await Resume.findOne({ user: userId }).sort({ updatedAt: -1 });
      resumeId = sourceDoc?._id || null;
    }

    if (!sourceDoc) {
      sourceDoc = await CandidateProfile.findOne({ user: userId });
      resumeId = null;
    }

    // 4. If candidate has neither resume nor profile, create baseline empty candidate container
    if (!sourceDoc) {
      sourceDoc = {
        user: userId,
        content: { skills: [], experience: [] },
      };
    }

    // 5. Evaluate deterministic match
    const matchResult = evaluateJobMatch(sourceDoc, job, {
      candidateId: userId,
      resumeId,
    });

    return res.json({
      success: true,
      message: "Job match evaluated successfully.",
      data: matchResult,
    });
  } catch (error) {
    console.error("Error evaluating job match:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "JOB_MATCH_EVALUATION_FAILED",
        message: "An error occurred while evaluating job match alignment.",
      },
    });
  }
};

module.exports = {
  getJobMatchHandler,
};
