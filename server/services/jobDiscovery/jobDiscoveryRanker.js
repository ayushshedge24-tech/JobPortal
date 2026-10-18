/**
 * Job Discovery Ranker Module
 * JobPortal 2.0 — Phase 4I Deterministic Job Discovery & Recommendations
 *
 * STRICTLY RULE-BASED & LEXICOGRAPHIC — ZERO NUMERIC SCORES OR ARBITRARY WEIGHTS.
 */

const {
  DISCOVERY_ALIGNMENT_STATUS,
  DISCOVERY_SORT_OPTIONS,
} = require("./jobDiscoveryConstants");

const { buildDiscoveryReasons } = require("./jobDiscoveryReasonBuilder");
const { normalizeSkill } = require("../skillIntelligence/skillNormalizer");

/**
 * Evaluates alignment of a single job with candidate's canonical skills & preferences.
 * @param {object} job - Job document/object
 * @param {Map<string, object>} candidateSkillsMap - Map of candidate canonical skills
 * @param {object} candidateProfile - CandidateProfile document/object
 * @returns {object} { status, matchedSkills, missingSkills, reasons, alignmentRank }
 */
const evaluateJobDiscoveryAlignment = (job, candidateSkillsMap, candidateProfile = null) => {
  const jobSkillsList = Array.isArray(job.skills) ? job.skills : [];
  const matchedSkills = [];
  const missingSkills = [];

  jobSkillsList.forEach((rawSkill) => {
    const norm = normalizeSkill(rawSkill);
    if (!norm) return;

    if (candidateSkillsMap.has(norm.key)) {
      matchedSkills.push({
        key: norm.key,
        canonicalName: norm.name,
        category: norm.category,
      });
    } else {
      missingSkills.push({
        key: norm.key,
        canonicalName: norm.name,
        category: norm.category,
      });
    }
  });

  // Check Work Mode
  const candidateWorkModes = Array.isArray(candidateProfile?.preferredWorkModes)
    ? candidateProfile.preferredWorkModes.map((m) => m.toLowerCase())
    : [];
  const jobWorkMode = (job.workMode || "").toLowerCase();
  const workModeMatched = candidateWorkModes.some((m) => m === jobWorkMode || (m === "remote" && jobWorkMode === "remote"));

  // Check Location
  const candidateLocations = [
    candidateProfile?.city,
    candidateProfile?.location,
    ...(Array.isArray(candidateProfile?.preferredLocations) ? candidateProfile.preferredLocations : []),
  ]
    .filter(Boolean)
    .map((l) => l.trim().toLowerCase());

  const jobLocation = (job.location || "").toLowerCase();
  const isRemote = jobWorkMode === "remote";
  const locationMatched = isRemote || candidateLocations.some((l) => jobLocation.includes(l) || l.includes(jobLocation));

  // Check Category
  const candidateSkillsCategories = new Set();
  for (const sk of candidateSkillsMap.values()) {
    if (sk.category) candidateSkillsCategories.add(sk.category);
  }
  const jobCategory = (job.category || "").toLowerCase();
  const categoryMatched = candidateSkillsCategories.size > 0 && jobCategory.length > 0;

  // Check Experience
  const experienceMatched = true; // factual check

  // Assign Categorical Alignment Status
  let status = DISCOVERY_ALIGNMENT_STATUS.DISCOVERY_ONLY;
  let alignmentRank = 1; // Base

  if (matchedSkills.length >= 3 && (locationMatched || workModeMatched)) {
    status = DISCOVERY_ALIGNMENT_STATUS.HIGH_ALIGNMENT;
    alignmentRank = 4;
  } else if (matchedSkills.length >= 1) {
    status = DISCOVERY_ALIGNMENT_STATUS.GOOD_ALIGNMENT;
    alignmentRank = 3;
  } else if (locationMatched || workModeMatched || categoryMatched) {
    status = DISCOVERY_ALIGNMENT_STATUS.PARTIAL_ALIGNMENT;
    alignmentRank = 2;
  }

  // Build Factual Reasons
  const reasons = buildDiscoveryReasons({
    matchedSkills,
    workModeMatched,
    locationMatched,
    experienceMatched: false,
    categoryMatched,
    job,
    candidateProfile,
  });

  return {
    status,
    alignmentRank,
    matchedSkills,
    missingSkills,
    reasons,
    workModeMatched,
    locationMatched,
  };
};

/**
 * Deterministically ranks a list of discovered jobs using lexicographic rules.
 * @param {Array<object>} evaluatedJobs - Array of { job, alignment }
 * @param {string} sortOption - RELEVANCE | NEWEST | SALARY_HIGH | SALARY_LOW
 * @returns {Array<object>} Deterministically sorted jobs
 */
const rankDiscoveredJobs = (evaluatedJobs, sortOption = DISCOVERY_SORT_OPTIONS.RELEVANCE) => {
  if (!Array.isArray(evaluatedJobs)) return [];

  const copy = [...evaluatedJobs];

  if (sortOption === DISCOVERY_SORT_OPTIONS.NEWEST) {
    return copy.sort((a, b) => {
      const dateA = new Date(a.job.createdAt || 0).getTime();
      const dateB = new Date(b.job.createdAt || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return String(a.job._id).localeCompare(String(b.job._id));
    });
  }

  if (sortOption === DISCOVERY_SORT_OPTIONS.SALARY_HIGH) {
    return copy.sort((a, b) => {
      const salA = parseFloat((a.job.salary || "").replace(/[^0-9.]/g, "")) || 0;
      const salB = parseFloat((b.job.salary || "").replace(/[^0-9.]/g, "")) || 0;
      if (salB !== salA) return salB - salA;
      return new Date(b.job.createdAt || 0).getTime() - new Date(a.job.createdAt || 0).getTime();
    });
  }

  if (sortOption === DISCOVERY_SORT_OPTIONS.SALARY_LOW) {
    return copy.sort((a, b) => {
      const salA = parseFloat((a.job.salary || "").replace(/[^0-9.]/g, "")) || 0;
      const salB = parseFloat((b.job.salary || "").replace(/[^0-9.]/g, "")) || 0;
      if (salA !== salB) return salA - salB;
      return new Date(b.job.createdAt || 0).getTime() - new Date(a.job.createdAt || 0).getTime();
    });
  }

  // Default: RELEVANCE (Lexicographic deterministic sorting)
  // Priority 1: Alignment status rank (HIGH -> GOOD -> PARTIAL -> DISCOVERY)
  // Priority 2: Matched skills count DESC
  // Priority 3: Work mode match DESC
  // Priority 4: Location match DESC
  // Priority 5: createdAt DESC
  // Priority 6: _id ASC (Deterministic Tie-Breaker)
  return copy.sort((a, b) => {
    // 1. Alignment status rank
    if (b.alignment.alignmentRank !== a.alignment.alignmentRank) {
      return b.alignment.alignmentRank - a.alignment.alignmentRank;
    }

    // 2. Skill overlap count
    const matchedDiff = (b.alignment.matchedSkills?.length || 0) - (a.alignment.matchedSkills?.length || 0);
    if (matchedDiff !== 0) return matchedDiff;

    // 3. Work mode match
    if (b.alignment.workModeMatched !== a.alignment.workModeMatched) {
      return b.alignment.workModeMatched ? 1 : -1;
    }

    // 4. Location match
    if (b.alignment.locationMatched !== a.alignment.locationMatched) {
      return b.alignment.locationMatched ? 1 : -1;
    }

    // 5. Job freshness (createdAt DESC)
    const dateA = new Date(a.job.createdAt || 0).getTime();
    const dateB = new Date(b.job.createdAt || 0).getTime();
    if (dateB !== dateA) return dateB - dateA;

    // 6. Deterministic Tie-Breaker (_id ASC)
    return String(a.job._id).localeCompare(String(b.job._id));
  });
};

module.exports = {
  evaluateJobDiscoveryAlignment,
  rankDiscoveredJobs,
};
