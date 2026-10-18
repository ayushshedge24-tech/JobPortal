const { createNotification, NOTIFICATION_TYPES } = require("../services/notificationService");
const express = require("express");
const Application = require("../models/Application");
const Job = require("../models/Job");
const { requireAuth, requireRole, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/applications
 * @desc    Apply for a job (Preserves complete backward compatibility + adds statusHistory)
 * @access  Public / Private
 */
router.post("/", optionalAuth, async (req, res) => {
  try {
    const {
      job,
      applicant,
      resume,
      coverLetter,
      applicantName,
      applicantEmail,
      phone,
      currentLocation,
      currentCtc,
      expectedCtc,
      noticePeriod,
      experienceYears,
      portfolio,
      resumeId,
      resumeVersion,
      resumeTitle,
    } = req.body;

    const applicantId = req.user?._id || applicant;

    if (!job || !applicantId) {
      return res.status(400).json({
        success: false,
        message: "Job ID and Applicant ID are required.",
      });
    }

    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(applicantId) || !mongoose.Types.ObjectId.isValid(job)) {
      return res.status(400).json({
        success: false,
        message: "Please sign in to a valid candidate account to submit your application.",
      });
    }

    const existingApplication = await Application.findOne({
      job,
      applicant: applicantId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const application = await Application.create({
      job,
      applicant: applicantId,
      resume,
      coverLetter,
      applicantName,
      applicantEmail,
      phone,
      currentLocation,
      currentCtc,
      expectedCtc,
      noticePeriod,
      experienceYears,
      portfolio,
      resumeId: resumeId || undefined,
      resumeVersion: resumeVersion || undefined,
      resumeTitle: resumeTitle || undefined,
      status: "Applied",
      statusHistory: [
        {
          status: "APPLIED",
          changedAt: new Date(),
          note: coverLetter ? "Application submitted with cover note" : "Application submitted",
        },
      ],
    });

    // Emit APPLICATION_SUBMITTED notification
    try {
      const jobDoc = await Job.findById(job).select("title company").lean();
      await createNotification({
        user: applicantId,
        type: NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
        title: "Application Submitted",
        message: `Your application for ${jobDoc?.title || "Role"} at ${jobDoc?.company || "Company"} was successfully submitted.`,
        entityType: "APPLICATION",
        entityId: application._id,
        metadata: { jobId: job, company: jobDoc?.company, title: jobDoc?.title },
        eventKey: `${applicantId}_APP_SUBMITTED_${application._id}`,
      });
    } catch (notifErr) {
      console.warn("Failed to create application notification:", notifErr);
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }
    res.status(500).json({
      success: false,
      message: "Application failed",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/applications
 * @desc    Get applications (filtered by role and ownership when authenticated)
 * @access  Private
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    let query = {};

    const userRole = req.user.role === "jobseeker" ? "JOB_SEEKER" : req.user.role === "employer" ? "RECRUITER" : req.user.role;

    if (userRole === "JOB_SEEKER") {
      query = { applicant: req.user._id };
    } else if (userRole === "RECRUITER") {
      const recruiterJobs = await Job.find({ postedBy: req.user._id }).select("_id");
      const jobIds = recruiterJobs.map((j) => j._id);
      query = { job: { $in: jobIds } };
    }
    // ADMIN sees all applications

    const applications = await Application.find(query)
      .populate("job")
      .populate("applicant", "name email phone location avatar")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
});

/**
 * @route   PATCH /api/applications/:id/status
 * @desc    Update application status (Recruiter who posted the job or Admin)
 * @access  Private (Recruiter / Admin)
 */
router.patch("/:id/status", requireAuth, requireRole("RECRUITER", "ADMIN"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "Applied",
      "Shortlisted",
      "Rejected",
      "Selected",
      "Under Review",
      "Interview",
      "Offer",
      "APPLIED",
      "UNDER_REVIEW",
      "SHORTLISTED",
      "INTERVIEW",
      "OFFER",
      "REJECTED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_STATUS", message: `Status must be one of: ${validStatuses.join(", ")}` },
      });
    }

    const application = await Application.findById(req.params.id).populate("job");
    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Application not found" },
      });
    }

    // Ownership check on the job
    const isJobOwner = application.job && application.job.postedBy && application.job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isJobOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN_OWNERSHIP",
          message: "You can only update applicant status for your own job listings.",
        },
      });
    }

    application.status = status;
    if (!Array.isArray(application.statusHistory)) {
      application.statusHistory = [];
    }
    application.statusHistory.push({
      status: status.toUpperCase().replace(/s+/g, "_"),
      changedAt: new Date(),
      note: `Status updated by ${isAdmin ? "Administrator" : "Hiring Team"}`,
    });

    await application.save();

    // Emit APPLICATION_STATUS_CHANGED notification if status transitioned
    try {
      const normStatus = status.toUpperCase().replace(/\s+/g, "_");
      await createNotification({
        user: application.applicant,
        type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
        title: "Application Status Updated",
        message: `Your application status for ${application.job?.title || "Role"} at ${application.job?.company || "Company"} is now ${normStatus}.`,
        entityType: "APPLICATION",
        entityId: application._id,
        metadata: { jobId: application.job?._id, status: normStatus },
        eventKey: `${application.applicant}_STATUS_${application._id}_${normStatus}`,
      });
    } catch (notifErr) {
      console.warn("Failed to create status change notification:", notifErr);
    }

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error: error.message,
    });
  }
});

module.exports = router;
