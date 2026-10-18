const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate bookmarks per user
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });
savedJobSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("SavedJob", savedJobSchema);
