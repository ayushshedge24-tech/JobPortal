const PIPELINE_VERSION = "1.0.0";

const PIPELINE_STATUSES = Object.freeze({
  APPLIED: "APPLIED",
  UNDER_REVIEW: "UNDER_REVIEW",
  SHORTLISTED: "SHORTLISTED",
  INTERVIEW: "INTERVIEW",
  OFFER: "OFFER",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
});

const STATUS_LABELS = Object.freeze({
  APPLIED: "Application Submitted",
  UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview Stage",
  OFFER: "Offer Extended",
  REJECTED: "Application Closed",
  WITHDRAWN: "Withdrawn by Candidate",
});

const STATUS_BADGE_VARIANTS = Object.freeze({
  APPLIED: "blue",
  UNDER_REVIEW: "purple",
  SHORTLISTED: "amber",
  INTERVIEW: "indigo",
  OFFER: "green",
  REJECTED: "red",
  WITHDRAWN: "neutral",
});

const ALLOWED_WITHDRAWAL_STATUSES = Object.freeze([
  "APPLIED",
  "UNDER_REVIEW",
  "Applied",
  "Under Review",
]);

const STATUS_MAP = Object.freeze({
  applied: "APPLIED",
  "under review": "UNDER_REVIEW",
  under_review: "UNDER_REVIEW",
  shortlisted: "SHORTLISTED",
  interview: "INTERVIEW",
  selected: "OFFER",
  offer: "OFFER",
  rejected: "REJECTED",
  withdrawn: "WITHDRAWN",
});

module.exports = {
  PIPELINE_VERSION,
  PIPELINE_STATUSES,
  STATUS_LABELS,
  STATUS_BADGE_VARIANTS,
  ALLOWED_WITHDRAWAL_STATUSES,
  STATUS_MAP,
};
