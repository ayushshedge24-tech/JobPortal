const mongoose = require("mongoose");
const SavedJob = require("../models/SavedJob");
const Job = require("../models/Job");
const { createNotification, NOTIFICATION_TYPES } = require("../services/notificationService");

/**
 * @route   POST /api/candidate/saved-jobs/:jobId
 * @desc    Save/bookmark a job for candidate
 * @access  Private (JOB_SEEKER, ADMIN)
 */
async function saveJobHandler(req, res) {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_JOB_ID", message: "A valid Job ObjectId is required" },
      });
    }

    const job = await Job.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: "JOB_NOT_FOUND", message: "Job opening does not exist or has been removed" },
      });
    }

    // Idempotent save check
    let savedJob = await SavedJob.findOne({ user: userId, job: jobId });
    if (savedJob) {
      return res.status(200).json({
        success: true,
        message: "Job is already bookmarked",
        isSaved: true,
        data: savedJob,
      });
    }

    // Emit JOB_SAVED notification
    try {
      await createNotification({
        user: userId,
        type: NOTIFICATION_TYPES.JOB_SAVED,
        title: "Job Saved",
        message: `${job.title} at ${job.company} has been added to your saved jobs.`,
        entityType: "JOB",
        entityId: jobId,
        metadata: { jobId, title: job.title, company: job.company },
        eventKey: `${userId}_JOB_SAVED_${jobId}`,
      });
    } catch (notifErr) {
      console.warn("Failed to create job saved notification:", notifErr);
    }

    savedJob = await SavedJob.create({
      user: userId,
      job: jobId,
    });

    return res.status(201).json({
      success: true,
      message: "Job saved successfully",
      isSaved: true,
      data: savedJob,
    });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key race condition caught cleanly
      return res.status(200).json({
        success: true,
        message: "Job is already bookmarked",
        isSaved: true,
      });
    }
    console.error("Failed to save job:", err);
    return res.status(500).json({
      success: false,
      error: { code: "SAVE_JOB_ERROR", message: "Internal server error while saving job" },
    });
  }
}

/**
 * @route   DELETE /api/candidate/saved-jobs/:jobId
 * @desc    Remove a bookmarked job
 * @access  Private (JOB_SEEKER, ADMIN)
 */
async function unsaveJobHandler(req, res) {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_JOB_ID", message: "A valid Job ObjectId is required" },
      });
    }

    await SavedJob.findOneAndDelete({ user: userId, job: jobId });

    return res.status(200).json({
      success: true,
      message: "Job removed from saved bookmarks",
      isSaved: false,
    });
  } catch (err) {
    console.error("Failed to unsave job:", err);
    return res.status(500).json({
      success: false,
      error: { code: "UNSAVE_JOB_ERROR", message: "Internal server error while removing saved job" },
    });
  }
}

/**
 * @route   GET /api/candidate/saved-jobs
 * @desc    Get all saved jobs for current candidate with optional keyword search and pagination
 * @access  Private (JOB_SEEKER, ADMIN)
 */
async function getSavedJobsHandler(req, res) {
  try {
    const userId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "10", 10) || 10));
    const keyword = req.query.keyword ? String(req.query.keyword).trim().toLowerCase() : "";

    const savedRecords = await SavedJob.find({ user: userId })
      .populate("job")
      .sort({ createdAt: -1 })
      .lean();

    // Filter out orphaned saved jobs where job was deleted, and filter by keyword if supplied
    let validRecords = savedRecords.filter((r) => r.job != null);

    if (keyword) {
      validRecords = validRecords.filter((r) => {
        const title = (r.job.title || "").toLowerCase();
        const company = (r.job.company || "").toLowerCase();
        const location = (r.job.location || "").toLowerCase();
        const skills = Array.isArray(r.job.skills) ? r.job.skills.join(" ").toLowerCase() : "";
        return title.includes(keyword) || company.includes(keyword) || location.includes(keyword) || skills.includes(keyword);
      });
    }

    const total = validRecords.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = validRecords.slice((page - 1) * limit, page * limit);

    return res.status(200).json({
      success: true,
      data: {
        savedJobs: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (err) {
    console.error("Failed to fetch saved jobs:", err);
    return res.status(500).json({
      success: false,
      error: { code: "FETCH_SAVED_JOBS_ERROR", message: "Internal server error while retrieving saved jobs" },
    });
  }
}

/**
 * @route   GET /api/candidate/saved-jobs/:jobId/status
 * @desc    Check if a specific job is bookmarked by candidate
 * @access  Private (JOB_SEEKER, ADMIN)
 */
async function getSavedJobStatusHandler(req, res) {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_JOB_ID", message: "A valid Job ObjectId is required" },
      });
    }

    const exists = await SavedJob.exists({ user: userId, job: jobId });
    return res.status(200).json({
      success: true,
      isSaved: Boolean(exists),
    });
  } catch (err) {
    console.error("Failed to check saved job status:", err);
    return res.status(500).json({
      success: false,
      error: { code: "CHECK_SAVED_STATUS_ERROR", message: "Internal server error" },
    });
  }
}

module.exports = {
  saveJobHandler,
  unsaveJobHandler,
  getSavedJobsHandler,
  getSavedJobStatusHandler,
};
