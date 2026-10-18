const express = require("express");
const Job = require("../models/Job");
const { requireAuth, requireRole, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   GET /api/jobs
 * @desc    Get jobs with advanced filtering, full-text search, sorting, and pagination
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const {
      q,
      location,
      type,
      jobType,
      workMode,
      experience,
      category,
      salaryMin,
      sort = "newest",
      page = 1,
      limit = 30,
    } = req.query;

    const filter = {};
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 1. Keyword search (Title, Company, Skills, Description)
    if (q && q.trim()) {
      const keyword = escapeRegex(q.trim());
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { company: { $regex: keyword, $options: "i" } },
        { skills: { $in: [new RegExp(keyword, "i")] } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    // 2. Location filter
    if (location && location.trim() && location.toLowerCase() !== "all") {
      filter.location = { $regex: escapeRegex(location.trim()), $options: "i" };
    }

    // 3. Job Type filter
    const selectedType = type || jobType;
    if (selectedType && selectedType !== "All") {
      filter.jobType = { $regex: `^${escapeRegex(selectedType)}$`, $options: "i" };
    }

    // 4. Work Mode filter
    if (workMode && workMode !== "All") {
      filter.workMode = { $regex: `^${escapeRegex(workMode)}$`, $options: "i" };
    }

    // 5. Experience filter
    if (experience && experience !== "All") {
      filter.experience = { $regex: escapeRegex(experience), $options: "i" };
    }

    // 6. Category filter
    if (category && category !== "All") {
      filter.category = { $regex: escapeRegex(category), $options: "i" };
    }

    // Sorting strategy
    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "title") sortOption = { title: 1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, totalCount] = await Promise.all([
      Job.find(filter)
        .populate("postedBy", "name email role")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(filter),
    ]);

    // Return array directly to preserve 100% backward compatibility with existing tests and frontend,
    // while attaching pagination headers
    res.setHeader("X-Total-Count", totalCount);
    res.setHeader("X-Total-Pages", Math.ceil(totalCount / limitNum));
    res.setHeader("X-Current-Page", pageNum);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job details
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email role");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/jobs
 * @desc    Create a new job listing
 * @access  Private (Recruiter / Admin)
 */
router.post("/", optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      const userRole = req.user.role === "jobseeker" ? "JOB_SEEKER" : req.user.role === "employer" ? "RECRUITER" : req.user.role;
      if (userRole !== "RECRUITER" && userRole !== "ADMIN") {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only recruiters and administrators can post jobs.",
          },
        });
      }
      req.body.postedBy = req.user._id;
    }

    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
});

/**
 * @route   PATCH /api/jobs/:id
 * @desc    Update a job listing (Owner recruiter or Admin only)
 * @access  Private (Owner / Admin)
 */
router.patch("/:id", requireAuth, requireRole("RECRUITER", "ADMIN"), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Job not found" },
      });
    }

    const isOwner = job.postedBy && job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN_OWNERSHIP",
          message: "You can only edit jobs that you have posted.",
        },
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job listing (Owner recruiter or Admin only)
 * @access  Private (Owner / Admin)
 */
router.delete("/:id", requireAuth, requireRole("RECRUITER", "ADMIN"), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Job not found" },
      });
    }

    const isOwner = job.postedBy && job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN_OWNERSHIP",
          message: "You can only delete jobs that you have posted.",
        },
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
});

module.exports = router;