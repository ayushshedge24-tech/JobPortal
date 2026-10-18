/**
 * JobPortal 2.0 — Resume Analyzer Constants & Enums
 * Phase 4E: Deterministic, Explainable, Standards-based Analyzer Rules
 */

const ANALYZER_VERSION = "1.0.0";

const STATUS = {
  GOOD: "GOOD",
  NEEDS_ATTENTION: "NEEDS_ATTENTION",
  MISSING: "MISSING",
};

const SEVERITY = {
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARNING: "WARNING",
  ERROR: "ERROR",
};

const SECTION_COMPLETENESS = {
  PRESENT: "PRESENT",
  PARTIAL: "PARTIAL",
  MISSING: "MISSING",
};

const IMPORTANCE = {
  REQUIRED: "REQUIRED",
  RECOMMENDED: "RECOMMENDED",
  OPTIONAL: "OPTIONAL",
};

const CATEGORIES = {
  CONTACT: "CONTACT",
  SUMMARY: "SUMMARY",
  EXPERIENCE: "EXPERIENCE",
  EDUCATION: "EDUCATION",
  SKILLS: "SKILLS",
  PROJECTS: "PROJECTS",
  CERTIFICATIONS: "CERTIFICATIONS",
  ACHIEVEMENTS: "ACHIEVEMENTS",
  LANGUAGES: "LANGUAGES",
  ATS_STRUCTURE: "ATS_STRUCTURE",
  FORMATTING: "FORMATTING",
};

// Curated action verbs list (in lower case)
const ACTION_VERBS = new Set([
  // Leadership & Strategy
  "led", "lead", "leading", "managed", "manage", "managing", "directed", "direct", "directing",
  "spearheaded", "spearhead", "spearheading", "orchestrated", "orchestrate", "supervised", "supervise",
  "coordinated", "coordinate", "guided", "guide", "mentored", "mentor", "established", "establish",
  "founded", "found", "initiated", "initiate", "championed", "champion", "oversaw", "oversee",
  "steered", "steer", "advised", "advise", "delegated", "delegate", "governed", "govern",
  
  // Technical & Engineering
  "built", "build", "building", "engineered", "engineer", "architected", "architect",
  "developed", "develop", "developing", "implemented", "implement", "implementing",
  "designed", "design", "designing", "coded", "code", "programmed", "program",
  "deployed", "deploy", "deploying", "containerized", "containerize", "refactored", "refactor",
  "automated", "automate", "automating", "configured", "configure", "integrated", "integrate",
  "debugged", "debug", "scaled", "scale", "scaling", "benchmarked", "benchmark",
  "migrated", "migrate", "migrating", "monitored", "monitor", "maintained", "maintain",
  "crafted", "craft", "constructed", "construct", "provisioned", "provision", "published", "publish",
  
  // Impact, Growth & Optimization
  "optimized", "optimize", "optimizing", "reduced", "reduce", "reducing", "increased", "increase", "increasing",
  "improved", "improve", "improving", "accelerated", "accelerate", "boosted", "boost", "slashed", "slash",
  "doubled", "double", "expanded", "expand", "expanding", "enhanced", "enhance", "generated", "generate",
  "achieved", "achieve", "delivered", "deliver", "delivering", "saved", "save", "streamlined", "streamline",
  "maximized", "maximize", "transformed", "transform", "elevated", "elevate", "upgraded", "upgrade",
  
  // Research, Analysis & Problem Solving
  "analyzed", "analyze", "analyzing", "investigated", "investigate", "authored", "author",
  "formulated", "formulate", "evaluated", "evaluate", "synthesized", "synthesize",
  "modeled", "model", "tested", "test", "testing", "validated", "validate",
  "identified", "identify", "discovered", "discover", "resolved", "resolve", "audited", "audit"
]);

// Measurable tokens pattern (percentages, currency symbols, numbers, multipliers, metrics)
const MEASURABLE_TOKEN_REGEX = /(?:\b\d+(?:\.\d+)?%|\$\d+(?:,\d+)*(?:\.\d+)?|\b\d+(?:,\d+)*(?:\.\d+)?\b|₹\d+(?:,\d+)*(?:\.\d+)?|\b\d+[kKmMbB]\b|\b\d+x\b|\b\d+\s*(?:users|clients|requests|qps|rps|ms|seconds|minutes|hours|days|weeks|months|years|teams|members|engineers|microservices|services|servers|nodes|regions|tb|gb|mb|customers|accounts|transactions)\b)/i;

module.exports = {
  ANALYZER_VERSION,
  STATUS,
  SEVERITY,
  SECTION_COMPLETENESS,
  IMPORTANCE,
  CATEGORIES,
  ACTION_VERBS,
  MEASURABLE_TOKEN_REGEX,
};
