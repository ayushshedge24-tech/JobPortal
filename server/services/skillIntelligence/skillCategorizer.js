/**
 * Skill Categorizer Module
 * JobPortal 2.0 — Phase 4F Deterministic Skill Intelligence
 */

const {
  SKILL_CATEGORIES,
  VALID_SKILL_CATEGORIES_LIST,
  CATEGORY_DISPLAY_LABELS,
} = require("./skillIntelligenceConstants");

const CATEGORY_MAP = {
  // Common legacy resume / profile categories
  frontend: SKILL_CATEGORIES.FRONTEND,
  "front-end": SKILL_CATEGORIES.FRONTEND,
  "front end": SKILL_CATEGORIES.FRONTEND,
  backend: SKILL_CATEGORIES.BACKEND,
  "back-end": SKILL_CATEGORIES.BACKEND,
  "back end": SKILL_CATEGORIES.BACKEND,
  programming: SKILL_CATEGORIES.PROGRAMMING,
  languages: SKILL_CATEGORIES.PROGRAMMING,
  "programming languages": SKILL_CATEGORIES.PROGRAMMING,
  database: SKILL_CATEGORIES.DATABASE,
  databases: SKILL_CATEGORIES.DATABASE,
  "databases & storage": SKILL_CATEGORIES.DATABASE,
  "data/ai": SKILL_CATEGORIES.AI_ML,
  "ai/ml": SKILL_CATEGORIES.AI_ML,
  "data analytics": SKILL_CATEGORIES.DATA_ANALYTICS,
  analytics: SKILL_CATEGORIES.DATA_ANALYTICS,
  "data science": SKILL_CATEGORIES.DATA_SCIENCE,
  cloud: SKILL_CATEGORIES.CLOUD,
  "cloud infrastructure": SKILL_CATEGORIES.CLOUD,
  devops: SKILL_CATEGORIES.DEVOPS,
  "ci/cd": SKILL_CATEGORIES.DEVOPS,
  cybersecurity: SKILL_CATEGORIES.CYBERSECURITY,
  security: SKILL_CATEGORIES.CYBERSECURITY,
  mobile: SKILL_CATEGORIES.MOBILE,
  "mobile development": SKILL_CATEGORIES.MOBILE,
  testing: SKILL_CATEGORIES.TESTING,
  qa: SKILL_CATEGORIES.TESTING,
  "quality assurance": SKILL_CATEGORIES.TESTING,
  "ui/ux": SKILL_CATEGORIES.UI_UX,
  design: SKILL_CATEGORIES.UI_UX,
  business: SKILL_CATEGORIES.BUSINESS,
  management: SKILL_CATEGORIES.BUSINESS,
  tools: SKILL_CATEGORIES.TOOLS,
  "soft skills": SKILL_CATEGORIES.SOFT_SKILLS,
  softskills: SKILL_CATEGORIES.SOFT_SKILLS,
  other: SKILL_CATEGORIES.OTHER,
};

/**
 * Normalizes any category string into a controlled category enum.
 * @param {string} rawCategory
 * @returns {string} Controlled SKILL_CATEGORIES enum
 */
const normalizeCategory = (rawCategory) => {
  if (!rawCategory || typeof rawCategory !== "string") {
    return SKILL_CATEGORIES.OTHER;
  }

  const trimmed = rawCategory.trim();
  const upper = trimmed.toUpperCase();

  // If already matches controlled enum
  if (VALID_SKILL_CATEGORIES_LIST.includes(upper)) {
    return upper;
  }

  const lower = trimmed.toLowerCase();
  if (CATEGORY_MAP[lower]) {
    return CATEGORY_MAP[lower];
  }

  return SKILL_CATEGORIES.OTHER;
};

/**
 * Gets human-readable display label for category
 * @param {string} categoryKey
 * @returns {string}
 */
const getCategoryLabel = (categoryKey) => {
  const norm = normalizeCategory(categoryKey);
  return CATEGORY_DISPLAY_LABELS[norm] || CATEGORY_DISPLAY_LABELS.OTHER;
};

/**
 * Checks if a category string is a valid controlled category
 * @param {string} categoryKey
 * @returns {boolean}
 */
const isValidCategory = (categoryKey) => {
  return VALID_SKILL_CATEGORIES_LIST.includes(categoryKey);
};

module.exports = {
  normalizeCategory,
  getCategoryLabel,
  isValidCategory,
};
