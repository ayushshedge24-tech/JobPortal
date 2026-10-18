const jwt = require("jsonwebtoken");

const ACCESS_SECRET =
  (process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET.trim()) ||
  (process.env.JWT_SECRET && process.env.JWT_SECRET.trim()) ||
  "jobportal_default_access_secret_key_2026";
const REFRESH_SECRET =
  (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.trim()) ||
  (process.env.REFRESH_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET.trim()) ||
  "jobportal_default_refresh_secret_key_2026";

/**
 * Generate a short-lived access token (15 minutes)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

/**
 * Generate a longer-lived refresh token (7 days)
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Verify an access token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

/**
 * Verify a refresh token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

/**
 * Attach HTTP-Only refresh token cookie
 */
const setRefreshTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

/**
 * Clear refresh token cookie on logout
 */
const clearRefreshTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
