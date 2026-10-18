/**
 * Match Factor Engine Module
 * JobPortal 2.0 — Phase 4G Explainable Job Matching Engine
 */

const {
  FACTOR_STATUS,
  EXPERIENCE_ALIGNMENT_STATUS,
  MATCH_FACTOR_TYPES,
  FACTOR_DISPLAY_LABELS,
} = require("./jobMatchingConstants");

const { buildSkillEvidence } = require("./matchEvidenceBuilder");

/**
 * Parses job experience string into min and max years.
 * Examples: "1-3 years" -> { min: 1, max: 3 }, "3-5 years" -> { min: 3, max: 5 },
 * "5+ years" -> { min: 5, max: 50 }, "0-1 years" -> { min: 0, max: 1 }, "Freshers" -> { min: 0, max: 1 }
 * @param {string} expStr
 * @returns {object} { min: number, max: number, raw: string, isValid: boolean }
 */
const parseJobExperienceRange = (expStr) => {
  if (!expStr || typeof expStr !== "string") {
    return { min: 0, max: 50, raw: "", isValid: false };
  }

  const trimmed = expStr.trim();
  const rangeMatch = trimmed.match(/(\d+)\s*(?:-|to)\s*(\d+)/i);
  if (rangeMatch) {
    return {
      min: parseInt(rangeMatch[1], 10),
      max: parseInt(rangeMatch[2], 10),
      raw: trimmed,
      isValid: true,
    };
  }

  const plusMatch = trimmed.match(/(\d+)\s*\+/);
  if (plusMatch) {
    return {
      min: parseInt(plusMatch[1], 10),
      max: 50,
      raw: trimmed,
      isValid: true,
    };
  }

  const singleMatch = trimmed.match(/(\d+)\s*years?/i);
  if (singleMatch) {
    const val = parseInt(singleMatch[1], 10);
    return {
      min: val,
      max: val,
      raw: trimmed,
      isValid: true,
    };
  }

  if (/fresher/i.test(trimmed)) {
    return { min: 0, max: 1, raw: trimmed, isValid: true };
  }

  return { min: 0, max: 50, raw: trimmed, isValid: false };
};

/**
 * Calculates candidate's total years of experience from profile or resume experience list.
 * @param {object} candidateDoc
 * @returns {number|null}
 */
const extractCandidateExperienceYears = (candidateDoc) => {
  if (!candidateDoc) return null;

  // 1. Explicit numeric experienceYears
  if (typeof candidateDoc.experienceYears === "number" && candidateDoc.experienceYears >= 0) {
    return candidateDoc.experienceYears;
  }

  // 2. Derive from experience entries if present
  const expList = Array.isArray(candidateDoc.experience)
    ? candidateDoc.experience
    : Array.isArray(candidateDoc.content?.experience)
    ? candidateDoc.content.experience
    : [];

  if (expList.length === 0) return null;

  // Count entries as a structured indicator if dates are missing, or compute year differences
  let totalYears = 0;
  let hasValidDates = false;

  expList.forEach((exp) => {
    if (exp.startDate) {
      const startYear = parseInt(exp.startDate.match(/\d{4}/)?.[0] || "", 10);
      const endYear = exp.isCurrent || exp.currentlyWorking
        ? new Date().getFullYear()
        : parseInt(exp.endDate?.match(/\d{4}/)?.[0] || "", 10);

      if (startYear && endYear && endYear >= startYear) {
        totalYears += Math.max(1, endYear - startYear);
        hasValidDates = true;
      }
    }
  });

  if (hasValidDates && totalYears > 0) {
    return totalYears;
  }

  // If no date parseable, return number of distinct past roles (approx 1-2 yrs each) or null
  return expList.length > 0 ? expList.length : null;
};

/**
 * 1. Evaluates Required Skill Match Factor
 */
const evaluateRequiredSkills = (candidateSkillsMap, declaredJobSkills = []) => {
  if (!Array.isArray(declaredJobSkills) || declaredJobSkills.length === 0) {
    return {
      factorType: MATCH_FACTOR_TYPES.REQUIRED_SKILL_MATCH,
      label: FACTOR_DISPLAY_LABELS.REQUIRED_SKILL_MATCH,
      status: FACTOR_STATUS.NOT_EVALUATED,
      matched: [],
      missing: [],
      unresolved: [],
      totalCount: 0,
      matchedCount: 0,
      missingCount: 0,
      reason: "No explicit required skills were declared for this position.",
    };
  }

  const matched = [];
  const missing = [];
  const unresolved = [];

  declaredJobSkills.forEach((jobSkill) => {
    if (!jobSkill.normalized && !candidateSkillsMap.has(jobSkill.key)) {
      unresolved.push(buildSkillEvidence(jobSkill, "UNRESOLVED", null, jobSkill));
      return;
    }

    const candidateSkill = candidateSkillsMap.get(jobSkill.key);
    if (candidateSkill) {
      matched.push(buildSkillEvidence(jobSkill, "MATCHED", candidateSkill, jobSkill));
    } else {
      missing.push(buildSkillEvidence(jobSkill, "MISSING", null, jobSkill));
    }
  });

  let status = FACTOR_STATUS.NOT_MATCHED;
  if (missing.length === 0 && matched.length > 0) {
    status = FACTOR_STATUS.MATCHED;
  } else if (matched.length > 0) {
    status = FACTOR_STATUS.PARTIAL;
  }

  const reason =
    status === FACTOR_STATUS.MATCHED
      ? `All ${matched.length} declared required skills are present in your candidate profile.`
      : status === FACTOR_STATUS.PARTIAL
      ? `${matched.length} of ${declaredJobSkills.length} declared required skills are matched; ${missing.length} missing.`
      : `None of the ${declaredJobSkills.length} declared required skills were found in your candidate profile.`;

  return {
    factorType: MATCH_FACTOR_TYPES.REQUIRED_SKILL_MATCH,
    label: FACTOR_DISPLAY_LABELS.REQUIRED_SKILL_MATCH,
    status,
    matched,
    missing,
    unresolved,
    totalCount: declaredJobSkills.length,
    matchedCount: matched.length,
    missingCount: missing.length,
    unresolvedCount: unresolved.length,
    reason,
  };
};

/**
 * 2. Evaluates Preferred & Mentioned Skills Factor
 */
const evaluatePreferredSkills = (candidateSkillsMap, mentionedJobSkills = []) => {
  if (!Array.isArray(mentionedJobSkills) || mentionedJobSkills.length === 0) {
    return {
      factorType: MATCH_FACTOR_TYPES.PREFERRED_SKILL_MATCH,
      label: FACTOR_DISPLAY_LABELS.PREFERRED_SKILL_MATCH,
      status: FACTOR_STATUS.NOT_EVALUATED,
      matched: [],
      missing: [],
      unresolved: [],
      totalCount: 0,
      matchedCount: 0,
      missingCount: 0,
      reason: "No secondary or preferred skills were mentioned for this role.",
    };
  }

  const matched = [];
  const missing = [];
  const unresolved = [];

  mentionedJobSkills.forEach((jobSkill) => {
    if (!jobSkill.normalized && !candidateSkillsMap.has(jobSkill.key)) {
      unresolved.push(buildSkillEvidence(jobSkill, "UNRESOLVED", null, jobSkill));
      return;
    }

    const candidateSkill = candidateSkillsMap.get(jobSkill.key);
    if (candidateSkill) {
      matched.push(buildSkillEvidence(jobSkill, "MATCHED", candidateSkill, jobSkill));
    } else {
      missing.push(buildSkillEvidence(jobSkill, "MISSING", null, jobSkill));
    }
  });

  let status = FACTOR_STATUS.NOT_MATCHED;
  if (missing.length === 0 && matched.length > 0) {
    status = FACTOR_STATUS.MATCHED;
  } else if (matched.length > 0) {
    status = FACTOR_STATUS.PARTIAL;
  }

  const reason =
    status === FACTOR_STATUS.MATCHED
      ? `All ${matched.length} preferred skills mentioned in the job description are matched.`
      : status === FACTOR_STATUS.PARTIAL
      ? `${matched.length} of ${mentionedJobSkills.length} preferred skills are matched.`
      : `Preferred technologies mentioned in the job description were not found in your profile.`;

  return {
    factorType: MATCH_FACTOR_TYPES.PREFERRED_SKILL_MATCH,
    label: FACTOR_DISPLAY_LABELS.PREFERRED_SKILL_MATCH,
    status,
    matched,
    missing,
    unresolved,
    totalCount: mentionedJobSkills.length,
    matchedCount: matched.length,
    missingCount: missing.length,
    unresolvedCount: unresolved.length,
    reason,
  };
};

/**
 * 3. Evaluates Experience Alignment Factor
 */
const evaluateExperienceAlignment = (candidateProfile, candidateDoc, jobDoc) => {
  const expRange = parseJobExperienceRange(jobDoc?.experience);
  const candidateYears = extractCandidateExperienceYears(candidateDoc);

  if (candidateYears === null || !expRange.isValid) {
    return {
      factorType: MATCH_FACTOR_TYPES.EXPERIENCE_ALIGNMENT,
      label: FACTOR_DISPLAY_LABELS.EXPERIENCE_ALIGNMENT,
      status: FACTOR_STATUS.NOT_EVALUATED,
      alignment: EXPERIENCE_ALIGNMENT_STATUS.NOT_EVALUATED,
      candidateYears: candidateYears !== null ? candidateYears : null,
      jobRange: { min: expRange.min, max: expRange.max, text: jobDoc?.experience || "" },
      reason: candidateYears === null
        ? "Structured experience information is not specified in your profile."
        : "Job experience requirements could not be parsed into a structured numerical range.",
    };
  }

  let alignment = EXPERIENCE_ALIGNMENT_STATUS.WITHIN_RANGE;
  let status = FACTOR_STATUS.MATCHED;
  let reason = `Your ${candidateYears} year(s) of experience aligns with the stated ${expRange.raw} requirement.`;

  if (candidateYears < expRange.min) {
    alignment = EXPERIENCE_ALIGNMENT_STATUS.BELOW_RANGE;
    status = FACTOR_STATUS.NOT_MATCHED;
    reason = `Your ${candidateYears} year(s) of experience is below the stated minimum of ${expRange.min} years for this role.`;
  } else if (candidateYears > expRange.max) {
    alignment = EXPERIENCE_ALIGNMENT_STATUS.ABOVE_RANGE;
    status = FACTOR_STATUS.MATCHED; // Exceeding is still evaluated as qualified, but noted as ABOVE_RANGE
    reason = `Your ${candidateYears} year(s) of experience exceeds the stated ${expRange.raw} range for this role.`;
  }

  return {
    factorType: MATCH_FACTOR_TYPES.EXPERIENCE_ALIGNMENT,
    label: FACTOR_DISPLAY_LABELS.EXPERIENCE_ALIGNMENT,
    status,
    alignment,
    candidateYears,
    jobRange: { min: expRange.min, max: expRange.max, text: expRange.raw },
    reason,
  };
};

/**
 * 4. Evaluates Work Mode Alignment Factor
 */
const evaluateWorkModeAlignment = (candidateProfile, candidateDoc, jobDoc) => {
  const jobWorkMode = jobDoc?.workMode || "Hybrid";
  const preferredModes = Array.isArray(candidateDoc?.preferredWorkModes)
    ? candidateDoc.preferredWorkModes
    : [];

  if (preferredModes.length === 0) {
    return {
      factorType: MATCH_FACTOR_TYPES.WORK_MODE_ALIGNMENT,
      label: FACTOR_DISPLAY_LABELS.WORK_MODE_ALIGNMENT,
      status: FACTOR_STATUS.NOT_EVALUATED,
      candidatePreference: [],
      jobWorkMode,
      reason: "No work mode preferences configured in candidate profile.",
    };
  }

  const isMatched = preferredModes.some(
    (mode) => mode.toLowerCase() === jobWorkMode.toLowerCase()
  );

  return {
    factorType: MATCH_FACTOR_TYPES.WORK_MODE_ALIGNMENT,
    label: FACTOR_DISPLAY_LABELS.WORK_MODE_ALIGNMENT,
    status: isMatched ? FACTOR_STATUS.MATCHED : FACTOR_STATUS.NOT_MATCHED,
    candidatePreference: preferredModes,
    jobWorkMode,
    reason: isMatched
      ? `Role's ${jobWorkMode} work mode aligns with your stated preference (${preferredModes.join(", ")}).`
      : `Role requires ${jobWorkMode} work mode, which is not in your stated preferences (${preferredModes.join(", ")}).`,
  };
};

/**
 * 5. Evaluates Location & Geography Alignment Factor
 */
const evaluateLocationAlignment = (candidateProfile, candidateDoc, jobDoc) => {
  const jobLocation = jobDoc?.location || "";
  const isRemoteJob = (jobDoc?.workMode || "").toLowerCase() === "remote";

  if (isRemoteJob) {
    return {
      factorType: MATCH_FACTOR_TYPES.LOCATION_ALIGNMENT,
      label: FACTOR_DISPLAY_LABELS.LOCATION_ALIGNMENT,
      status: FACTOR_STATUS.MATCHED,
      candidateLocations: [],
      jobLocation,
      reason: "Role is Remote; geographical location is fully flexible.",
    };
  }

  const candidateLocations = [
    candidateDoc?.city,
    candidateDoc?.location,
    ...(Array.isArray(candidateDoc?.preferredLocations) ? candidateDoc.preferredLocations : []),
  ]
    .filter(Boolean)
    .map((l) => l.trim().toLowerCase());

  if (candidateLocations.length === 0) {
    return {
      factorType: MATCH_FACTOR_TYPES.LOCATION_ALIGNMENT,
      label: FACTOR_DISPLAY_LABELS.LOCATION_ALIGNMENT,
      status: FACTOR_STATUS.NOT_EVALUATED,
      candidateLocations: [],
      jobLocation,
      reason: "No city or location preferences specified in candidate profile.",
    };
  }

  const jobLocLower = jobLocation.toLowerCase();
  const matchedLoc = candidateLocations.find((loc) => jobLocLower.includes(loc) || loc.includes(jobLocLower));

  return {
    factorType: MATCH_FACTOR_TYPES.LOCATION_ALIGNMENT,
    label: FACTOR_DISPLAY_LABELS.LOCATION_ALIGNMENT,
    status: matchedLoc ? FACTOR_STATUS.MATCHED : FACTOR_STATUS.NOT_MATCHED,
    candidateLocations,
    jobLocation,
    reason: matchedLoc
      ? `Job location (${jobLocation}) matches your location profile.`
      : `Job location (${jobLocation}) is outside your declared locations (${candidateLocations.join(", ")}).`,
  };
};

/**
 * 6. Evaluates Domain & Category Alignment Factor
 */
const evaluateCategoryAlignment = (candidateProfile, jobDoc) => {
  const jobCategory = jobDoc?.category || "";
  if (!jobCategory) {
    return {
      factorType: MATCH_FACTOR_TYPES.CATEGORY_ALIGNMENT,
      label: FACTOR_DISPLAY_LABELS.CATEGORY_ALIGNMENT,
      status: FACTOR_STATUS.NOT_EVALUATED,
      candidateCategories: [],
      jobCategory: "",
      reason: "Job category is not specified.",
    };
  }

  const candidateCategories = Object.keys(candidateProfile?.categories || {}).filter(
    (cat) => (candidateProfile.categories[cat] || []).length > 0
  );

  if (candidateCategories.length === 0) {
    return {
      factorType: MATCH_FACTOR_TYPES.CATEGORY_ALIGNMENT,
      label: FACTOR_DISPLAY_LABELS.CATEGORY_ALIGNMENT,
      status: FACTOR_STATUS.NOT_EVALUATED,
      candidateCategories: [],
      jobCategory,
      reason: "No skill categories recorded in candidate profile.",
    };
  }

  // Canonical mapping for role categories
  const categoryMap = {
    "software development": ["PROGRAMMING", "BACKEND", "FRONTEND", "DATABASE", "DEVOPS", "CLOUD"],
    "product ui/ux design": ["UI_UX", "FRONTEND"],
    "data analytics": ["DATA_ANALYTICS", "DATABASE", "PROGRAMMING"],
    "data science": ["DATA_SCIENCE", "AI_ML", "DATA_ANALYTICS", "PROGRAMMING"],
    "quality assurance": ["TESTING", "PROGRAMMING"],
    "devops": ["DEVOPS", "CLOUD", "CYBERSECURITY"],
  };

  const jobCatLower = jobCategory.toLowerCase();
  const mappedTargets = categoryMap[jobCatLower] || ["PROGRAMMING", "OTHER"];

  const hasMatchingCategory = candidateCategories.some((cat) => mappedTargets.includes(cat));

  return {
    factorType: MATCH_FACTOR_TYPES.CATEGORY_ALIGNMENT,
    label: FACTOR_DISPLAY_LABELS.CATEGORY_ALIGNMENT,
    status: hasMatchingCategory ? FACTOR_STATUS.MATCHED : FACTOR_STATUS.NOT_MATCHED,
    candidateCategories,
    jobCategory,
    reason: hasMatchingCategory
      ? `Your profile skills align with the ${jobCategory} domain.`
      : `Your profile contains skills in other categories, but limited representation in ${jobCategory}.`,
  };
};

module.exports = {
  parseJobExperienceRange,
  extractCandidateExperienceYears,
  evaluateRequiredSkills,
  evaluatePreferredSkills,
  evaluateExperienceAlignment,
  evaluateWorkModeAlignment,
  evaluateLocationAlignment,
  evaluateCategoryAlignment,
};
