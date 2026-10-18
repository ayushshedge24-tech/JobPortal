/**
 * Skill Recommendation Engine Module
 * JobPortal 2.0 — Phase 4F Deterministic Skill Intelligence
 */

const {
  SKILL_CATEGORIES,
  RECOMMENDATION_PRIORITY,
  CATEGORY_DISPLAY_LABELS,
} = require("./skillIntelligenceConstants");

/**
 * Derives recommendation priority from skill category and requirement type.
 * @param {string} category
 * @param {string} requirementType
 * @returns {string} HIGH | MEDIUM | LOW
 */
const determinePriority = (category, requirementType) => {
  const isDeclared = requirementType === "DECLARED_REQUIREMENT";

  if (
    [
      SKILL_CATEGORIES.PROGRAMMING,
      SKILL_CATEGORIES.BACKEND,
      SKILL_CATEGORIES.DATABASE,
      SKILL_CATEGORIES.FRONTEND,
    ].includes(category)
  ) {
    return isDeclared ? RECOMMENDATION_PRIORITY.HIGH : RECOMMENDATION_PRIORITY.MEDIUM;
  }

  if (
    [
      SKILL_CATEGORIES.CLOUD,
      SKILL_CATEGORIES.DEVOPS,
      SKILL_CATEGORIES.DATA_ANALYTICS,
      SKILL_CATEGORIES.DATA_SCIENCE,
      SKILL_CATEGORIES.AI_ML,
      SKILL_CATEGORIES.MOBILE,
      SKILL_CATEGORIES.TESTING,
      SKILL_CATEGORIES.CYBERSECURITY,
    ].includes(category)
  ) {
    return isDeclared ? RECOMMENDATION_PRIORITY.MEDIUM : RECOMMENDATION_PRIORITY.LOW;
  }

  return RECOMMENDATION_PRIORITY.LOW;
};

/**
 * Generates explainable, deterministic learning recommendations for missing job skills.
 * @param {Array<object>} missingSkills - Array of missing skills from skillGapAnalyzer
 * @param {object} context - { jobTitle, company }
 * @returns {object} { recommendations, groupedByCategory, totalRecommendations }
 */
const generateSkillRecommendations = (missingSkills = [], context = {}) => {
  if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
    return {
      recommendations: [],
      groupedByCategory: {},
      totalRecommendations: 0,
    };
  }

  const { jobTitle = "this role", company = "" } = context;
  const companyPhrase = company ? ` at ${company}` : "";

  const recommendations = missingSkills.map((missingSkill) => {
    const priority = determinePriority(missingSkill.category, missingSkill.requirementType);
    const categoryLabel = CATEGORY_DISPLAY_LABELS[missingSkill.category] || "General Skills";

    return {
      id: `REC-SKILL-${missingSkill.key.toUpperCase()}`,
      skillKey: missingSkill.key,
      skillName: missingSkill.name,
      category: missingSkill.category,
      categoryLabel,
      priority,
      action: `Add or develop experience in ${missingSkill.name}`,
      reason: `"${missingSkill.name}" is listed as a skill requirement for ${jobTitle}${companyPhrase}, but is currently absent from your resume profile.`,
      guidance: `If you have prior hands-on exposure or academic coursework in ${missingSkill.name}, add it to your resume's Skills or Project section to ensure applicant clarity.`,
      relatedSkillsInfo: missingSkill.relatedSkillsInfo || [],
    };
  });

  // Sort: HIGH -> MEDIUM -> LOW
  const priorityOrder = {
    [RECOMMENDATION_PRIORITY.HIGH]: 1,
    [RECOMMENDATION_PRIORITY.MEDIUM]: 2,
    [RECOMMENDATION_PRIORITY.LOW]: 3,
  };

  recommendations.sort((a, b) => {
    const pA = priorityOrder[a.priority] || 99;
    const pB = priorityOrder[b.priority] || 99;
    if (pA !== pB) return pA - pB;
    return a.skillName.localeCompare(b.skillName);
  });

  // Group by category
  const groupedByCategory = {};
  recommendations.forEach((rec) => {
    if (!groupedByCategory[rec.category]) {
      groupedByCategory[rec.category] = {
        categoryKey: rec.category,
        categoryLabel: rec.categoryLabel,
        items: [],
      };
    }
    groupedByCategory[rec.category].items.push(rec);
  });

  return {
    recommendations,
    groupedByCategory,
    totalRecommendations: recommendations.length,
  };
};

module.exports = {
  generateSkillRecommendations,
  determinePriority,
};
