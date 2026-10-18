/**
 * Skill Intelligence Engine — Master Facade
 * JobPortal 2.0 — Phase 4F Deterministic & Explainable
 */

const {
  SKILL_INTELLIGENCE_VERSION,
  SKILL_CATEGORIES,
  VALID_SKILL_CATEGORIES_LIST,
  EVIDENCE_SOURCES,
  SKILL_LEVELS,
  SKILL_MATCH_STATUS,
  RECOMMENDATION_PRIORITY,
  CATEGORY_DISPLAY_LABELS,
} = require("./skillIntelligenceConstants");

const { CANONICAL_SKILL_DICTIONARY, CANONICAL_MAP_BY_KEY, ALIAS_LOOKUP_MAP } = require("./skillDictionary");
const { normalizeSkill, normalizeSkillsList, slugifySkill } = require("./skillNormalizer");
const { normalizeCategory, getCategoryLabel, isValidCategory } = require("./skillCategorizer");
const { extractSkillsFromResume, extractSkillsFromCandidateProfile, scanTextForSkills } = require("./skillExtractor");
const { buildCandidateSkillProfile } = require("./candidateSkillProfile");
const { extractSkillsFromJob } = require("./jobSkillExtractor");
const { analyzeSkillGap } = require("./skillGapAnalyzer");
const { generateSkillRecommendations } = require("./recommendationEngine");

/**
 * High-level helper: Analyzes a resume document and returns its complete skill intelligence profile.
 * @param {object} resumeDoc - Mongoose Resume document or object with .content
 * @returns {object}
 */
const analyzeResumeSkills = (resumeDoc) => {
  if (!resumeDoc) return null;
  const profile = buildCandidateSkillProfile(resumeDoc, {
    candidateId: resumeDoc.user,
    resumeId: resumeDoc._id,
    title: resumeDoc.title,
  });

  return {
    version: SKILL_INTELLIGENCE_VERSION,
    analyzedAt: new Date().toISOString(),
    ...profile,
  };
};

/**
 * High-level helper: Analyzes skill gap between a resume and a job document.
 * @param {object} resumeDoc - Resume document
 * @param {object} jobDoc - Job document
 * @returns {object}
 */
const analyzeResumeSkillGapAgainstJob = (resumeDoc, jobDoc) => {
  if (!resumeDoc || !jobDoc) return null;

  const candidateProfile = buildCandidateSkillProfile(resumeDoc, {
    candidateId: resumeDoc.user,
    resumeId: resumeDoc._id,
    title: resumeDoc.title,
  });

  const jobSkills = extractSkillsFromJob(jobDoc);
  const gapAnalysis = analyzeSkillGap(candidateProfile, jobSkills);
  const recommendationsResult = generateSkillRecommendations(gapAnalysis.missing, {
    jobTitle: jobDoc.title,
    company: jobDoc.company,
  });

  return {
    version: SKILL_INTELLIGENCE_VERSION,
    analyzedAt: gapAnalysis.analyzedAt,
    candidate: gapAnalysis.candidate,
    job: gapAnalysis.job,
    matched: gapAnalysis.matched,
    missing: gapAnalysis.missing,
    unresolved: gapAnalysis.unresolved,
    metrics: gapAnalysis.metrics,
    recommendations: recommendationsResult.recommendations,
    recommendationsByCategory: recommendationsResult.groupedByCategory,
    totalRecommendations: recommendationsResult.totalRecommendations,
  };
};

module.exports = {
  SKILL_INTELLIGENCE_VERSION,
  SKILL_CATEGORIES,
  VALID_SKILL_CATEGORIES_LIST,
  EVIDENCE_SOURCES,
  SKILL_LEVELS,
  SKILL_MATCH_STATUS,
  RECOMMENDATION_PRIORITY,
  CATEGORY_DISPLAY_LABELS,
  CANONICAL_SKILL_DICTIONARY,
  CANONICAL_MAP_BY_KEY,
  ALIAS_LOOKUP_MAP,
  normalizeSkill,
  normalizeSkillsList,
  slugifySkill,
  normalizeCategory,
  getCategoryLabel,
  isValidCategory,
  extractSkillsFromResume,
  extractSkillsFromCandidateProfile,
  scanTextForSkills,
  buildCandidateSkillProfile,
  extractSkillsFromJob,
  analyzeSkillGap,
  generateSkillRecommendations,
  analyzeResumeSkills,
  analyzeResumeSkillGapAgainstJob,
};
