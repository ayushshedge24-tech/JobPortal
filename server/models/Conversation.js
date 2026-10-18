const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lastMessage: {
      text: {
        type: String,
        trim: true,
        maxlength: 4000,
        default: "",
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
      },
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    candidateUnreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    recruiterUnreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED", "BLOCKED"],
      default: "ACTIVE",
      index: true,
    },
  },
  { timestamps: true }
);

// Logical Uniqueness: Exactly one conversation thread per Candidate + Recruiter + Application
conversationSchema.index({ candidate: 1, recruiter: 1, application: 1 }, { unique: true });

// Compound indexing for rapid participant timeline querying
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ candidate: 1, lastMessageAt: -1 });
conversationSchema.index({ recruiter: 1, lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
