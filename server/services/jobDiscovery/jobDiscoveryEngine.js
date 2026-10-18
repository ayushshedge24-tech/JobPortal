/**
 * Job Discovery Engine Module
 * JobPortal 2.0 — Phase 4I Deterministic Job Discovery & Recommendations
 */

const {
  JOB_DISCOVERY_VERSION,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
} = require("./jobDiscoveryConstants");

const { buildDiscoveryFilters } = require("./jobDiscoveryFilters");
const { evaluateJobDiscoveryAlignment, rankDiscoveredJobs } = require("./jobDiscoveryRanker");
const { buildCandidateSkillProfile } = require("../skillIntelligence/candidateSkillProfile");
const Job = require("../../models/Job");

/**
 * Discovers and recommends actual jobs from the database for the candidate.
 * STRICTLY DETERMINISTIC — ZERO FAKE AI / ARBITRARY PERCENTAGES.
 *
 * @param {object} params
 * @param {object} params.candidateProfile - CandidateProfile document/object
 * @param {object} params.primaryResume - Primary Resume document/object
 * @param {object} params.queryParams - Filter/search query parameters
 * @returns {Promise<object>} Discovery Result Payload
 */
const discoverRecommendedJobs = async ({
  candidateProfile = null,
  primaryResume = null,
  queryParams = {},
} = {}) => {
  const generatedAt = new Date().toISOString();

  // 1. Build Candidate Canonical Skills using Phase 4F
  const skillSourceDoc = primaryResume && primaryResume.content
    ? primaryResume
    : candidateProfile || { content: { skills: [] } };

  const skillProfile = buildCandidateSkillProfile(skillSourceDoc, {
    candidateId: candidateProfile?.user || primaryResume?.user || null,
    resumeId: primaryResume?._id || null,
    title: primaryResume?.title || "Candidate Profile",
  });

  const candidateSkillsMap = new Map();
  (skillProfile.skills || []).forEach((sk) => {
    if (sk && sk.key) {
      candidateSkillsMap.set(sk.key, sk);
    }
  });

  // 2. Build Safe MongoDB Filters
  const { mongoQuery, sort, page, limit, appliedFilters } = buildDiscoveryFilters(
    queryParams,
    candidateProfile
  );

  // 3. Query Database with lean projection
  // To rank deterministically in memory within the filtered subset, query up to (page * limit * 3) or fetch page subset
  const totalCount = await Job.countDocuments(mongoQuery);
  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Retrieve candidate matches matching the query
  const rawJobs = await Job.find(mongoQuery)
    .sort({ createdAt: -1 })
    .limit(limit * 5) // Fetch adequate candidate pool for deterministic skill ranking
    .lean();

  // 4. Evaluate Alignment for Each Discovered Job
  const evaluatedJobs = rawJobs.map((job) => {
    const alignment = evaluateJobDiscoveryAlignment(job, candidateSkillsMap, candidateProfile);
    return {
      job: {
        _id: String(job._id),
        title: job.title || "Position",
        company: job.company || "",
        location: job.location || "",
        workMode: job.workMode || "Hybrid",
        experience: job.experience || "Not Specified",
        salary: job.salary || "",
        jobType: job.jobType || "Full-time",
        category: job.category || "Software Development",
        skills: Array.isArray(job.skills) ? job.skills : [],
        createdAt: job.createdAt || null,
      },
      alignment: {
        status: alignment.status,
        matchedSkills: alignment.matchedSkills,
        missingSkills: alignment.missingSkills,
        reasons: alignment.reasons,
        alignmentRank: alignment.alignmentRank,
        workModeMatched: alignment.workModeMatched,
        locationMatched: alignment.locationMatched,
      },
    };
  });

  // 5. Apply Deterministic Multi-Key Ranking
  const rankedJobs = rankDiscoveredJobs(evaluatedJobs, sort);

  // 6. Paginate Results
  const startIndex = (page - 1) * limit;
  const paginatedResults = rankedJobs.slice(startIndex, startIndex + limit).map((item) => {
    // Strip internal sorting ranks from client output
    const { alignmentRank, workModeMatched, locationMatched, ...cleanAlignment } = item.alignment;
    return {
      job: item.job,
      alignment: cleanAlignment,
    };
  });

  return {
    version: JOB_DISCOVERY_VERSION,
    generatedAt,
    query: {
      keyword: queryParams.keyword || "",
      location: queryParams.location || "",
      workMode: queryParams.workMode || "",
      experience: queryParams.experience || "",
      category: queryParams.category || "",
      employmentType: queryParams.employmentType || "",
      salaryMin: queryParams.salaryMin || "",
      salaryMax: queryParams.salaryMax || "",
      skills: queryParams.skills || "",
      sort,
      page,
      limit,
    },
    results: paginatedResults,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
    },
    metadata: {
      filtersApplied: appliedFilters,
      candidateSkillsCount: candidateSkillsMap.size,
    },
  };
};

module.exports = {
  discoverRecommendedJobs,
};
