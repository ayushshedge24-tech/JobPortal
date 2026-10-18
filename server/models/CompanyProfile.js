const mongoose = require("mongoose");

const companyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [200, "Tagline cannot exceed 200 characters"],
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    industry: {
      type: String,
      trim: true,
      default: "Information Technology",
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500-1000", "1000+"],
      default: "51-200",
    },
    location: {
      type: String,
      trim: true,
      default: "Bengaluru, India",
    },
    logo: {
      type: String,
      default: "",
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanyProfile", companyProfileSchema);
