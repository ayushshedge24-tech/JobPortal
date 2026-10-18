/**
 * Career Action Aggregator Module
 * JobPortal 2.0 — Phase 4H Candidate Career Intelligence Workspace
 *
 * Deterministically compiles and deduplicates recommended actions from:
 * 1. Profile Completion Gaps (PROFILE)
 * 2. Resume Analyzer Recommendations (RESUME_ANALYZER)
 * 3. Skill Intelligence Gaps (SKILL_INTELLIGENCE)
 * 4. Job Matching Gaps (JOB_MATCHING)
 */

const {
  ACTION_SOURCES,
  ACTION_PRIORITIES,
} = require("./careerIntelligenceConstants");

/**
 * Derives actionable recommendations from profile completion gaps.
 * @param {object} profileDoc - CandidateProfile document or object
 * @returns {Array<object>}
 */
const deriveProfileActions = (profileDoc) => {
  const actions = [];
  if (!profileDoc) {
    actions.push({
      id: "ACT-PROF-CREATE",
      source: ACTION_SOURCES.PROFILE,
      priority: ACTION_PRIORITIES.HIGH,
      action: "Create your candidate profile",
      reason: "A complete profile allows recruiters to discover you and improves alignment accuracy.",
      guidance: "Add your contact details, headline, and primary career domain.",
      link: "/profile",
    });
    return actions;
  }

  // Check basic headline
  if (!profileDoc.headline || profileDoc.headline.trim().length < 5) {
    actions.push({
      id: "ACT-PROF-HEADLINE",
      source: ACTION_SOURCES.PROFILE,
      priority: ACTION_PRIORITIES.HIGH,
      action: "Add a professional headline",
      reason: "A clear headline (e.g., 'Full Stack Engineer | React & Node.js') introduces your primary expertise.",
      guidance: "Update your headline in Candidate Profile settings.",
      link: "/profile",
    });
  }

  // Check professional summary
  const summaryText = profileDoc.professionalSummary || profileDoc.bio || "";
  if (!summaryText || summaryText.trim().length < 50) {
    actions.push({
      id: "ACT-PROF-SUMMARY",
      source: ACTION_SOURCES.PROFILE,
      priority: ACTION_PRIORITIES.MEDIUM,
      action: "Add a comprehensive professional summary",
      reason: "Summaries over 50 characters give context to your career journey and key competencies.",
      guidance: "Write 2-3 sentences summarizing your experience and impact.",
      link: "/profile",
    });
  }

  // Check experience
  if (!Array.isArray(profileDoc.experience) || profileDoc.experience.length === 0) {
    actions.push({
      id: "ACT-PROF-EXPERIENCE",
      source: ACTION_SOURCES.PROFILE,
      priority: ACTION_PRIORITIES.HIGH,
      action: "Add structured work experience",
      reason: "Work history is required to accurately evaluate experience-based job requirements.",
      guidance: "List your current or past positions with roles, dates, and responsibilities.",
      link: "/profile",
    });
  }

  // Check skills
  if (!Array.isArray(profileDoc.skills) || profileDoc.skills.length < 3) {
    actions.push({
      id: "ACT-PROF-SKILLS",
      source: ACTION_SOURCES.PROFILE,
      priority: ACTION_PRIORITIES.HIGH,
      action: "List at least 5 core technical skills",
      reason: "Explicitly declaring your top skills improves job matching precision.",
      guidance: "Add your primary programming languages, frameworks, and tools.",
      link: "/profile",
    });
  }

  // Check work mode preferences
  if (!Array.isArray(profileDoc.preferredWorkModes) || profileDoc.preferredWorkModes.length === 0) {
    actions.push({
      id: "ACT-PROF-WORKMODE",
      source: ACTION_SOURCES.PROFILE,
      priority: ACTION_PRIORITIES.LOW,
      action: "Configure preferred work modes",
      reason: "Specifying Remote, Hybrid, or On-site preference helps filter alignment.",
      guidance: "Select your preferred work modes in profile settings.",
      link: "/profile",
    });
  }

  return actions;
};

/**
 * Maps Phase 4E Resume Analyzer recommendations into unified format.
 * @param {Array<object>} analyzerRecs - Recommendations from analyzeResume()
 * @returns {Array<object>}
 */
const mapAnalyzerActions = (analyzerRecs = [], resumeId = "") => {
  if (!Array.isArray(analyzerRecs)) return [];

  return analyzerRecs.map((rec, idx) => ({
    id: `ACT-RES-${rec.id || idx}`,
    source: ACTION_SOURCES.RESUME_ANALYZER,
    priority: rec.priority || ACTION_PRIORITIES.MEDIUM,
    action: rec.action || "Improve resume section",
    reason: rec.reason || "Detected resume quality or ATS formatting issue.",
    guidance: rec.guidance || "Edit your resume in the Resume Builder to address this recommendation.",
    link: resumeId ? `/candidate/resumes/${resumeId}/builder` : "/candidate/resumes",
  }));
};

/**
 * Aggregates actions from all deterministic sources and removes duplicates.
 * @param {object} params
 * @param {object} params.profileDoc - CandidateProfile document
 * @param {Array<object>} params.analyzerRecs - Phase 4E recommendations
 * @param {string} params.resumeId - Primary resume ID
 * @param {Array<object>} params.skillRecs - Phase 4F recommendations
 * @param {Array<object>} params.matchRecs - Phase 4G recommendations
 * @returns {Array<object>} Deduplicated, prioritized actions list
 */
const aggregateCareerActions = ({
  profileDoc = null,
  analyzerRecs = [],
  resumeId = "",
  skillRecs = [],
  matchRecs = [],
} = {}) => {
  const allActions = [];

  // 1. Profile Actions
  const profileActions = deriveProfileActions(profileDoc);
  allActions.push(...profileActions);

  // 2. Resume Analyzer Actions
  const resumeActions = mapAnalyzerActions(analyzerRecs, resumeId);
  allActions.push(...resumeActions);

  // 3. Skill Intelligence Actions
  if (Array.isArray(skillRecs)) {
    skillRecs.forEach((sr, idx) => {
      allActions.push({
        id: `ACT-SKILL-${sr.id || idx}`,
        source: ACTION_SOURCES.SKILL_INTELLIGENCE,
        priority: sr.priority || ACTION_PRIORITIES.MEDIUM,
        action: sr.action || "Expand skill coverage",
        reason: sr.reason || "Identified missing canonical skill.",
        guidance: sr.guidance || "Add verifiable experience or projects with this technology.",
        link: "/candidate/skills",
      });
    });
  }

  // 4. Job Matching Actions
  if (Array.isArray(matchRecs)) {
    matchRecs.forEach((mr, idx) => {
      allActions.push({
        id: `ACT-MATCH-${mr.id || idx}`,
        source: ACTION_SOURCES.JOB_MATCHING,
        priority: mr.priority || ACTION_PRIORITIES.HIGH,
        action: mr.action || "Bridge job requirement gap",
        reason: mr.reason || "Specific requirement gap identified in evaluated job.",
        guidance: mr.guidance || "Highlight relevant experience in resume.",
        link: "/jobs",
      });
    });
  }

  // Deduplication by normalized action string
  const seenActionKeys = new Set();
  const deduplicated = [];

  allActions.forEach((act) => {
    const key = (act.action || "").trim().toLowerCase();
    if (!key || seenActionKeys.has(key)) return;
    seenActionKeys.add(key);
    deduplicated.push(act);
  });

  // Sort by priority (HIGH -> MEDIUM -> LOW) while preserving deterministic insertion order
  const priorityWeight = {
    [ACTION_PRIORITIES.HIGH]: 3,
    [ACTION_PRIORITIES.MEDIUM]: 2,
    [ACTION_PRIORITIES.LOW]: 1,
  };

  return deduplicated.sort((a, b) => {
    const weightA = priorityWeight[a.priority] || 0;
    const weightB = priorityWeight[b.priority] || 0;
    return weightB - weightA;
  });
};

module.exports = {
  deriveProfileActions,
  mapAnalyzerActions,
  aggregateCareerActions,
};
