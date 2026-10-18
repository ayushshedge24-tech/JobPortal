/**
 * Explainable Match Engine Module
 * JobPortal 2.0 — Phase 4G Deterministic & Explainable Job Matching Engine
 */

const {
  JOB_MATCHING_VERSION,
  MATCH_STATUS,
  FACTOR_STATUS,
  EXPERIENCE_ALIGNMENT_STATUS,
} = require("./jobMatchingConstants");

const {
  evaluateRequiredSkills,
  evaluatePreferredSkills,
  evaluateExperienceAlignment,
  evaluateWorkModeAlignment,
  evaluateLocationAlignment,
  evaluateCategoryAlignment,
} = require("./matchFactorEngine");

const { generateJobMatchRecommendations } = require("./matchRecommendationEngine");
const { extractSkillsFromJob } = require("../skillIntelligence/jobSkillExtractor");
const { buildCandidateSkillProfile } = require("../skillIntelligence/candidateSkillProfile");

/**
 * Evaluates the overall deterministic match status from factor results.
 * @param {object} factors
 * @param {object} metrics - { totalCandidateSkills, totalJobSkills }
 * @returns {object} { status: string, headline: string, keyHighlights: Array<string> }
 */
const determineMatchStatus = (factors, metrics) => {
  const { totalCandidateSkills, totalJobSkills } = metrics;
  const reqFactor = factors.requiredSkillMatch;
  const prefFactor = factors.preferredSkillMatch;
  const expFactor = factors.experienceAlignment;
  const wmFactor = factors.workModeAlignment;

  // 1. INSUFFICIENT_DATA: candidate has 0 skills, or job has 0 requirements
  if (totalCandidateSkills === 0 || (totalJobSkills === 0 && reqFactor.totalCount === 0)) {
    return {
      status: MATCH_STATUS.INSUFFICIENT_DATA,
      headline: "Insufficient structured profile or job data to evaluate alignment.",
      keyHighlights: ["Add skills and career history to your candidate profile to enable match analysis."],
    };
  }

  const keyHighlights = [];

  // Highlight required skills
  if (reqFactor.totalCount > 0) {
    if (reqFactor.matchedCount > 0) {
      keyHighlights.push(`${reqFactor.matchedCount} of ${reqFactor.totalCount} declared required skills matched`);
    }
    if (reqFactor.missingCount > 0) {
      keyHighlights.push(`${reqFactor.missingCount} declared required skill(s) missing`);
    }
  }

  // Highlight preferred skills
  if (prefFactor.totalCount > 0 && prefFactor.matchedCount > 0) {
    keyHighlights.push(`${prefFactor.matchedCount} preferred skill(s) matched`);
  }

  // Highlight experience
  if (expFactor.status !== FACTOR_STATUS.NOT_EVALUATED) {
    if (expFactor.alignment === EXPERIENCE_ALIGNMENT_STATUS.WITHIN_RANGE) {
      keyHighlights.push(`Experience (${expFactor.candidateYears} yrs) is within the required range`);
    } else if (expFactor.alignment === EXPERIENCE_ALIGNMENT_STATUS.ABOVE_RANGE) {
      keyHighlights.push(`Experience (${expFactor.candidateYears} yrs) exceeds the stated guideline`);
    } else if (expFactor.alignment === EXPERIENCE_ALIGNMENT_STATUS.BELOW_RANGE) {
      keyHighlights.push(`Experience (${expFactor.candidateYears} yrs) is below the minimum threshold`);
    }
  }

  // Highlight work mode
  if (wmFactor.status === FACTOR_STATUS.MATCHED) {
    keyHighlights.push(`Work mode preference aligns with ${wmFactor.jobWorkMode}`);
  } else if (wmFactor.status === FACTOR_STATUS.NOT_MATCHED) {
    keyHighlights.push(`Work mode mismatch: role requires ${wmFactor.jobWorkMode}`);
  }

  // 2. STRONG_ALIGNMENT:
  // - Required skills: all matched (or 0 missing)
  // - Experience: not below range
  // - Work mode: not mismatched
  const hasNoMissingRequired = reqFactor.totalCount > 0 && reqFactor.missingCount === 0;
  const experienceOk = expFactor.alignment !== EXPERIENCE_ALIGNMENT_STATUS.BELOW_RANGE;
  const workModeOk = wmFactor.status !== FACTOR_STATUS.NOT_MATCHED;

  if (hasNoMissingRequired && experienceOk && workModeOk) {
    return {
      status: MATCH_STATUS.STRONG_ALIGNMENT,
      headline: "Strong deterministic alignment with core declared requirements.",
      keyHighlights,
    };
  }

  // 3. LIMITED_ALIGNMENT:
  // - 0 required skills matched while required skills exist, OR majority of requirements missing
  const zeroRequiredMatched = reqFactor.totalCount > 0 && reqFactor.matchedCount === 0;
  const severeSkillGap = reqFactor.totalCount >= 3 && reqFactor.matchedCount === 0;

  if (zeroRequiredMatched || severeSkillGap) {
    return {
      status: MATCH_STATUS.LIMITED_ALIGNMENT,
      headline: "Limited alignment with declared requirements for this position.",
      keyHighlights,
    };
  }

  // 4. PARTIAL_ALIGNMENT:
  // - Standard fallback when some required/preferred skills match and others remain
  return {
    status: MATCH_STATUS.PARTIAL_ALIGNMENT,
    headline: "Partial alignment: some declared skills and preferences align with this role.",
    keyHighlights,
  };
};

/**
 * Master Explainable Job Match Evaluator.
 * STRICTLY DETERMINISTIC — ZERO FAKE AI / NUMERIC PERCENTAGE SCORES.
 * @param {object} candidateSourceDoc - Resume document or CandidateProfile document
 * @param {object} jobDoc - Job model document
 * @param {object} options - { candidateId, resumeId }
 * @returns {object} Explainable Match Result
 */
const evaluateJobMatch = (candidateSourceDoc, jobDoc, options = {}) => {
  if (!candidateSourceDoc || !jobDoc) {
    return null;
  }

  const { candidateId = candidateSourceDoc?.user || null, resumeId = candidateSourceDoc?._id || null } = options;

  // 1. Build Candidate Skill Profile using Phase 4F
  const candidateProfile = candidateSourceDoc.content
    ? buildCandidateSkillProfile(candidateSourceDoc, { candidateId, resumeId, title: candidateSourceDoc.title })
    : buildCandidateSkillProfile(candidateSourceDoc, { candidateId, title: "Candidate Profile" });

  // 2. Extract Job Skills using Phase 4F
  const jobSkills = extractSkillsFromJob(jobDoc);

  // 3. Index Candidate Skills by key
  const candidateSkillsMap = new Map();
  (candidateProfile.skills || []).forEach((sk) => {
    if (sk && sk.key) {
      candidateSkillsMap.set(sk.key, sk);
    }
  });

  // 4. Evaluate all 6 Match Factors
  const requiredSkillMatch = evaluateRequiredSkills(candidateSkillsMap, jobSkills.requiredSkills);
  const preferredSkillMatch = evaluatePreferredSkills(candidateSkillsMap, jobSkills.mentionedSkills);
  const experienceAlignment = evaluateExperienceAlignment(candidateProfile, candidateSourceDoc, jobDoc);
  const workModeAlignment = evaluateWorkModeAlignment(candidateProfile, candidateSourceDoc, jobDoc);
  const locationAlignment = evaluateLocationAlignment(candidateProfile, candidateSourceDoc, jobDoc);
  const categoryAlignment = evaluateCategoryAlignment(candidateProfile, jobDoc);

  const factors = {
    requiredSkillMatch,
    preferredSkillMatch,
    experienceAlignment,
    workModeAlignment,
    locationAlignment,
    categoryAlignment,
  };

  // 5. Derive Deterministic Match Status
  const summary = determineMatchStatus(factors, {
    totalCandidateSkills: (candidateProfile.skills || []).length,
    totalJobSkills: (jobSkills.allJobSkills || []).length,
  });

  // 6. Generate Actionable Recommendations
  const recommendations = generateJobMatchRecommendations(factors, {
    jobTitle: jobDoc.title,
    company: jobDoc.company,
  });

  return {
    version: JOB_MATCHING_VERSION,
    evaluatedAt: new Date().toISOString(),
    job: {
      id: String(jobDoc._id),
      title: jobDoc.title || "Job Position",
      company: jobDoc.company || "",
      location: jobDoc.location || "",
      workMode: jobDoc.workMode || "Hybrid",
      experience: jobDoc.experience || "",
      salary: jobDoc.salary || "",
      category: jobDoc.category || "",
    },
    candidate: {
      candidateId: candidateId ? String(candidateId) : null,
      resumeId: resumeId ? String(resumeId) : null,
      resumeTitle: candidateProfile.resumeTitle,
      totalSkills: (candidateProfile.skills || []).length,
    },
    summary,
    requiredSkills: {
      matched: requiredSkillMatch.matched,
      missing: requiredSkillMatch.missing,
      unresolved: requiredSkillMatch.unresolved,
      totalCount: requiredSkillMatch.totalCount,
      matchedCount: requiredSkillMatch.matchedCount,
      missingCount: requiredSkillMatch.missingCount,
    },
    preferredSkills: {
      matched: preferredSkillMatch.matched,
      missing: preferredSkillMatch.missing,
      unresolved: preferredSkillMatch.unresolved,
      totalCount: preferredSkillMatch.totalCount,
      matchedCount: preferredSkillMatch.matchedCount,
      missingCount: preferredSkillMatch.missingCount,
    },
    factors,
    recommendations,
  };
};

module.exports = {
  evaluateJobMatch,
  determineMatchStatus,
};
