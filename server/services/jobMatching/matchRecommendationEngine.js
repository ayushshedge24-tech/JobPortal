/**
 * Match Recommendation Engine Module
 * JobPortal 2.0 — Phase 4G Explainable Job Matching Engine
 */

const {
  FACTOR_STATUS,
  EXPERIENCE_ALIGNMENT_STATUS,
} = require("./jobMatchingConstants");

/**
 * Generates deterministic, explainable recommendations based on factor evaluation results.
 * @param {object} factors - Evaluated factors from matchFactorEngine
 * @param {object} context - { jobTitle, company }
 * @returns {Array<object>} Array of structured recommendations
 */
const generateJobMatchRecommendations = (factors, context = {}) => {
  const recommendations = [];
  const { jobTitle = "this role", company = "" } = context;
  const companyPhrase = company ? ` at ${company}` : "";

  // 1. Missing Required Skills (HIGH Priority)
  const reqFactor = factors.requiredSkillMatch;
  if (reqFactor && Array.isArray(reqFactor.missing)) {
    reqFactor.missing.forEach((item) => {
      recommendations.push({
        id: `REC-REQ-${item.skillKey.toUpperCase()}`,
        type: "REQUIRED_SKILL_GAP",
        priority: "HIGH",
        skillKey: item.skillKey,
        skillName: item.canonicalName,
        action: `Develop competency in ${item.canonicalName}`,
        reason: `"${item.canonicalName}" is a declared required skill for ${jobTitle}${companyPhrase}, but was not found in your candidate profile.`,
        guidance: `If you have prior hands-on exposure or academic coursework in ${item.canonicalName}, add it to your resume's Skills or Projects section.`,
      });
    });
  }

  // 2. Missing Preferred Skills (MEDIUM Priority)
  const prefFactor = factors.preferredSkillMatch;
  if (prefFactor && Array.isArray(prefFactor.missing)) {
    prefFactor.missing.forEach((item) => {
      recommendations.push({
        id: `REC-PREF-${item.skillKey.toUpperCase()}`,
        type: "PREFERRED_SKILL_GAP",
        priority: "MEDIUM",
        skillKey: item.skillKey,
        skillName: item.canonicalName,
        action: `Consider learning ${item.canonicalName}`,
        reason: `"${item.canonicalName}" is mentioned as a preferred skill in the job description. Having it can strengthen your candidacy.`,
        guidance: `Include any side projects or practical experience with ${item.canonicalName} if applicable.`,
      });
    });
  }

  // 3. Experience Gap (MEDIUM Priority)
  const expFactor = factors.experienceAlignment;
  if (expFactor) {
    if (expFactor.alignment === EXPERIENCE_ALIGNMENT_STATUS.BELOW_RANGE) {
      recommendations.push({
        id: "REC-EXP-BELOW",
        type: "EXPERIENCE_GAP",
        priority: "MEDIUM",
        action: "Highlight deep domain impact in past roles",
        reason: `Your stated experience (${expFactor.candidateYears} yrs) is below the role's ${expFactor.jobRange.text} guideline.`,
        guidance: "Emphasize high-ownership projects, leadership initiatives, and measurable achievements in your resume bullets to demonstrate seniority.",
      });
    } else if (expFactor.status === FACTOR_STATUS.NOT_EVALUATED) {
      recommendations.push({
        id: "REC-EXP-UNCONFIGURED",
        type: "PROFILE_ENHANCEMENT",
        priority: "LOW",
        action: "Add structured experience history",
        reason: "Structured years of experience are not specified in your candidate profile.",
        guidance: "Complete the Work Experience section in your profile or resume so experience alignment can be evaluated.",
      });
    }
  }

  // 4. Work Mode Gap (LOW Priority)
  const wmFactor = factors.workModeAlignment;
  if (wmFactor) {
    if (wmFactor.status === FACTOR_STATUS.NOT_MATCHED) {
      recommendations.push({
        id: "REC-WM-MISMATCH",
        type: "PREFERENCE_MISMATCH",
        priority: "LOW",
        action: `Review ${wmFactor.jobWorkMode} work mode requirements`,
        reason: `This role operates on a ${wmFactor.jobWorkMode} schedule, which is not currently selected in your preferences.`,
        guidance: "If you are open to this work arrangement, update your preferred work modes in Candidate Profile Settings.",
      });
    } else if (wmFactor.status === FACTOR_STATUS.NOT_EVALUATED) {
      recommendations.push({
        id: "REC-WM-UNCONFIGURED",
        type: "PROFILE_ENHANCEMENT",
        priority: "LOW",
        action: "Set your work mode preferences",
        reason: "No work mode preferences (Remote, Hybrid, On-site) are configured in your profile.",
        guidance: "Configure your work mode preferences to receive clearer alignment signals.",
      });
    }
  }

  // 5. Location Gap (LOW Priority)
  const locFactor = factors.locationAlignment;
  if (locFactor && locFactor.status === FACTOR_STATUS.NOT_EVALUATED) {
    recommendations.push({
      id: "REC-LOC-UNCONFIGURED",
      type: "PROFILE_ENHANCEMENT",
      priority: "LOW",
      action: "Specify preferred job locations",
      reason: "No preferred cities or locations are specified in your profile.",
      guidance: "Add your preferred working cities (e.g., Bangalore, Pune, Mumbai, Remote) in your candidate profile.",
    });
  }

  return recommendations;
};

module.exports = {
  generateJobMatchRecommendations,
};
