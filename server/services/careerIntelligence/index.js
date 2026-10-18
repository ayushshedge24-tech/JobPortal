/**
 * Career Intelligence Service — Master Facade
 * JobPortal 2.0 — Phase 4H Candidate Career Intelligence Workspace
 */

const {
  CAREER_INTELLIGENCE_VERSION,
  ACTION_SOURCES,
  ACTION_PRIORITIES,
  RESUME_READINESS_STATUS,
} = require("./careerIntelligenceConstants");

const {
  deriveProfileActions,
  mapAnalyzerActions,
  aggregateCareerActions,
} = require("./careerActionAggregator");

const { buildCareerIntelligence } = require("./careerIntelligenceEngine");

module.exports = {
  CAREER_INTELLIGENCE_VERSION,
  ACTION_SOURCES,
  ACTION_PRIORITIES,
  RESUME_READINESS_STATUS,
  deriveProfileActions,
  mapAnalyzerActions,
  aggregateCareerActions,
  buildCareerIntelligence,
};
