const mongoose = require("mongoose");
const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const Job = require("../../models/Job");
const Application = require("../../models/Application");
const User = require("../../models/User");
const { createNotification } = require("../notificationService");
const MESSAGING_CONSTANTS = require("./messagingConstants");

/**
 * Sanitize plain text string and strip HTML
 */
function sanitizeText(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/\r\n/g, "\n") // Normalize CRLF
    .replace(/\r/g, "\n")
    .trim();
}

/**
 * Deterministically retrieves or initializes a single conversation thread
 * between candidate and recruiter linked to a valid application.
 */
async function getOrCreateConversation({ candidateId, recruiterId, applicationId, currentUserId }) {
  if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
    const err = new Error("Invalid or missing applicationId.");
    err.status = 400;
    err.code = "INVALID_APPLICATION_ID";
    throw err;
  }

  const application = await Application.findById(applicationId)
    .populate("job")
    .populate("applicant", "name email role isActive");

  if (!application) {
    const err = new Error("Application not found.");
    err.status = 404;
    err.code = "APPLICATION_NOT_FOUND";
    throw err;
  }

  const job = application.job;
  if (!job) {
    const err = new Error("Associated job listing not found.");
    err.status = 404;
    err.code = "JOB_NOT_FOUND";
    throw err;
  }

  const derivedCandidateId = application.applicant._id || application.applicant;
  const derivedRecruiterId = job.postedBy;

  // Verify candidateId and recruiterId if explicitly passed
  if (candidateId && candidateId.toString() !== derivedCandidateId.toString()) {
    const err = new Error("Application applicant does not match the provided candidate.");
    err.status = 403;
    err.code = "APPLICATION_CANDIDATE_MISMATCH";
    throw err;
  }

  if (recruiterId && recruiterId.toString() !== derivedRecruiterId.toString()) {
    const err = new Error("Job owner does not match the provided recruiter.");
    err.status = 403;
    err.code = "JOB_RECRUITER_MISMATCH";
    throw err;
  }

  // Verify caller identity: caller must be candidate or recruiter
  const currentStr = currentUserId.toString();
  const isCandidate = currentStr === derivedCandidateId.toString();
  const isRecruiter = currentStr === derivedRecruiterId.toString();

  if (!isCandidate && !isRecruiter) {
    const err = new Error("You are not authorized to start or access this conversation.");
    err.status = 403;
    err.code = "UNAUTHORIZED_CONVERSATION_PARTICIPANT";
    throw err;
  }

  // Query existing conversation by unique tuple (candidate, recruiter, application)
  let conversation = await Conversation.findOne({
    candidate: derivedCandidateId,
    recruiter: derivedRecruiterId,
    application: application._id,
  })
    .populate("candidate", "name email role")
    .populate("recruiter", "name email role")
    .populate("job", "title company location status")
    .populate("application", "status createdAt resumeTitle");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [derivedCandidateId, derivedRecruiterId],
      job: job._id,
      application: application._id,
      candidate: derivedCandidateId,
      recruiter: derivedRecruiterId,
      lastMessage: {
        text: "",
        sender: null,
        createdAt: new Date(),
      },
      lastMessageAt: new Date(),
      candidateUnreadCount: 0,
      recruiterUnreadCount: 0,
      status: "ACTIVE",
    });

    conversation = await Conversation.findById(conversation._id)
      .populate("candidate", "name email role")
      .populate("recruiter", "name email role")
      .populate("job", "title company location status")
      .populate("application", "status createdAt resumeTitle");
  }

  return conversation;
}

/**
 * Returns paginated conversation stream for a user (candidate or recruiter)
 */
async function getConversationsForUser({ userId, role, page = 1, limit = 20, search = "", unreadOnly = false }) {
  const boundedPage = Math.max(1, parseInt(page, 10) || 1);
  const boundedLimit = Math.min(
    MESSAGING_CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, parseInt(limit, 10) || MESSAGING_CONSTANTS.DEFAULT_PAGE_SIZE)
  );

  const normalizedRole = role === "jobseeker" ? "JOB_SEEKER" : role === "employer" ? "RECRUITER" : role;
  const isCandidate = normalizedRole === "JOB_SEEKER";

  const query = {};
  if (isCandidate) {
    query.candidate = userId;
    if (unreadOnly === true || unreadOnly === "true") {
      query.candidateUnreadCount = { $gt: 0 };
    }
  } else {
    query.recruiter = userId;
    if (unreadOnly === true || unreadOnly === "true") {
      query.recruiterUnreadCount = { $gt: 0 };
    }
  }

  // Populate references
  const rawConversations = await Conversation.find(query)
    .sort({ lastMessageAt: -1, _id: 1 })
    .populate("candidate", "name email role")
    .populate("recruiter", "name email role")
    .populate("job", "title company location status")
    .populate("application", "status createdAt resumeTitle")
    .lean();

  // Search filter if provided
  let filtered = rawConversations;
  if (search && typeof search === "string" && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    filtered = rawConversations.filter((c) => {
      const jobTitle = c.job?.title?.toLowerCase() || "";
      const company = c.job?.company?.toLowerCase() || "";
      const otherUser = isCandidate ? c.recruiter?.name?.toLowerCase() || "" : c.candidate?.name?.toLowerCase() || "";
      return jobTitle.includes(q) || company.includes(q) || otherUser.includes(q);
    });
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / boundedLimit) || 1;
  const paginated = filtered.slice((boundedPage - 1) * boundedLimit, boundedPage * boundedLimit);

  // Format safe summary response
  const items = paginated.map((c) => ({
    _id: c._id,
    conversationId: c._id,
    job: {
      _id: c.job?._id,
      title: c.job?.title || "Job Listing",
      company: c.job?.company || "Company",
      location: c.job?.location,
      status: c.job?.status,
    },
    application: {
      _id: c.application?._id,
      status: c.application?.status || "Applied",
      resumeTitle: c.application?.resumeTitle,
      appliedAt: c.application?.createdAt,
    },
    candidate: {
      _id: c.candidate?._id,
      name: c.candidate?.name || "Candidate",
      email: c.candidate?.email,
    },
    recruiter: {
      _id: c.recruiter?._id,
      name: c.recruiter?.name || "Recruiter",
      email: c.recruiter?.email,
    },
    participant: isCandidate ? c.recruiter : c.candidate,
    lastMessage: c.lastMessage || { text: "", sender: null, createdAt: c.lastMessageAt },
    lastMessageAt: c.lastMessageAt,
    unreadCount: isCandidate ? c.candidateUnreadCount || 0 : c.recruiterUnreadCount || 0,
    status: c.status,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  return {
    conversations: items,
    pagination: {
      page: boundedPage,
      limit: boundedLimit,
      total,
      totalPages,
    },
  };
}

/**
 * Returns single conversation by ID verifying participant membership
 */
async function getConversationById({ conversationId, userId, userRole }) {
  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    const err = new Error("Invalid conversation ID.");
    err.status = 400;
    err.code = "INVALID_CONVERSATION_ID";
    throw err;
  }

  const conversation = await Conversation.findById(conversationId)
    .populate("candidate", "name email role")
    .populate("recruiter", "name email role")
    .populate("job", "title company location status")
    .populate("application", "status createdAt resumeTitle coverLetter")
    .lean();

  if (!conversation) {
    const err = new Error("Conversation not found.");
    err.status = 404;
    err.code = "CONVERSATION_NOT_FOUND";
    throw err;
  }

  const userStr = userId.toString();
  const isCandidate = conversation.candidate?._id?.toString() === userStr;
  const isRecruiter = conversation.recruiter?._id?.toString() === userStr;

  if (!isCandidate && !isRecruiter) {
    const err = new Error("You are not authorized to view this conversation.");
    err.status = 403;
    err.code = "FORBIDDEN_CONVERSATION";
    throw err;
  }

  return {
    ...conversation,
    unreadCount: isCandidate ? conversation.candidateUnreadCount || 0 : conversation.recruiterUnreadCount || 0,
  };
}

/**
 * Returns paginated chronological messages for a conversation
 */
async function getMessagesForConversation({ conversationId, userId, userRole, page = 1, limit = 50 }) {
  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    const err = new Error("Invalid conversation ID.");
    err.status = 400;
    err.code = "INVALID_CONVERSATION_ID";
    throw err;
  }

  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) {
    const err = new Error("Conversation not found.");
    err.status = 404;
    err.code = "CONVERSATION_NOT_FOUND";
    throw err;
  }

  const userStr = userId.toString();
  const isCandidate = conversation.candidate?.toString() === userStr;
  const isRecruiter = conversation.recruiter?.toString() === userStr;

  if (!isCandidate && !isRecruiter) {
    const err = new Error("You are not authorized to access messages in this conversation.");
    err.status = 403;
    err.code = "FORBIDDEN_CONVERSATION";
    throw err;
  }

  const boundedPage = Math.max(1, parseInt(page, 10) || 1);
  const boundedLimit = Math.min(
    MESSAGING_CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, parseInt(limit, 10) || MESSAGING_CONSTANTS.MAX_PAGE_SIZE)
  );

  const query = { conversation: conversationId };
  const total = await Message.countDocuments(query);
  const totalPages = Math.ceil(total / boundedLimit) || 1;

  const messages = await Message.find(query)
    .sort({ createdAt: 1, _id: 1 })
    .skip((boundedPage - 1) * boundedLimit)
    .limit(boundedLimit)
    .populate("sender", "name email role")
    .populate("recipient", "name email role")
    .lean();

  return {
    messages,
    pagination: {
      page: boundedPage,
      limit: boundedLimit,
      total,
      totalPages,
    },
  };
}

/**
 * Sends a new message in a conversation
 */
async function sendMessage({ conversationId, senderId, senderRole, body }) {
  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    const err = new Error("Invalid conversation ID.");
    err.status = 400;
    err.code = "INVALID_CONVERSATION_ID";
    throw err;
  }

  const cleanBody = sanitizeText(body);
  if (!cleanBody || cleanBody.length < MESSAGING_CONSTANTS.MIN_BODY_LENGTH) {
    const err = new Error("Message body cannot be empty or solely whitespace.");
    err.status = 400;
    err.code = "EMPTY_MESSAGE_BODY";
    throw err;
  }

  if (cleanBody.length > MESSAGING_CONSTANTS.MAX_BODY_LENGTH) {
    const err = new Error(`Message exceeds maximum length of ${MESSAGING_CONSTANTS.MAX_BODY_LENGTH} characters.`);
    err.status = 400;
    err.code = "MESSAGE_TOO_LONG";
    throw err;
  }

  const conversation = await Conversation.findById(conversationId).populate("job", "title company");
  if (!conversation) {
    const err = new Error("Conversation not found.");
    err.status = 404;
    err.code = "CONVERSATION_NOT_FOUND";
    throw err;
  }

  if (conversation.status === "ARCHIVED" || conversation.status === "BLOCKED") {
    const err = new Error(`Cannot send message: conversation is ${conversation.status.toLowerCase()}.`);
    err.status = 400;
    err.code = "CONVERSATION_NOT_ACTIVE";
    throw err;
  }

  const senderStr = senderId.toString();
  const isCandidate = conversation.candidate.toString() === senderStr;
  const isRecruiter = conversation.recruiter.toString() === senderStr;

  if (!isCandidate && !isRecruiter) {
    const err = new Error("You are not a participant in this conversation.");
    err.status = 403;
    err.code = "UNAUTHORIZED_SENDER";
    throw err;
  }

  // Derive recipient strictly server-side
  const recipientId = isCandidate ? conversation.recruiter : conversation.candidate;

  // Create immutable message record
  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    recipient: recipientId,
    body: cleanBody,
    messageType: "TEXT",
    isRead: false,
    readAt: null,
  });

  // Update conversation lastMessage & unread count
  conversation.lastMessage = {
    text: cleanBody.length > 200 ? cleanBody.substring(0, 197) + "..." : cleanBody,
    sender: senderId,
    createdAt: message.createdAt,
  };
  conversation.lastMessageAt = message.createdAt;

  if (isCandidate) {
    conversation.recruiterUnreadCount = (conversation.recruiterUnreadCount || 0) + 1;
  } else {
    conversation.candidateUnreadCount = (conversation.candidateUnreadCount || 0) + 1;
  }

  await conversation.save();

  // Trigger Phase 4K notification for recipient with privacy preserved (no full body in notification)
  try {
    const jobTitle = conversation.job?.title || "your application";
    const sender = await User.findById(senderId).select("name").lean();
    const senderName = sender?.name || "A user";

    await createNotification({
      user: recipientId,
      type: "MESSAGE_RECEIVED",
      title: "New message",
      message: `You have a new message from ${senderName} regarding ${jobTitle}.`,
      entityType: "CONVERSATION",
      entityId: conversation._id,
      metadata: {
        conversationId: conversation._id.toString(),
        messageId: message._id.toString(),
        jobId: conversation.job?._id?.toString() || "",
        applicationId: conversation.application?.toString() || "",
      },
      eventKey: `MESSAGE_RECEIVED_${message._id}`,
    });
  } catch (notifErr) {
    console.error("Failed to dispatch Phase 4K message notification:", notifErr);
  }

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name email role")
    .populate("recipient", "name email role")
    .lean();

  return populatedMessage;
}

/**
 * Marks all unread messages received by the user in this conversation as read
 */
async function markConversationAsRead({ conversationId, userId, userRole }) {
  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    const err = new Error("Invalid conversation ID.");
    err.status = 400;
    err.code = "INVALID_CONVERSATION_ID";
    throw err;
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error("Conversation not found.");
    err.status = 404;
    err.code = "CONVERSATION_NOT_FOUND";
    throw err;
  }

  const userStr = userId.toString();
  const isCandidate = conversation.candidate.toString() === userStr;
  const isRecruiter = conversation.recruiter.toString() === userStr;

  if (!isCandidate && !isRecruiter) {
    const err = new Error("You are not authorized to access this conversation.");
    err.status = 403;
    err.code = "FORBIDDEN_CONVERSATION";
    throw err;
  }

  // Update all unread messages sent to this user in this conversation
  const updateResult = await Message.updateMany(
    {
      conversation: conversationId,
      recipient: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  // Reset participant unread count on conversation
  if (isCandidate) {
    conversation.candidateUnreadCount = 0;
  } else {
    conversation.recruiterUnreadCount = 0;
  }
  await conversation.save();

  return {
    success: true,
    markedReadCount: updateResult.modifiedCount || 0,
  };
}

/**
 * Returns factual total unread message count across all user conversations
 */
async function getUnreadMessageCount({ userId, role }) {
  const normalizedRole = role === "jobseeker" ? "JOB_SEEKER" : role === "employer" ? "RECRUITER" : role;
  const isCandidate = normalizedRole === "JOB_SEEKER";

  const count = await Message.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return { unreadCount: count };
}

module.exports = {
  getOrCreateConversation,
  getConversationsForUser,
  getConversationById,
  getMessagesForConversation,
  sendMessage,
  markConversationAsRead,
  getUnreadMessageCount,
  sanitizeText,
};
