/**
 * Job Discovery Filters Module
 * JobPortal 2.0 — Phase 4I Deterministic Job Discovery & Recommendations
 */

const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require("./jobDiscoveryConstants");

/**
 * Escapes regex special characters to prevent regex injection attacks.
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Parses and sanitizes pagination and query parameters.
 * @param {object} queryParams - Raw Express req.query
 * @param {object} candidateProfile - CandidateProfile document/object
 * @returns {object} { mongoQuery, sortOption, page, limit, appliedFilters }
 */
const buildDiscoveryFilters = (queryParams = {}, candidateProfile = null) => {
  const mongoQuery = {};
  const appliedFilters = [];

  // 1. Keyword search (title, company, description)
  const keyword = typeof queryParams.keyword === "string" ? queryParams.keyword.trim() : "";
  if (keyword.length > 0) {
    const escapedKeyword = escapeRegex(keyword);
    mongoQuery.$or = [
      { title: { $regex: escapedKeyword, $options: "i" } },
      { company: { $regex: escapedKeyword, $options: "i" } },
      { description: { $regex: escapedKeyword, $options: "i" } },
    ];
    appliedFilters.push({ filter: "keyword", value: keyword });
  }

  // 2. Location filter (explicit query param, or candidate preferred locations)
  const locationParam = typeof queryParams.location === "string" ? queryParams.location.trim() : "";
  if (locationParam.length > 0) {
    const escapedLoc = escapeRegex(locationParam);
    mongoQuery.location = { $regex: escapedLoc, $options: "i" };
    appliedFilters.push({ filter: "location", value: locationParam, source: "QUERY" });
  }

  // 3. Work Mode filter (Remote, Hybrid, On-site)
  const workModeParam = typeof queryParams.workMode === "string" ? queryParams.workMode.trim() : "";
  if (workModeParam.length > 0) {
    mongoQuery.workMode = { $regex: `^${escapeRegex(workModeParam)}$`, $options: "i" };
    appliedFilters.push({ filter: "workMode", value: workModeParam, source: "QUERY" });
  }

  // 4. Category filter
  const categoryParam = typeof queryParams.category === "string" ? queryParams.category.trim() : "";
  if (categoryParam.length > 0) {
    mongoQuery.category = { $regex: escapeRegex(categoryParam), $options: "i" };
    appliedFilters.push({ filter: "category", value: categoryParam });
  }

  // 5. Employment Type / Job Type filter
  const employmentType = typeof queryParams.employmentType === "string" ? queryParams.employmentType.trim() : "";
  if (employmentType.length > 0) {
    mongoQuery.jobType = { $regex: `^${escapeRegex(employmentType)}$`, $options: "i" };
    appliedFilters.push({ filter: "employmentType", value: employmentType });
  }

  // 6. Experience filter
  const expParam = typeof queryParams.experience === "string" ? queryParams.experience.trim() : "";
  if (expParam.length > 0) {
    mongoQuery.experience = { $regex: escapeRegex(expParam), $options: "i" };
    appliedFilters.push({ filter: "experience", value: expParam });
  }

  // 7. Explicit skills filter (comma-separated or array)
  let skillsParam = queryParams.skills;
  if (typeof skillsParam === "string") {
    skillsParam = skillsParam.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(skillsParam) && skillsParam.length > 0) {
    mongoQuery.skills = { $in: skillsParam.map((s) => new RegExp(escapeRegex(s), "i")) };
    appliedFilters.push({ filter: "skills", value: skillsParam });
  }

  // 8. Pagination Sanitization
  let page = parseInt(queryParams.page, 10);
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;

  let limit = parseInt(queryParams.limit, 10);
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  // 9. Sort Option
  const sort = typeof queryParams.sort === "string" ? queryParams.sort.toUpperCase() : "RELEVANCE";

  return {
    mongoQuery,
    sort,
    page,
    limit,
    appliedFilters,
  };
};

module.exports = {
  escapeRegex,
  buildDiscoveryFilters,
};
