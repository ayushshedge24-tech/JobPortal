const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "Applied",
        "Shortlisted",
        "Rejected",
        "Selected",
        "Under Review",
        "Interview",
        "Offer",
        "Withdrawn",
        "APPLIED",
        "UNDER_REVIEW",
        "SHORTLISTED",
        "INTERVIEW",
        "OFFER",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "Applied",
      index: true,
    },

    resume: {
      type: String,
    },

    // Optional snapshot link to a structured Resume document
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },

    resumeVersion: {
      type: Number,
    },

    resumeTitle: {
      type: String,
    },

    coverLetter: {
      type: String,
    },

    applicantName: {
      type: String,
    },

    applicantEmail: {
      type: String,
    },

    phone: {
      type: String,
    },

    currentLocation: {
      type: String,
    },

    currentCtc: {
      type: String,
    },

    expectedCtc: {
      type: String,
    },

    noticePeriod: {
      type: String,
    },

    experienceYears: {
      type: String,
    },

    portfolio: {
      type: String,
    },

    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);
