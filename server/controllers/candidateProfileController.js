const CandidateProfile = require("../models/CandidateProfile");
const User = require("../models/User");
const { calculateProfileCompletion } = require("../utils/profileCompletion");

// Allowed fields for update to prevent mass assignment
const ALLOWED_PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "headline",
  "professionalSummary",
  "phone",
  "location",
  "city",
  "state",
  "preferredLocations",
  "preferredWorkModes",
  "preferredJobTypes",
  "currentRole",
  "experienceYears",
  "education",
  "experience",
  "projects",
  "certifications",
  "achievements",
  "languages",
  "skills",
  "socialLinks",
];

/**
 * Validate URL string format (must be valid HTTP/HTTPS or empty)
 */
function isValidUrl(url) {
  if (!url || typeof url !== "string" || url.trim() === "") return true;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * @route   GET /api/candidate/profile
 * @desc    Get the authenticated candidate's profile
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    let profile = await CandidateProfile.findOne({ user: userId });

    if (!profile) {
      // Safe initialization from existing User model data
      const user = await User.findById(userId);
      const nameParts = (user?.name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      profile = new CandidateProfile({
        user: userId,
        firstName,
        lastName,
        phone: user?.phone || "",
        location: user?.location || "",
        city: user?.location ? user.location.split(",")[0].trim() : "",
      });

      profile.completionPercentage = calculateProfileCompletion(profile);
      await profile.save();
    } else {
      // Ensure completion score is fresh
      const freshScore = calculateProfileCompletion(profile);
      if (profile.completionPercentage !== freshScore) {
        profile.completionPercentage = freshScore;
        await profile.save();
      }
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "PROFILE_FETCH_FAILED",
        message: "Failed to load candidate profile.",
      },
    });
  }
};

/**
 * @route   PUT /api/candidate/profile
 * @desc    Update the authenticated candidate's profile
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const body = req.body || {};

    // Validate URLs in socialLinks if provided
    if (body.socialLinks) {
      const { linkedin, github, portfolio, website } = body.socialLinks;
      if (linkedin && !isValidUrl(linkedin)) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_URL", message: "Invalid LinkedIn URL format. Must start with http:// or https://" },
        });
      }
      if (github && !isValidUrl(github)) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_URL", message: "Invalid GitHub URL format. Must start with http:// or https://" },
        });
      }
      if (portfolio && !isValidUrl(portfolio)) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_URL", message: "Invalid Portfolio URL format. Must start with http:// or https://" },
        });
      }
      if (website && !isValidUrl(website)) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_URL", message: "Invalid Website URL format. Must start with http:// or https://" },
        });
      }
    }

    // Filter updates by whitelisted fields to prevent mass assignment
    const updateData = {};
    for (const field of ALLOWED_PROFILE_FIELDS) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    let profile = await CandidateProfile.findOne({ user: userId });

    if (!profile) {
      profile = new CandidateProfile({
        user: userId,
        ...updateData,
      });
    } else {
      Object.assign(profile, updateData);
    }

    // Deterministic completion score calculation
    profile.completionPercentage = calculateProfileCompletion(profile);
    await profile.save();

    // Optionally keep User model name and phone in sync if provided
    if (profile.firstName || profile.lastName) {
      const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
      if (fullName) {
        await User.findByIdAndUpdate(userId, {
          name: fullName,
          ...(profile.phone ? { phone: profile.phone } : {}),
          ...(profile.location ? { location: profile.location } : {}),
        });
      }
    }

    res.json({
      success: true,
      message: "Candidate profile updated successfully.",
      profile,
    });
  } catch (error) {
    console.error("Error updating candidate profile:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: "PROFILE_UPDATE_FAILED",
        message: "Failed to update candidate profile.",
      },
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
