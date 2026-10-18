/**
 * Skill Normalizer Module
 * JobPortal 2.0 — Phase 4F Deterministic Skill Intelligence
 */

const { ALIAS_LOOKUP_MAP, CANONICAL_MAP_BY_KEY } = require("./skillDictionary");
const { normalizeCategory } = require("./skillCategorizer");
const { SKILL_CATEGORIES } = require("./skillIntelligenceConstants");

/**
 * Creates a clean slug key from an arbitrary string.
 * @param {string} text
 * @returns {string}
 */
const slugifySkill = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-+#.]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

/**
 * Cleans punctuation and excess whitespace for lookup while preserving symbols like C++, C#, .NET
 * @param {string} raw
 * @returns {string}
 */
const cleanForLookup = (raw) => {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

/**
 * Normalizes a single raw skill input.
 * @param {string|object} skillInput - Either a skill name string or { name, category, level }
 * @returns {object} Normalized skill object
 */
const normalizeSkill = (skillInput) => {
  let rawName = "";
  let userCategory = null;
  let userLevel = null;

  if (typeof skillInput === "string") {
    rawName = skillInput;
  } else if (skillInput && typeof skillInput === "object") {
    rawName = skillInput.name || skillInput.skill || skillInput.title || "";
    userCategory = skillInput.category || null;
    userLevel = skillInput.level || null;
  }

  const trimmedName = typeof rawName === "string" ? rawName.trim() : "";
  if (!trimmedName) {
    return null;
  }

  const lookupKey = cleanForLookup(trimmedName);

  // 1. Check exact alias or canonical name match
  let canonicalMatch = ALIAS_LOOKUP_MAP.get(lookupKey);

  // 2. If not matched, try removing common non-alphanumeric separators (e.g. "react.js" -> "react js" or "reactjs")
  if (!canonicalMatch) {
    const strippedLookup = lookupKey.replace(/[._-]/g, "");
    canonicalMatch = ALIAS_LOOKUP_MAP.get(strippedLookup);
  }

  // 3. If canonical match found
  if (canonicalMatch) {
    const isExactName = canonicalMatch.name.toLowerCase() === trimmedName.toLowerCase();
    return {
      key: canonicalMatch.key,
      name: canonicalMatch.name,
      category: canonicalMatch.category,
      normalized: true,
      aliasMatched: !isExactName,
      originalName: trimmedName,
      userLevel: userLevel || null,
      relatedSkills: Array.isArray(canonicalMatch.relatedSkills) ? [...canonicalMatch.relatedSkills] : [],
    };
  }

  // 4. Unknown / unmapped skill: PRESERVE WITHOUT REMOVAL
  const fallbackKey = slugifySkill(trimmedName) || trimmedName.toLowerCase();
  const fallbackCategory = userCategory
    ? normalizeCategory(userCategory)
    : SKILL_CATEGORIES.OTHER;

  return {
    key: fallbackKey,
    name: trimmedName,
    category: fallbackCategory,
    normalized: false,
    aliasMatched: false,
    originalName: trimmedName,
    userLevel: userLevel || null,
    relatedSkills: [],
  };
};

/**
 * Normalizes an array of skills, removes duplicates deterministically, and preserves order.
 * @param {Array<string|object>} skillsList
 * @returns {Array<object>}
 */
const normalizeSkillsList = (skillsList) => {
  if (!Array.isArray(skillsList)) return [];

  const seenKeys = new Set();
  const result = [];

  for (const item of skillsList) {
    const normalized = normalizeSkill(item);
    if (normalized && normalized.key && !seenKeys.has(normalized.key)) {
      seenKeys.add(normalized.key);
      result.push(normalized);
    }
  }

  return result;
};

module.exports = {
  normalizeSkill,
  normalizeSkillsList,
  slugifySkill,
  cleanForLookup,
};
