const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");

/**
 * Authentication Middleware
 * Enforces valid Bearer JWT access token in Authorization header
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication token is missing. Please sign in.",
        },
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: {
            code: "TOKEN_EXPIRED",
            message: "Your session has expired. Please refresh your token.",
          },
        });
      }
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid authentication token.",
        },
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: "USER_INACTIVE",
          message: "User account does not exist or has been deactivated.",
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "AUTH_SERVER_ERROR",
        message: "An error occurred during authentication verification.",
      },
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Accepts one or multiple allowed roles: "JOB_SEEKER", "RECRUITER", "ADMIN"
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be signed in to perform this action.",
        },
      });
    }

    const normalizedUserRole = req.user.role === "jobseeker" ? "JOB_SEEKER" : req.user.role === "employer" ? "RECRUITER" : req.user.role;
    const normalizedAllowed = allowedRoles.map((r) =>
      r === "jobseeker" ? "JOB_SEEKER" : r === "employer" ? "RECRUITER" : r
    );

    // ADMIN always has access
    if (normalizedUserRole === "ADMIN" || normalizedAllowed.includes(normalizedUserRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(", ")}.`,
      },
    });
  };
};

/**
 * Optional Authentication Middleware
 * Populates req.user if a valid token is provided, otherwise continues anonymously
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyAccessToken(token);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }
  } catch {
    // Ignore error for optional auth
  }
  next();
};

module.exports = {
  requireAuth,
  requireRole,
  optionalAuth,
};
