/**
 * Phase 4L: Recruiter Workspace & ATS Constants
 */

const RECRUITER_VERSION = "1.0.0";

const ATS_STATUSES = Object.freeze({
  APPLIED: "APPLIED",
  UNDER_REVIEW: "UNDER_REVIEW",
  SHORTLISTED: "SHORTLISTED",
  INTERVIEW: "INTERVIEW",
  OFFER: "OFFER",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
});

const RECRUITER_ALLOWED_STATUSES = Object.freeze([
  ATS_STATUSES.APPLIED,
  ATS_STATUSES.UNDER_REVIEW,
  ATS_STATUSES.SHORTLISTED,
  ATS_STATUSES.INTERVIEW,
  ATS_STATUSES.OFFER,
  ATS_STATUSES.REJECTED,
]);

const JOB_STATUSES = Object.freeze({
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  CLOSED: "CLOSED",
  ARCHIVED: "ARCHIVED",
});

const ATS_STATUS_META = Object.freeze({
  [ATS_STATUSES.APPLIED]: {
    label: "Applied",
    color: "blue",
    badgeClass: "badge-blue",
    description: "Application received and pending initial screening.",
  },
  [ATS_STATUSES.UNDER_REVIEW]: {
    label: "Under Review",
    color: "amber",
    badgeClass: "badge-amber",
    description: "Recruiter is currently evaluating candidate resume and portfolio.",
  },
  [ATS_STATUSES.SHORTLISTED]: {
    label: "Shortlisted",
    color: "purple",
    badgeClass: "badge-purple",
    description: "Candidate meets core criteria and is shortlisted for hiring rounds.",
  },
  [ATS_STATUSES.INTERVIEW]: {
    label: "Interview",
    color: "indigo",
    badgeClass: "badge-indigo",
    description: "Candidate is scheduled for technical or behavioral interviews.",
  },
  [ATS_STATUSES.OFFER]: {
    label: "Offer Extended",
    color: "emerald",
    badgeClass: "badge-green",
    description: "Formal job offer extended to the candidate.",
  },
  [ATS_STATUSES.REJECTED]: {
    label: "Not Selected",
    color: "rose",
    badgeClass: "badge-red",
    description: "Candidate was not selected for this position.",
  },
  [ATS_STATUSES.WITHDRAWN]: {
    label: "Withdrawn",
    color: "gray",
    badgeClass: "badge-gray",
    description: "Candidate voluntarily withdrew this application.",
  },
});

function normalizeStatus(rawStatus) {
  if (!rawStatus) return ATS_STATUSES.APPLIED;
  const s = String(rawStatus).trim().toUpperCase().replace(/\s+/g, "_");
  if (s === "APPLIED") return ATS_STATUSES.APPLIED;
  if (s === "UNDER_REVIEW" || s === "UNDER REVIEW") return ATS_STATUSES.UNDER_REVIEW;
  if (s === "SHORTLISTED") return ATS_STATUSES.SHORTLISTED;
  if (s === "INTERVIEW") return ATS_STATUSES.INTERVIEW;
  if (s === "OFFER" || s === "SELECTED") return ATS_STATUSES.OFFER;
  if (s === "REJECTED") return ATS_STATUSES.REJECTED;
  if (s === "WITHDRAWN") return ATS_STATUSES.WITHDRAWN;
  return ATS_STATUSES.APPLIED;
}

module.exports = {
  RECRUITER_VERSION,
  ATS_STATUSES,
  RECRUITER_ALLOWED_STATUSES,
  JOB_STATUSES,
  ATS_STATUS_META,
  normalizeStatus,
};
