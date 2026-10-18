/**
 * Job Skill Extractor Module
 * JobPortal 2.0 — Phase 4F Deterministic Skill Intelligence
 */

const { normalizeSkill } = require("./skillNormalizer");
const { scanTextForSkills } = require("./skillExtractor");

/**
 * Extracts and normalizes skills from a Job model document or payload.
 * @param {object} job - Job document
 * @returns {object} { requiredSkills, mentionedSkills, allJobSkills, jobTitle, company, jobId }
 */
const extractSkillsFromJob = (job) => {
  if (!job || typeof job !== "object") {
    return {
      requiredSkills: [],
      mentionedSkills: [],
      allJobSkills: [],
      jobTitle: "",
      company: "",
      jobId: null,
    };
  }

  const jobSkillsMap = new Map();

  // Helper to record a job skill
  const recordJobSkill = (normalized, requirementType, evidence = "") => {
    if (!normalized || !normalized.key) return;

    if (!jobSkillsMap.has(normalized.key)) {
      jobSkillsMap.set(normalized.key, {
        key: normalized.key,
        name: normalized.name,
        category: normalized.category,
        requirementType, // "DECLARED_REQUIREMENT" or "MENTIONED_REQUIREMENT"
        normalized: normalized.normalized !== false,
        aliasMatched: !!normalized.aliasMatched,
        originalName: normalized.originalName,
        evidence: [],
        relatedSkills: normalized.relatedSkills || [],
      });
    }

    const item = jobSkillsMap.get(normalized.key);
    // Declared requirement takes precedence over mentioned
    if (requirementType === "DECLARED_REQUIREMENT") {
      item.requirementType = "DECLARED_REQUIREMENT";
    }

    if (evidence && typeof evidence === "string" && item.evidence.length < 3) {
      item.evidence.push(evidence);
    }
  };

  // 1. Declared skills from job.skills array
  const declaredSkills = Array.isArray(job.skills) ? job.skills : [];
  declaredSkills.forEach((skillItem) => {
    const normalized = normalizeSkill(skillItem);
    if (normalized) {
      recordJobSkill(
        normalized,
        "DECLARED_REQUIREMENT",
        `Declared in job skills requirement: "${normalized.originalName}"`
      );
    }
  });

  // 2. Mentioned skills from job.title, job.description, job.category
  const textCorpus = [job.title, job.category, job.description].filter(Boolean).join(" ");
  if (textCorpus) {
    const mentioned = scanTextForSkills(textCorpus);
    mentioned.forEach((sk) => {
      recordJobSkill(
        sk,
        "MENTIONED_REQUIREMENT",
        `Mentioned in job description / title for "${job.title || "Position"}"`
      );
    });
  }

  const allJobSkills = Array.from(jobSkillsMap.values());
  const requiredSkills = allJobSkills.filter((s) => s.requirementType === "DECLARED_REQUIREMENT");
  const mentionedSkills = allJobSkills.filter((s) => s.requirementType === "MENTIONED_REQUIREMENT");

  return {
    jobId: job._id ? String(job._id) : null,
    jobTitle: job.title || "Untitled Job",
    company: job.company || "",
    category: job.category || "",
    requiredSkills,
    mentionedSkills,
    allJobSkills,
  };
};

module.exports = {
  extractSkillsFromJob,
};
