/**
 * Phase 4G Job Matching Constants
 * JobPortal 2.0 — Deterministic & Explainable Job Matching Engine
 */

const JOB_MATCHING_VERSION = "1.0.0";

const MATCH_STATUS = Object.freeze({
  STRONG_ALIGNMENT: "STRONG_ALIGNMENT",
  PARTIAL_ALIGNMENT: "PARTIAL_ALIGNMENT",
  LIMITED_ALIGNMENT: "LIMITED_ALIGNMENT",
  INSUFFICIENT_DATA: "INSUFFICIENT_DATA",
});

const MATCH_STATUS_DISPLAY = Object.freeze({
  STRONG_ALIGNMENT: {
    label: "Strong Alignment",
    description: "Required structured requirements are largely satisfied with strong skill and profile compatibility.",
    badgeClass: "badge-green",
    color: "#10b981",
  },
  PARTIAL_ALIGNMENT: {
    label: "Partial Alignment",
    description: "Several core requirements align with your profile, while specific declared skills or factors remain to be addressed.",
    badgeClass: "badge-amber",
    color: "#f59e0b",
  },
  LIMITED_ALIGNMENT: {
    label: "Limited Alignment",
    description: "Multiple primary declared requirements for this role are currently absent from your candidate profile.",
    badgeClass: "badge-red",
    color: "#ef4444",
  },
  INSUFFICIENT_DATA: {
    label: "Insufficient Data",
    description: "Not enough structured profile or job data is present to evaluate meaningful deterministic alignment.",
    badgeClass: "badge-neutral",
    color: "#64748b",
  },
});

const FACTOR_STATUS = Object.freeze({
  MATCHED: "MATCHED",
  PARTIAL: "PARTIAL",
  NOT_MATCHED: "NOT_MATCHED",
  NOT_EVALUATED: "NOT_EVALUATED",
});

const EXPERIENCE_ALIGNMENT_STATUS = Object.freeze({
  WITHIN_RANGE: "WITHIN_RANGE",
  BELOW_RANGE: "BELOW_RANGE",
  ABOVE_RANGE: "ABOVE_RANGE",
  NOT_EVALUATED: "NOT_EVALUATED",
});

const MATCH_FACTOR_TYPES = Object.freeze({
  REQUIRED_SKILL_MATCH: "REQUIRED_SKILL_MATCH",
  PREFERRED_SKILL_MATCH: "PREFERRED_SKILL_MATCH",
  EXPERIENCE_ALIGNMENT: "EXPERIENCE_ALIGNMENT",
  WORK_MODE_ALIGNMENT: "WORK_MODE_ALIGNMENT",
  LOCATION_ALIGNMENT: "LOCATION_ALIGNMENT",
  CATEGORY_ALIGNMENT: "CATEGORY_ALIGNMENT",
});

const FACTOR_DISPLAY_LABELS = Object.freeze({
  REQUIRED_SKILL_MATCH: "Declared Required Skills",
  PREFERRED_SKILL_MATCH: "Preferred & Mentioned Skills",
  EXPERIENCE_ALIGNMENT: "Experience Range Alignment",
  WORK_MODE_ALIGNMENT: "Work Mode Preference",
  LOCATION_ALIGNMENT: "Location & Geography",
  CATEGORY_ALIGNMENT: "Domain & Role Category",
});

module.exports = {
  JOB_MATCHING_VERSION,
  MATCH_STATUS,
  MATCH_STATUS_DISPLAY,
  FACTOR_STATUS,
  EXPERIENCE_ALIGNMENT_STATUS,
  MATCH_FACTOR_TYPES,
  FACTOR_DISPLAY_LABELS,
};
