/**
 * Phase 4F Skill Intelligence Constants
 * JobPortal 2.0 — Deterministic, Explainable Skill System
 */

const SKILL_INTELLIGENCE_VERSION = "1.0.0";

const SKILL_CATEGORIES = Object.freeze({
  PROGRAMMING: "PROGRAMMING",
  FRONTEND: "FRONTEND",
  BACKEND: "BACKEND",
  DATABASE: "DATABASE",
  DATA_ANALYTICS: "DATA_ANALYTICS",
  DATA_SCIENCE: "DATA_SCIENCE",
  AI_ML: "AI_ML",
  CLOUD: "CLOUD",
  DEVOPS: "DEVOPS",
  CYBERSECURITY: "CYBERSECURITY",
  MOBILE: "MOBILE",
  TESTING: "TESTING",
  UI_UX: "UI_UX",
  BUSINESS: "BUSINESS",
  TOOLS: "TOOLS",
  SOFT_SKILLS: "SOFT_SKILLS",
  OTHER: "OTHER",
});

const VALID_SKILL_CATEGORIES_LIST = Object.freeze(Object.values(SKILL_CATEGORIES));

const EVIDENCE_SOURCES = Object.freeze({
  EXPLICIT_SKILL: "EXPLICIT_SKILL",
  EXPERIENCE_BULLET: "EXPERIENCE_BULLET",
  PROJECT_TECHNOLOGY: "PROJECT_TECHNOLOGY",
  PROJECT_DESCRIPTION: "PROJECT_DESCRIPTION",
  PROFILE_DECLARED: "PROFILE_DECLARED",
});

const SKILL_LEVELS = Object.freeze({
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
  NOT_SPECIFIED: "NOT_SPECIFIED",
});

const SKILL_MATCH_STATUS = Object.freeze({
  MATCHED: "MATCHED",
  MISSING: "MISSING",
  UNRESOLVED: "UNRESOLVED",
});

const RECOMMENDATION_PRIORITY = Object.freeze({
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
});

const CATEGORY_DISPLAY_LABELS = Object.freeze({
  PROGRAMMING: "Programming & Languages",
  FRONTEND: "Frontend Engineering",
  BACKEND: "Backend & Systems",
  DATABASE: "Databases & Storage",
  DATA_ANALYTICS: "Data Analytics & BI",
  DATA_SCIENCE: "Data Science & Statistics",
  AI_ML: "AI & Machine Learning",
  CLOUD: "Cloud Infrastructure",
  DEVOPS: "DevOps & CI/CD",
  CYBERSECURITY: "Cybersecurity & InfoSec",
  MOBILE: "Mobile Development",
  TESTING: "Quality Assurance & Testing",
  UI_UX: "UI/UX & Product Design",
  BUSINESS: "Business & Management",
  TOOLS: "Developer Tools & Version Control",
  SOFT_SKILLS: "Soft Skills & Leadership",
  OTHER: "General & Domain Specific",
});

module.exports = {
  SKILL_INTELLIGENCE_VERSION,
  SKILL_CATEGORIES,
  VALID_SKILL_CATEGORIES_LIST,
  EVIDENCE_SOURCES,
  SKILL_LEVELS,
  SKILL_MATCH_STATUS,
  RECOMMENDATION_PRIORITY,
  CATEGORY_DISPLAY_LABELS,
};
