const express = require("express");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/authMiddleware");
const messageController = require("../controllers/messageController");
const MESSAGING_CONSTANTS = require("../services/messaging/messagingConstants");

const router = express.Router();

// Dedicated message send rate limiter (30 msgs / 5 min / authenticated user IP)
const messageSendLimiter = rateLimit({
  windowMs: MESSAGING_CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max: MESSAGING_CONSTANTS.RATE_LIMIT_MAX_MESSAGES,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGenerator: false, xForwardedForHeader: false, default: false },
  keyGenerator: (req) => (req.user ? req.user._id.toString() : req.ip),
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Message rate limit exceeded. Please wait a few minutes before sending more messages.",
    },
  },
});

// All messaging endpoints require authentication
router.use(requireAuth);

// Conversation endpoints - support both mount at /api/conversations and /api
router.get(["/", "/conversations"], messageController.listConversations);
router.post(["/", "/conversations"], messageController.getOrCreateConversation);
router.get(["/unread-count", "/conversations/unread-count"], messageController.getUnreadCount);
router.get(["/:conversationId", "/conversations/:conversationId"], messageController.getConversationById);
router.patch(["/:conversationId/read", "/conversations/:conversationId/read"], messageController.markConversationAsRead);

// Message history & sending endpoints
router.get(["/:conversationId/messages", "/conversations/:conversationId/messages"], messageController.getMessages);
router.post(["/:conversationId/messages", "/conversations/:conversationId/messages"], messageSendLimiter, messageController.sendMessage);

module.exports = router;
