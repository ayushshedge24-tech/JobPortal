/**
 * Skill Gap Analyzer Module
 * JobPortal 2.0 — Phase 4F Deterministic Skill Intelligence
 */

const { SKILL_MATCH_STATUS } = require("./skillIntelligenceConstants");

/**
 * Analyzes deterministic skill gaps between a candidate skill profile and a job's skill requirements.
 * STRICTLY DETERMINISTIC — ZERO FAKE PERCENTAGE SCORES.
 * @param {object} candidateProfile - Built candidate skill profile
 * @param {object} jobSkills - Extracted job skills
 * @returns {object} Explainable Skill Gap Analysis
 */
const analyzeSkillGap = (candidateProfile, jobSkills) => {
  if (!candidateProfile || !jobSkills) {
    return {
      status: "INCOMPLETE_DATA",
      matched: [],
      missing: [],
      unresolved: [],
      metrics: {
        totalJobSkills: 0,
        matchedCount: 0,
        missingCount: 0,
        unresolvedCount: 0,
      },
    };
  }

  // Build quick lookup map of candidate skills by key
  const candidateSkillsMap = new Map();
  (candidateProfile.skills || []).forEach((sk) => {
    if (sk && sk.key) {
      candidateSkillsMap.set(sk.key, sk);
    }
  });

  const matched = [];
  const missing = [];
  const unresolved = [];

  const jobSkillsList = Array.isArray(jobSkills.allJobSkills)
    ? jobSkills.allJobSkills
    : Array.isArray(jobSkills.requiredSkills)
    ? jobSkills.requiredSkills
    : [];

  jobSkillsList.forEach((jobSkill) => {
    if (!jobSkill || !jobSkill.key) return;

    // Check if job skill is unmapped / non-canonical and not present
    if (!jobSkill.normalized && !candidateSkillsMap.has(jobSkill.key)) {
      unresolved.push({
        key: jobSkill.key,
        name: jobSkill.name,
        category: jobSkill.category,
        requirementType: jobSkill.requirementType || "DECLARED_REQUIREMENT",
        status: SKILL_MATCH_STATUS.UNRESOLVED,
        reason: `"${jobSkill.name}" is a custom or non-standard job term that could not be mapped to the canonical skill dictionary.`,
        evidence: jobSkill.evidence || [],
      });
      return;
    }

    // Check match against candidate profile
    const candidateSkillMatch = candidateSkillsMap.get(jobSkill.key);

    if (candidateSkillMatch) {
      matched.push({
        key: jobSkill.key,
        name: jobSkill.name,
        category: jobSkill.category,
        requirementType: jobSkill.requirementType || "DECLARED_REQUIREMENT",
        status: SKILL_MATCH_STATUS.MATCHED,
        candidateLevel: candidateSkillMatch.level,
        sources: candidateSkillMatch.sources || [],
        isExplicit: !!candidateSkillMatch.isExplicit,
        evidence: candidateSkillMatch.evidence || [],
      });
    } else {
      missing.push({
        key: jobSkill.key,
        name: jobSkill.name,
        category: jobSkill.category,
        requirementType: jobSkill.requirementType || "DECLARED_REQUIREMENT",
        status: SKILL_MATCH_STATUS.MISSING,
        reason: `"${jobSkill.name}" is listed as a declared job requirement for this role, but was not found in the candidate's normalized resume profile.`,
        relatedSkillsInfo: Array.isArray(jobSkill.relatedSkills)
          ? jobSkill.relatedSkills.map((rKey) => ({
              key: rKey,
              possessedByCandidate: candidateSkillsMap.has(rKey),
            }))
          : [],
      });
    }
  });

  return {
    candidate: {
      candidateId: candidateProfile.candidateId,
      resumeId: candidateProfile.resumeId,
      resumeTitle: candidateProfile.resumeTitle,
      totalCandidateSkills: (candidateProfile.skills || []).length,
    },
    job: {
      jobId: jobSkills.jobId,
      jobTitle: jobSkills.jobTitle,
      company: jobSkills.company,
      category: jobSkills.category,
      totalJobSkills: jobSkillsList.length,
    },
    analyzedAt: new Date().toISOString(),
    matched,
    missing,
    unresolved,
    metrics: {
      totalJobSkills: jobSkillsList.length,
      matchedCount: matched.length,
      missingCount: missing.length,
      unresolvedCount: unresolved.length,
    },
  };
};

module.exports = {
  analyzeSkillGap,
};
