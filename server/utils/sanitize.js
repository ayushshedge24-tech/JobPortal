/**
 * Sanitizes and escapes user input strings for safe use in RegExp constructors
 * to prevent Catastrophic Backtracking (ReDoS) and NoSQL injection.
 */
function escapeRegex(text) {
  if (!text || typeof text !== "string") return "";
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Bounds pagination page and limit parameters safely
 */
function boundPagination(page, limit, defaultLimit = 20, maxLimit = 50) {
  const boundedPage = Math.max(1, parseInt(page, 10) || 1);
  const boundedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit, 10) || defaultLimit));
  return { page: boundedPage, limit: boundedLimit };
}

module.exports = {
  escapeRegex,
  boundPagination,
};
