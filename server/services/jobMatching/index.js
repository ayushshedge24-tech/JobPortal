/**
 * Job Matching Engine — Master Facade
 * JobPortal 2.0 — Phase 4G Deterministic & Explainable
 */

const {
  JOB_MATCHING_VERSION,
  MATCH_STATUS,
  MATCH_STATUS_DISPLAY,
  FACTOR_STATUS,
  EXPERIENCE_ALIGNMENT_STATUS,
  MATCH_FACTOR_TYPES,
  FACTOR_DISPLAY_LABELS,
} = require("./jobMatchingConstants");

const { buildSkillEvidence } = require("./matchEvidenceBuilder");
const {
  parseJobExperienceRange,
  extractCandidateExperienceYears,
  evaluateRequiredSkills,
  evaluatePreferredSkills,
  evaluateExperienceAlignment,
  evaluateWorkModeAlignment,
  evaluateLocationAlignment,
  evaluateCategoryAlignment,
} = require("./matchFactorEngine");

const { generateJobMatchRecommendations } = require("./matchRecommendationEngine");
const { evaluateJobMatch, determineMatchStatus } = require("./explainableMatchEngine");

module.exports = {
  JOB_MATCHING_VERSION,
  MATCH_STATUS,
  MATCH_STATUS_DISPLAY,
  FACTOR_STATUS,
  EXPERIENCE_ALIGNMENT_STATUS,
  MATCH_FACTOR_TYPES,
  FACTOR_DISPLAY_LABELS,
  buildSkillEvidence,
  parseJobExperienceRange,
  extractCandidateExperienceYears,
  evaluateRequiredSkills,
  evaluatePreferredSkills,
  evaluateExperienceAlignment,
  evaluateWorkModeAlignment,
  evaluateLocationAlignment,
  evaluateCategoryAlignment,
  generateJobMatchRecommendations,
  evaluateJobMatch,
  determineMatchStatus,
};
