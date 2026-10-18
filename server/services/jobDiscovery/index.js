/**
 * Job Discovery Service — Master Facade
 * JobPortal 2.0 — Phase 4I Deterministic Job Discovery & Recommendations
 */

const {
  JOB_DISCOVERY_VERSION,
  DISCOVERY_ALIGNMENT_STATUS,
  DISCOVERY_ALIGNMENT_DISPLAY,
  DISCOVERY_SORT_OPTIONS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} = require("./jobDiscoveryConstants");

const { escapeRegex, buildDiscoveryFilters } = require("./jobDiscoveryFilters");
const { buildDiscoveryReasons } = require("./jobDiscoveryReasonBuilder");
const { evaluateJobDiscoveryAlignment, rankDiscoveredJobs } = require("./jobDiscoveryRanker");
const { discoverRecommendedJobs } = require("./jobDiscoveryEngine");

module.exports = {
  JOB_DISCOVERY_VERSION,
  DISCOVERY_ALIGNMENT_STATUS,
  DISCOVERY_ALIGNMENT_DISPLAY,
  DISCOVERY_SORT_OPTIONS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  escapeRegex,
  buildDiscoveryFilters,
  buildDiscoveryReasons,
  evaluateJobDiscoveryAlignment,
  rankDiscoveredJobs,
  discoverRecommendedJobs,
};
