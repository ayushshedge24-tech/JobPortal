/**
 * Job Discovery Constants
 * JobPortal 2.0 — Phase 4I Deterministic Job Discovery & Recommendations
 */

const JOB_DISCOVERY_VERSION = "1.0.0";

const DISCOVERY_ALIGNMENT_STATUS = Object.freeze({
  HIGH_ALIGNMENT: "HIGH_ALIGNMENT",
  GOOD_ALIGNMENT: "GOOD_ALIGNMENT",
  PARTIAL_ALIGNMENT: "PARTIAL_ALIGNMENT",
  DISCOVERY_ONLY: "DISCOVERY_ONLY",
});

const DISCOVERY_ALIGNMENT_DISPLAY = Object.freeze({
  HIGH_ALIGNMENT: {
    label: "High Alignment",
    badgeClass: "badge-green",
    description: "Strong overlap with your declared skills and working preferences.",
  },
  GOOD_ALIGNMENT: {
    label: "Good Alignment",
    badgeClass: "badge-blue",
    description: "Matches key technical skills in your candidate profile.",
  },
  PARTIAL_ALIGNMENT: {
    label: "Partial Alignment",
    badgeClass: "badge-amber",
    description: "Matches your career category, work mode, or location preferences.",
  },
  DISCOVERY_ONLY: {
    label: "Discovery Listing",
    badgeClass: "badge-neutral",
    description: "Active industry opening matching your broader exploration parameters.",
  },
});

const DISCOVERY_SORT_OPTIONS = Object.freeze({
  RELEVANCE: "RELEVANCE",
  NEWEST: "NEWEST",
  SALARY_HIGH: "SALARY_HIGH",
  SALARY_LOW: "SALARY_LOW",
});

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

module.exports = {
  JOB_DISCOVERY_VERSION,
  DISCOVERY_ALIGNMENT_STATUS,
  DISCOVERY_ALIGNMENT_DISPLAY,
  DISCOVERY_SORT_OPTIONS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
