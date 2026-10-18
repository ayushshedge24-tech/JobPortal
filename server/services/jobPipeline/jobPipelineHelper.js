const {
  PIPELINE_STATUSES,
  STATUS_LABELS,
  STATUS_BADGE_VARIANTS,
  STATUS_MAP,
} = require("./jobPipelineConstants");

/**
 * Normalizes any legacy or case-varied status string to canonical pipeline status
 * @param {string} rawStatus 
 * @returns {string} Normalized status key
 */
function normalizeApplicationStatus(rawStatus) {
  if (!rawStatus || typeof rawStatus !== "string") return PIPELINE_STATUSES.APPLIED;
  const lower = rawStatus.trim().toLowerCase();
  return STATUS_MAP[lower] || rawStatus.toUpperCase();
}

/**
 * Builds factual application timeline strictly grounded in stored timestamps and statusHistory
 * @param {Object} app Application document
 * @returns {Array} List of factual milestone events
 */
function buildApplicationTimeline(app) {
  if (!app) return [];
  const events = [];

  // Initial submission milestone (always strictly factual from createdAt)
  const submissionDate = app.createdAt ? new Date(app.createdAt).toISOString() : new Date().toISOString();
  events.push({
    status: PIPELINE_STATUSES.APPLIED,
    label: STATUS_LABELS.APPLIED,
    timestamp: submissionDate,
    note: app.coverLetter ? "Application submitted with cover note" : "Application submitted",
    isInitial: true,
  });

  // Include actual recorded status transitions if present in statusHistory
  if (Array.isArray(app.statusHistory) && app.statusHistory.length > 0) {
    app.statusHistory.forEach((hist) => {
      const normStatus = normalizeApplicationStatus(hist.status);
      // Skip duplicate initial applied status if timestamp matches
      if (normStatus === PIPELINE_STATUSES.APPLIED && new Date(hist.changedAt).getTime() === new Date(submissionDate).getTime()) {
        return;
      }
      events.push({
        status: normStatus,
        label: STATUS_LABELS[normStatus] || normStatus,
        timestamp: hist.changedAt ? new Date(hist.changedAt).toISOString() : new Date().toISOString(),
        note: hist.note || `Status transitioned to ${STATUS_LABELS[normStatus] || normStatus}`,
        isInitial: false,
      });
    });
  } else {
    // If no history array exists yet but current status has progressed beyond Applied
    const currentNorm = normalizeApplicationStatus(app.status);
    if (currentNorm !== PIPELINE_STATUSES.APPLIED && app.updatedAt) {
      events.push({
        status: currentNorm,
        label: STATUS_LABELS[currentNorm] || currentNorm,
        timestamp: new Date(app.updatedAt).toISOString(),
        note: `Current recorded status: ${STATUS_LABELS[currentNorm] || currentNorm}`,
        isInitial: false,
      });
    }
  }

  // Sort chronologically ascending
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Aggregates real pipeline counts across candidate applications without fake stats
 * @param {Array} applications 
 * @returns {Object} Factual count summary
 */
function aggregatePipelineMetrics(applications = []) {
  const metrics = {
    total: applications.length,
    applied: 0,
    underReview: 0,
    shortlisted: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0,
  };

  applications.forEach((app) => {
    const norm = normalizeApplicationStatus(app.status);
    switch (norm) {
      case PIPELINE_STATUSES.APPLIED:
        metrics.applied++;
        break;
      case PIPELINE_STATUSES.UNDER_REVIEW:
        metrics.underReview++;
        break;
      case PIPELINE_STATUSES.SHORTLISTED:
        metrics.shortlisted++;
        break;
      case PIPELINE_STATUSES.INTERVIEW:
        metrics.interview++;
        break;
      case PIPELINE_STATUSES.OFFER:
        metrics.offer++;
        break;
      case PIPELINE_STATUSES.REJECTED:
        metrics.rejected++;
        break;
      case PIPELINE_STATUSES.WITHDRAWN:
        metrics.withdrawn++;
        break;
      default:
        metrics.applied++;
        break;
    }
  });

  return metrics;
}

module.exports = {
  normalizeApplicationStatus,
  buildApplicationTimeline,
  aggregatePipelineMetrics,
};
