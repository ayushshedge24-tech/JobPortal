const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email address",
      ],
    },

    passwordHash: {
      type: String,
      select: false,
    },

    // Legacy password support for on-the-fly migration
    password: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["JOB_SEEKER", "RECRUITER", "ADMIN", "jobseeker", "employer"],
      default: "JOB_SEEKER",
      set: function (r) {
        if (r === "jobseeker") return "JOB_SEEKER";
        if (r === "employer") return "RECRUITER";
        return r;
      },
    },

    avatar: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password (supports bcrypt and transparent legacy migration)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.passwordHash) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
  }
  // Check legacy plaintext password
  if (this.password && this.password === enteredPassword) {
    // Automatically migrate to bcrypt hash
    this.passwordHash = await bcrypt.hash(enteredPassword, 12);
    this.password = undefined;
    await this.save();
    return true;
  }
  return false;
};

// Static helper to hash password
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

// Method to return safe JSON object
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.password;
  delete obj.__v;
  return obj;
};

// Production optimized compound indexes
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);