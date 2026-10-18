/**
 * Match Evidence Builder Module
 * JobPortal 2.0 — Phase 4G Explainable Job Matching Engine
 */

/**
 * Builds traceable, explainable evidence objects for a skill match.
 * @param {object} skillMatch - Skill item from gap analyzer or candidate profile
 * @param {string} matchType - "MATCHED" | "MISSING" | "UNRESOLVED"
 * @param {object} candidateSkill - Found candidate skill item
 * @param {object} jobSkill - Target job skill requirement item
 * @returns {object} Explainable Match Evidence Object
 */
const buildSkillEvidence = (skillMatch, matchType, candidateSkill = null, jobSkill = null) => {
  const canonicalName = skillMatch.name || (candidateSkill ? candidateSkill.name : jobSkill ? jobSkill.name : "Skill");
  const skillKey = skillMatch.key || (candidateSkill ? candidateSkill.key : jobSkill ? jobSkill.key : "");
  const category = skillMatch.category || (candidateSkill ? candidateSkill.category : jobSkill ? jobSkill.category : "OTHER");

  // Format candidate evidence snippets
  const candidateEvidence = [];
  if (candidateSkill && Array.isArray(candidateSkill.evidence) && candidateSkill.evidence.length > 0) {
    candidateSkill.evidence.forEach((ev) => {
      candidateEvidence.push({
        source: ev.source || "EXPLICIT_SKILL",
        context: ev.text || `Found in candidate profile: "${canonicalName}"`,
      });
    });
  } else if (candidateSkill && Array.isArray(candidateSkill.sources)) {
    candidateSkill.sources.forEach((src) => {
      candidateEvidence.push({
        source: src,
        context: `Recorded from ${src.replace(/_/g, " ").toLowerCase()}`,
      });
    });
  }

  // Format job evidence snippets
  const jobEvidence = [];
  if (jobSkill && Array.isArray(jobSkill.evidence) && jobSkill.evidence.length > 0) {
    jobSkill.evidence.forEach((evText) => {
      jobEvidence.push({
        source: jobSkill.requirementType || "DECLARED_REQUIREMENT",
        context: typeof evText === "string" ? evText : `Job requirement: "${canonicalName}"`,
      });
    });
  } else {
    jobEvidence.push({
      source: jobSkill?.requirementType || "DECLARED_REQUIREMENT",
      context: `Listed as requirement for this job: "${canonicalName}"`,
    });
  }

  return {
    skillKey,
    canonicalName,
    category,
    matchType,
    candidateLevel: candidateSkill?.level || "NOT_SPECIFIED",
    isExplicit: !!candidateSkill?.isExplicit,
    candidateEvidence,
    jobEvidence,
    reason:
      matchType === "MATCHED"
        ? `"${canonicalName}" is declared in the candidate profile and required by this job.`
        : matchType === "MISSING"
        ? `"${canonicalName}" is a job requirement but was not found in the candidate profile.`
        : `"${canonicalName}" is a non-standard job term that could not be mapped to standard skills.`,
  };
};

module.exports = {
  buildSkillEvidence,
};
