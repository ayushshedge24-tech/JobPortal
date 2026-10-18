/**
 * Job Discovery Reason Builder Module
 * JobPortal 2.0 — Phase 4I Deterministic Job Discovery & Recommendations
 */

/**
 * Builds factual, deterministic bullet reasons explaining why a job was recommended.
 * @param {object} params
 * @param {Array<object>} params.matchedSkills - Array of matched skill objects
 * @param {boolean} params.workModeMatched - Whether work mode aligns with candidate preference
 * @param {boolean} params.locationMatched - Whether location aligns with candidate location/preference
 * @param {boolean} params.experienceMatched - Whether experience is within stated background
 * @param {boolean} params.categoryMatched - Whether domain category aligns
 * @param {object} params.job - Job document/object
 * @param {object} params.candidateProfile - Candidate profile
 * @returns {Array<string>} Array of factual reason bullets
 */
const buildDiscoveryReasons = ({
  matchedSkills = [],
  workModeMatched = false,
  locationMatched = false,
  experienceMatched = false,
  categoryMatched = false,
  job = {},
  candidateProfile = null,
} = {}) => {
  const reasons = [];

  // 1. Skill overlap reason
  if (matchedSkills.length > 0) {
    const skillNames = matchedSkills.map((s) => s.canonicalName || s.name);
    if (matchedSkills.length === 1) {
      reasons.push(`Matches 1 of your declared skills: ${skillNames[0]}.`);
    } else {
      reasons.push(`Matches ${matchedSkills.length} of your declared skills: ${skillNames.join(", ")}.`);
    }
  }

  // 2. Work mode reason
  if (workModeMatched && job.workMode) {
    reasons.push(`Matches your preferred work mode (${job.workMode}).`);
  }

  // 3. Location reason
  if (locationMatched && job.location) {
    reasons.push(`Located in your preferred area (${job.location}).`);
  }

  // 4. Experience reason
  if (experienceMatched && job.experience) {
    reasons.push(`Experience requirement (${job.experience}) aligns with your background.`);
  }

  // 5. Category reason
  if (categoryMatched && job.category) {
    reasons.push(`Matches your career domain (${job.category}).`);
  }

  // Fallback reason if discovery-only
  if (reasons.length === 0) {
    reasons.push("Active tech opening matching your broader exploration parameters.");
  }

  return reasons;
};

module.exports = {
  buildDiscoveryReasons,
};
