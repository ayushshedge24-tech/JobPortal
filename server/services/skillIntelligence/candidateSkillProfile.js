/**
 * Candidate Skill Profile Module
 * JobPortal 2.0 — Phase 4F Deterministic Skill Intelligence
 */

const { extractSkillsFromResume, extractSkillsFromCandidateProfile } = require("./skillExtractor");
const { VALID_SKILL_CATEGORIES_LIST, SKILL_LEVELS } = require("./skillIntelligenceConstants");

/**
 * Builds a deterministic candidate skill profile from a Resume document or CandidateProfile.
 * @param {object} sourceDoc - Either a Resume document with .content or CandidateProfile
 * @param {object} options - { candidateId, resumeId, title }
 * @returns {object} Full Candidate Skill Profile
 */
const buildCandidateSkillProfile = (sourceDoc, options = {}) => {
  const { candidateId = null, resumeId = null, title = "" } = options;

  let extractionResult;

  if (sourceDoc && sourceDoc.content) {
    extractionResult = extractSkillsFromResume(sourceDoc.content);
  } else if (sourceDoc && (sourceDoc.skills || sourceDoc.experience || sourceDoc.projects)) {
    extractionResult = extractSkillsFromCandidateProfile(sourceDoc);
  } else {
    extractionResult = { explicitSkills: [], mentionedSkills: [], allSkills: [] };
  }

  const { allSkills, explicitSkills, mentionedSkills } = extractionResult;

  // Group skills by category
  const categories = {};
  VALID_SKILL_CATEGORIES_LIST.forEach((cat) => {
    categories[cat] = [];
  });

  allSkills.forEach((skill) => {
    const cat = categories[skill.category] ? skill.category : "OTHER";
    categories[cat].push(skill);
  });

  // Track aliases detected
  const aliasesDetected = [];
  allSkills.forEach((skill) => {
    if (skill.aliasMatched && Array.isArray(skill.originalNames)) {
      skill.originalNames.forEach((orig) => {
        if (orig.toLowerCase() !== skill.name.toLowerCase()) {
          aliasesDetected.push({
            original: orig,
            canonicalName: skill.name,
            key: skill.key,
            category: skill.category,
          });
        }
      });
    }
  });

  // Calculate deterministic metrics
  let declaredLevelsCount = 0;
  let unspecifiedLevelsCount = 0;

  allSkills.forEach((skill) => {
    if (skill.level && skill.level !== SKILL_LEVELS.NOT_SPECIFIED) {
      declaredLevelsCount += 1;
    } else {
      unspecifiedLevelsCount += 1;
    }
  });

  const categoriesRepresented = Object.keys(categories).filter(
    (k) => categories[k] && categories[k].length > 0
  ).length;

  return {
    candidateId: candidateId ? String(candidateId) : null,
    resumeId: resumeId ? String(resumeId) : null,
    resumeTitle: title || (sourceDoc?.title ? String(sourceDoc.title) : "Resume Profile"),
    generatedAt: new Date().toISOString(),
    skills: allSkills,
    explicitSkills,
    mentionedSkills,
    categories,
    aliasesDetected,
    metrics: {
      totalSkills: allSkills.length,
      explicitSkillsCount: explicitSkills.length,
      mentionedSkillsCount: mentionedSkills.length,
      declaredLevelsCount,
      unspecifiedLevelsCount,
      categoriesRepresented,
    },
  };
};

module.exports = {
  buildCandidateSkillProfile,
};
