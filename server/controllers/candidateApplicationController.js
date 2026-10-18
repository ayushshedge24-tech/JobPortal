const mongoose = require("mongoose");
const Application = require("../models/Application");
const Resume = require("../models/Resume");
const {
  PIPELINE_STATUSES,
  STATUS_LABELS,
  STATUS_BADGE_VARIANTS,
  ALLOWED_WITHDRAWAL_STATUSES,
  normalizeApplicationStatus,
  buildApplicationTimeline,
  aggregatePipelineMetrics,
} = require("../services/jobPipeline");
const { createNotification, NOTIFICATION_TYPES } = require("../services/notificationService");

/**
 * @route   GET /api/candidate/applications
 * @desc    Get candidate applications with pipeline metrics and multi-filter support
 * @access  Private (JOB_SEEKER, ADMIN)
 */
async function getCandidateApplicationsHandler(req, res) {
  try {
    const userId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "10", 10) || 10));
    const statusFilter = req.query.status ? String(req.query.status).trim() : "";
    const keyword = req.query.keyword ? String(req.query.keyword).trim().toLowerCase() : "";
    const location = req.query.location ? String(req.query.location).trim().toLowerCase() : "";
    const workMode = req.query.workMode ? String(req.query.workMode).trim().toLowerCase() : "";
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Fetch all applications belonging strictly to this authenticated candidate
    const allApps = await Application.find({ applicant: userId })
      .populate("job")
      .populate("resumeId", "title version template updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    // Compute real metrics on all candidate applications
    const metrics = aggregatePipelineMetrics(allApps);

    // Filter in-memory for rich criteria
    let filteredApps = allApps;

    if (statusFilter && statusFilter !== "ALL") {
      const targetNorm = normalizeApplicationStatus(statusFilter);
      filteredApps = filteredApps.filter((app) => normalizeApplicationStatus(app.status) === targetNorm);
    }

    if (keyword) {
      filteredApps = filteredApps.filter((app) => {
        const jobTitle = (app.job?.title || "").toLowerCase();
        const company = (app.job?.company || "").toLowerCase();
        return jobTitle.includes(keyword) || company.includes(keyword);
      });
    }

    if (location) {
      filteredApps = filteredApps.filter((app) => {
        const jobLoc = (app.job?.location || "").toLowerCase();
        return jobLoc.includes(location);
      });
    }

    if (workMode) {
      filteredApps = filteredApps.filter((app) => {
        const mode = (app.job?.workMode || "").toLowerCase();
        return mode === workMode || mode.includes(workMode);
      });
    }

    if (startDate && !isNaN(startDate.getTime())) {
      filteredApps = filteredApps.filter((app) => new Date(app.createdAt) >= startDate);
    }

    if (endDate && !isNaN(endDate.getTime())) {
      filteredApps = filteredApps.filter((app) => new Date(app.createdAt) <= endDate);
    }

    const total = filteredApps.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = filteredApps.slice((page - 1) * limit, page * limit);

    // Map each application to safe candidate presentation contract
    const results = paginated.map((app) => {
      const normStatus = normalizeApplicationStatus(app.status);
      return {
        _id: app._id,
        job: app.job || { title: "Position", company: "Company" },
        status: normStatus,
        statusLabel: STATUS_LABELS[normStatus] || normStatus,
        statusVariant: STATUS_BADGE_VARIANTS[normStatus] || "neutral",
        appliedAt: app.createdAt,
        updatedAt: app.updatedAt,
        resume: {
          url: app.resume || null,
          id: app.resumeId?._id || app.resumeId || null,
          version: app.resumeVersion || app.resumeId?.version || 1,
          title: app.resumeTitle || app.resumeId?.title || "Resume Snapshot",
        },
        coverLetter: app.coverLetter || null,
        canWithdraw: ALLOWED_WITHDRAWAL_STATUSES.includes(normStatus) || ALLOWED_WITHDRAWAL_STATUSES.includes(app.status),
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        metrics,
        applications: results,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (err) {
    console.error("Failed to fetch candidate applications:", err);
    return res.status(500).json({
      success: false,
      error: { code: "FETCH_APPLICATIONS_ERROR", message: "Internal server error while retrieving applications" },
    });
  }
}

/**
 * @route   GET /api/candidate/applications/:id
 * @desc    Get detailed application view with factual timeline
 * @access  Private (JOB_SEEKER, ADMIN)
 */
async function getCandidateApplicationByIdHandler(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_APPLICATION_ID", message: "A valid Application ObjectId is required" },
      });
    }

    const application = await Application.findById(id)
      .populate("job")
      .populate("resumeId", "title version template isPrimary updatedAt")
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: "APPLICATION_NOT_FOUND", message: "Application record not found" },
      });
    }

    // Strict IDOR ownership check
    const isOwner = application.applicant.toString() === userId.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(404).json({
        success: false,
        error: { code: "APPLICATION_NOT_FOUND", message: "Application record not found" },
      });
    }

    const normStatus = normalizeApplicationStatus(application.status);
    const timeline = buildApplicationTimeline(application);

    return res.status(200).json({
      success: true,
      data: {
        _id: application._id,
        job: application.job,
        status: normStatus,
        statusLabel: STATUS_LABELS[normStatus] || normStatus,
        statusVariant: STATUS_BADGE_VARIANTS[normStatus] || "neutral",
        appliedAt: application.createdAt,
        updatedAt: application.updatedAt,
        applicantDetails: {
          name: application.applicantName,
          email: application.applicantEmail,
          phone: application.phone,
          currentLocation: application.currentLocation,
          currentCtc: application.currentCtc,
          expectedCtc: application.expectedCtc,
          noticePeriod: application.noticePeriod,
          experienceYears: application.experienceYears,
          portfolio: application.portfolio,
        },
        resume: {
          url: application.resume || null,
          id: application.resumeId?._id || application.resumeId || null,
          version: application.resumeVersion || application.resumeId?.version || 1,
          title: application.resumeTitle || application.resumeId?.title || "Resume",
        },
        coverLetter: application.coverLetter || null,
        timeline,
        canWithdraw: ALLOWED_WITHDRAWAL_STATUSES.includes(normStatus) || ALLOWED_WITHDRAWAL_STATUSES.includes(application.status),
      },
    });
  } catch (err) {
    console.error("Failed to fetch application detail:", err);
    return res.status(500).json({
      success: false,
      error: { code: "APPLICATION_DETAIL_ERROR", message: "Internal server error" },
    });
  }
}

/**
 * @route   PATCH /api/candidate/applications/:id/withdraw
 * @desc    Withdraw candidate's own application
 * @access  Private (JOB_SEEKER, ADMIN)
 */
async function withdrawCandidateApplicationHandler(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_APPLICATION_ID", message: "A valid Application ObjectId is required" },
      });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: "APPLICATION_NOT_FOUND", message: "Application record not found" },
      });
    }

    // Strict IDOR ownership check
    const isOwner = application.applicant.toString() === userId.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(404).json({
        success: false,
        error: { code: "APPLICATION_NOT_FOUND", message: "Application record not found" },
      });
    }

    const normStatus = normalizeApplicationStatus(application.status);

    if (normStatus === PIPELINE_STATUSES.WITHDRAWN) {
      return res.status(200).json({
        success: true,
        message: "Application is already withdrawn",
        data: {
          _id: application._id,
          status: PIPELINE_STATUSES.WITHDRAWN,
          statusLabel: STATUS_LABELS.WITHDRAWN,
        },
      });
    }

    // Verify withdrawal policy: Only APPLIED and UNDER_REVIEW may be withdrawn by candidate
    const isAllowed = ALLOWED_WITHDRAWAL_STATUSES.includes(normStatus) || ALLOWED_WITHDRAWAL_STATUSES.includes(application.status);
    if (!isAllowed) {
      return res.status(400).json({
        success: false,
        error: {
          code: "CANNOT_WITHDRAW",
          message: `Applications with status "${STATUS_LABELS[normStatus] || normStatus}" cannot be withdrawn online. Please contact the hiring team directly.`,
        },
      });
    }

    application.status = "Withdrawn";
    if (!Array.isArray(application.statusHistory)) {
      application.statusHistory = [];
    }

    application.statusHistory.push({
      status: "WITHDRAWN",
      changedAt: new Date(),
      note: "Application withdrawn by candidate",
    });

    await application.save();

    // Emit APPLICATION_WITHDRAWN notification
    try {
      await createNotification({
        user: userId,
        type: NOTIFICATION_TYPES.APPLICATION_WITHDRAWN,
        title: "Application Withdrawn",
        message: "You have withdrawn your job application.",
        entityType: "APPLICATION",
        entityId: application._id,
        metadata: { applicationId: application._id },
        eventKey: `${userId}_WITHDRAWN_${application._id}`,
      });
    } catch (notifErr) {
      console.warn("Failed to create withdrawal notification:", notifErr);
    }

    return res.status(200).json({
      success: true,
      message: "Application successfully withdrawn",
      data: {
        _id: application._id,
        status: PIPELINE_STATUSES.WITHDRAWN,
        statusLabel: STATUS_LABELS.WITHDRAWN,
      },
    });
  } catch (err) {
    console.error("Failed to withdraw application:", err);
    return res.status(500).json({
      success: false,
      error: { code: "WITHDRAW_APPLICATION_ERROR", message: "Internal server error" },
    });
  }
}

module.exports = {
  getCandidateApplicationsHandler,
  getCandidateApplicationByIdHandler,
  withdrawCandidateApplicationHandler,
};
