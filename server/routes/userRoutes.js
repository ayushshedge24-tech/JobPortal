const express = require("express");
const User = require("../models/User");

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Backward compatible register endpoint
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill out all required fields",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role === "employer" ? "RECRUITER" : "JOB_SEEKER",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

module.exports = router;