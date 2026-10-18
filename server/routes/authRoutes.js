const express = require("express");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../utils/jwt");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Candidate or Recruiter)
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide all required fields: name, email, and password.",
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: "WEAK_PASSWORD",
          message: "Password must be at least 6 characters long.",
        },
      });
    }

    // Sanitize role: public cannot register as ADMIN directly
    let userRole = "JOB_SEEKER";
    if (role === "employer" || role === "RECRUITER") {
      userRole = "RECRUITER";
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: "USER_ALREADY_EXISTS",
          message: "A user with this email address already exists.",
        },
      });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: userRole,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "REGISTRATION_FAILED",
        message: error.message || "Registration failed due to a server error.",
      },
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get JWT tokens
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_CREDENTIALS",
          message: "Please provide both email and password.",
        },
      });
    }

    // Explicitly select passwordHash and legacy password fields
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+passwordHash +password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCOUNT_DEACTIVATED",
          message: "Your account has been deactivated. Please contact support.",
        },
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      success: true,
      message: "Signed in successfully",
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "LOGIN_FAILED",
        message: error.message || "Login failed due to a server error.",
      },
    });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using HTTP-only refresh cookie
 * @access  Public (Requires valid cookie)
 */
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: "REFRESH_TOKEN_MISSING",
          message: "Refresh token is missing. Please sign in again.",
        },
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        error: {
          code: "REFRESH_TOKEN_INVALID",
          message: "Session expired or invalid refresh token. Please sign in again.",
        },
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        error: {
          code: "USER_INACTIVE",
          message: "User account is inactive.",
        },
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      success: true,
      accessToken: newAccessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "REFRESH_FAILED",
        message: error.message || "Failed to refresh session.",
      },
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Clear refresh token cookie and invalidate session
 * @access  Public
 */
router.post("/logout", (req, res) => {
  clearRefreshTokenCookie(res);
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private (Requires Bearer token)
 */
router.get("/me", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user.toSafeObject(),
  });
});

module.exports = router;
