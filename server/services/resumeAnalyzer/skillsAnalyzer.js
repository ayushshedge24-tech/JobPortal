/**
 * JobPortal 2.0 — Skills Section Analyzer
 * Evaluates skill counts, uniqueness, duplicates, category distribution, and proficiency representations.
 */

const { STATUS, SEVERITY, CATEGORIES } = require("./analyzerConstants");

const analyzeSkills = (content = {}) => {
  const skills = Array.isArray(content.skills) ? content.skills : [];
  const findings = [];

  if (skills.length === 0) {
    findings.push({
      id: "skills-missing",
      category: CATEGORIES.SKILLS,
      severity: SEVERITY.WARNING,
      code: "SKILLS_MISSING",
      title: "No Skills Listed",
      message: "Listing relevant technical, domain, and tool skills is essential for recruiter keyword matching.",
      evidence: "0 skills detected",
      recommendation: "Add 5–15 relevant core skills categorized by domain in the Skills section.",
    });

    return {
      status: STATUS.MISSING,
      totalSkills: 0,
      uniqueSkills: 0,
      duplicateCount: 0,
      categoriesCount: 0,
      categoryDistribution: {},
      levelDistribution: {},
      findings,
    };
  }

  const normalizedNames = new Map(); // normalizedName -> list of original names
  const categoryDistribution = {};
  const levelDistribution = {};
  let emptySkillsCount = 0;

  skills.forEach((s) => {
    const rawName = (s.name || "").trim();
    if (!rawName) {
      emptySkillsCount++;
      return;
    }

    const norm = rawName.toLowerCase();
    if (!normalizedNames.has(norm)) {
      normalizedNames.set(norm, []);
    }
    normalizedNames.get(norm).push(rawName);

    // Category tracking
    const cat = (s.category || "Other").trim() || "Other";
    categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;

    // Level tracking
    const lvl = (s.level || "Unspecified").trim() || "Unspecified";
    levelDistribution[lvl] = (levelDistribution[lvl] || 0) + 1;
  });

  const uniqueSkillsCount = normalizedNames.size;
  const duplicateList = [];
  normalizedNames.forEach((list, norm) => {
    if (list.length > 1) {
      duplicateList.push({ name: list[0], count: list.length });
    }
  });

  const categoriesCount = Object.keys(categoryDistribution).length;

  // Overview Finding
  findings.push({
    id: "skills-overview",
    category: CATEGORIES.SKILLS,
    severity: SEVERITY.SUCCESS,
    code: "SKILLS_SUMMARY",
    title: "Skills Configured",
    message: `Your resume contains ${uniqueSkillsCount} ${uniqueSkillsCount === 1 ? "skill" : "skills"} across ${categoriesCount} ${categoriesCount === 1 ? "category" : "categories"}.`,
    evidence: `${uniqueSkillsCount} unique skills across ${categoriesCount} categories`,
    recommendation: null,
  });

  // Empty skills alert
  if (emptySkillsCount > 0) {
    findings.push({
      id: "skills-empty-names",
      category: CATEGORIES.SKILLS,
      severity: SEVERITY.WARNING,
      code: "EMPTY_SKILL_NAME",
      title: "Empty Skill Names Detected",
      message: `${emptySkillsCount} skill ${emptySkillsCount === 1 ? "entry has" : "entries have"} no name specified.`,
      evidence: `${emptySkillsCount} empty skill names`,
      recommendation: "Fill in the missing skill names or remove the empty skill rows.",
    });
  }

  // Duplicate skills alert
  if (duplicateList.length > 0) {
    const dupNames = duplicateList.map((d) => `"${d.name}" (${d.count}x)`).join(", ");
    findings.push({
      id: "skills-duplicate-detected",
      category: CATEGORIES.SKILLS,
      severity: SEVERITY.WARNING,
      code: "DUPLICATE_SKILLS_DETECTED",
      title: "Duplicate Skills Detected",
      message: `The following skills are duplicated on your resume: ${dupNames}.`,
      evidence: `Duplicates: ${dupNames}`,
      recommendation: "Remove duplicate skill entries so each skill appears only once.",
    });
  }

  // Skill Volume Signal
  if (uniqueSkillsCount < 3) {
    findings.push({
      id: "skills-count-low",
      category: CATEGORIES.SKILLS,
      severity: SEVERITY.INFO,
      code: "SKILLS_COUNT_LOW",
      title: "Few Skills Listed",
      message: `Your resume has only ${uniqueSkillsCount} skills. Adding 6–15 skills helps showcase your full technical proficiency.`,
      evidence: `${uniqueSkillsCount} skills listed`,
      recommendation: "Add additional relevant programming languages, frameworks, and tools.",
    });
  }

  // Status calculation
  let status = STATUS.GOOD;
  if (duplicateList.length > 0 || emptySkillsCount > 0 || uniqueSkillsCount < 3) {
    status = STATUS.NEEDS_ATTENTION;
  }

  return {
    status,
    totalSkills: skills.length,
    uniqueSkills: uniqueSkillsCount,
    duplicateCount: duplicateList.length,
    duplicates: duplicateList,
    emptySkillsCount,
    categoriesCount,
    categoryDistribution,
    levelDistribution,
    findings,
  };
};

module.exports = {
  analyzeSkills,
};
