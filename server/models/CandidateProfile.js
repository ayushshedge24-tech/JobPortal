const mongoose = require("mongoose");
const { calculateProfileCompletion } = require("../utils/profileCompletion");

const experienceSchema = new mongoose.Schema({
  company: { type: String, trim: true, default: "" },
  role: { type: String, trim: true, default: "" },
  location: { type: String, trim: true, default: "" },
  startDate: { type: String, trim: true, default: "" },
  endDate: { type: String, trim: true, default: "" },
  currentlyWorking: { type: Boolean, default: false },
  description: { type: String, trim: true, default: "" },
});

const educationSchema = new mongoose.Schema({
  institution: { type: String, trim: true, default: "" },
  degree: { type: String, trim: true, default: "" },
  fieldOfStudy: { type: String, trim: true, default: "" },
  startDate: { type: String, trim: true, default: "" },
  endDate: { type: String, trim: true, default: "" },
  grade: { type: String, trim: true, default: "" },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: "" },
  description: { type: String, trim: true, default: "" },
  technologies: [{ type: String, trim: true }],
  url: { type: String, trim: true, default: "" },
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: "" },
  issuer: { type: String, trim: true, default: "" },
  issueDate: { type: String, trim: true, default: "" },
  credentialUrl: { type: String, trim: true, default: "" },
});

const languageSchema = new mongoose.Schema({
  language: { type: String, trim: true, default: "" },
  proficiency: {
    type: String,
    enum: ["Basic", "Conversational", "Fluent", "Native", ""],
    default: "Fluent",
  },
});

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [60, "First name cannot exceed 60 characters"],
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [60, "Last name cannot exceed 60 characters"],
      default: "",
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [150, "Headline cannot exceed 150 characters"],
      default: "",
    },
    professionalSummary: {
      type: String,
      trim: true,
      maxlength: [3000, "Professional summary cannot exceed 3000 characters"],
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },

    preferredLocations: [{ type: String, trim: true }],
    preferredWorkModes: [{
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
    }],
    preferredJobTypes: [{
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract"],
    }],

    currentRole: {
      type: String,
      trim: true,
      default: "",
    },
    experienceYears: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      max: [50, "Experience cannot exceed 50 years"],
      default: 0,
    },

    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    achievements: [{ type: String, trim: true }],
    languages: [languageSchema],

    skills: [{ type: String, trim: true }],

    socialLinks: {
      linkedin: { type: String, trim: true, default: "" },
      github: { type: String, trim: true, default: "" },
      portfolio: { type: String, trim: true, default: "" },
      website: { type: String, trim: true, default: "" },
    },

    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate completion percentage
candidateProfileSchema.pre("save", function () {
  this.completionPercentage = calculateProfileCompletion(this);
});

// Method to recalculate and return completion percentage
candidateProfileSchema.methods.recalculateCompletion = function () {
  this.completionPercentage = calculateProfileCompletion(this);
  return this.completionPercentage;
};

module.exports = mongoose.model("CandidateProfile", candidateProfileSchema);
