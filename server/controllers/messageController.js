const messagingService = require("../services/messaging/messagingService");

/**
 * Lists conversations for current user (candidate or recruiter)
 */
async function listConversations(req, res, next) {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const { page, limit, search, unreadOnly } = req.query;

    const result = await messagingService.getConversationsForUser({
      userId,
      role,
      page,
      limit,
      search,
      unreadOnly,
    });

    return res.status(200).json({
      success: true,
      data: result.conversations,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Gets or initializes a conversation thread for an application
 */
async function getOrCreateConversation(req, res, next) {
  try {
    const { applicationId, candidateId, recruiterId } = req.body;
    const currentUserId = req.user._id;

    const conversation = await messagingService.getOrCreateConversation({
      applicationId,
      candidateId,
      recruiterId,
      currentUserId,
    });

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Gets single conversation by ID
 */
async function getConversationById(req, res, next) {
  try {
    const conversationId = req.params.id || req.params.conversationId;
    const userId = req.user._id;
    const userRole = req.user.role;

    const conversation = await messagingService.getConversationById({
      conversationId,
      userId,
      userRole,
    });

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Gets message history for a conversation
 */
async function getMessages(req, res, next) {
  try {
    const conversationId = req.params.id || req.params.conversationId;
    const userId = req.user._id;
    const userRole = req.user.role;
    const { page, limit } = req.query;

    const result = await messagingService.getMessagesForConversation({
      conversationId,
      userId,
      userRole,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Sends a new message in a conversation
 */
async function sendMessage(req, res, next) {
  try {
    const conversationId = req.params.id || req.params.conversationId;
    const senderId = req.user._id;
    const senderRole = req.user.role;
    const { body } = req.body;

    const message = await messagingService.sendMessage({
      conversationId,
      senderId,
      senderRole,
      body,
    });

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Marks messages in a conversation as read
 */
async function markConversationAsRead(req, res, next) {
  try {
    const conversationId = req.params.id || req.params.conversationId;
    const userId = req.user._id;
    const userRole = req.user.role;

    const result = await messagingService.markConversationAsRead({
      conversationId,
      userId,
      userRole,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Gets unread message count for current user
 */
async function getUnreadCount(req, res, next) {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    const result = await messagingService.getUnreadMessageCount({
      userId,
      role,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listConversations,
  getOrCreateConversation,
  getConversationById,
  getMessages,
  sendMessage,
  markConversationAsRead,
  getUnreadCount,
};
