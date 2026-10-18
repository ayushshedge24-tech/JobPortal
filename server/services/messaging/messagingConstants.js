/**
 * Phase 4N Messaging Constants
 */
const MESSAGING_CONSTANTS = Object.freeze({
  VERSION: "1.0.0",
  MESSAGE_TYPES: Object.freeze({
    TEXT: "TEXT",
  }),
  CONVERSATION_STATUSES: Object.freeze({
    ACTIVE: "ACTIVE",
    ARCHIVED: "ARCHIVED",
    BLOCKED: "BLOCKED",
  }),
  MAX_BODY_LENGTH: 4000,
  MIN_BODY_LENGTH: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
  RATE_LIMIT_WINDOW_MS: 5 * 60 * 1000, // 5 minutes
  RATE_LIMIT_MAX_MESSAGES: 30, // 30 messages per 5 min window
});

module.exports = MESSAGING_CONSTANTS;
