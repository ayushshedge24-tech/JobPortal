const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [150, "Job title cannot exceed 150 characters"],
    },

    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },

    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
    },

    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
      default: "Hybrid",
    },

    experience: {
      type: String,
      default: "1-3 years",
    },

    category: {
      type: String,
      default: "Software Development",
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
    },

    salary: {
      type: String,
      default: "Competitive LPA",
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract"],
      default: "Full-time",
    },

    skills: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"],
      default: "PUBLISHED",
      index: true,
    },

    benefits: {
      type: [String],
      default: [],
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance compound & text indexes
jobSchema.index({ title: "text", company: "text", skills: "text", description: "text" });
jobSchema.index({ location: 1, jobType: 1, workMode: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ postedBy: 1, status: 1, createdAt: -1 });
jobSchema.index({ status: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model("Job", jobSchema);