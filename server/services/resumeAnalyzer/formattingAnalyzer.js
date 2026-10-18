/**
 * JobPortal 2.0 — Formatting & Content Volume Analyzer
 * Evaluates typography settings, color validation, and estimated content volume.
 */

const { STATUS, SEVERITY, CATEGORIES } = require("./analyzerConstants");
const {
  VALID_FONT_SIZES,
  VALID_LINE_SPACINGS,
} = require("../../models/Resume");

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6})$/;

const analyzeFormatting = (content = {}) => {
  const styling = content.styling || {};
  const experiences = Array.isArray(content.experience) ? content.experience : [];
  const educations = Array.isArray(content.education) ? content.education : [];
  const skills = Array.isArray(content.skills) ? content.skills : [];
  const projects = Array.isArray(content.projects) ? content.projects : [];
  const customSections = Array.isArray(content.customSections) ? content.customSections : [];
  const findings = [];

  const fontSize = styling.fontSize || "MD";
  const lineSpacing = styling.lineSpacing || "NORMAL";
  const primaryColor = styling.primaryColor || "#2563eb";

  // Validate Font Size
  const isValidFontSize = VALID_FONT_SIZES.includes(fontSize);
  if (!isValidFontSize) {
    findings.push({
      id: "fmt-invalid-fontsize",
      category: CATEGORIES.FORMATTING,
      severity: SEVERITY.ERROR,
      code: "FONT_SIZE_INVALID",
      title: "Invalid Font Size Setting",
      message: `Font size '${fontSize}' is not in the allowed set (SM, MD, LG).`,
      evidence: `fontSize = ${fontSize}`,
      recommendation: "Choose one of the supported font size options: SM (9.5pt), MD (10pt), or LG (11pt).",
    });
  }

  // Validate Line Spacing
  const isValidLineSpacing = VALID_LINE_SPACINGS.includes(lineSpacing);
  if (!isValidLineSpacing) {
    findings.push({
      id: "fmt-invalid-linespacing",
      category: CATEGORIES.FORMATTING,
      severity: SEVERITY.ERROR,
      code: "LINE_SPACING_INVALID",
      title: "Invalid Line Spacing Setting",
      message: `Line spacing '${lineSpacing}' is not in the allowed set (COMPACT, NORMAL, RELAXED).`,
      evidence: `lineSpacing = ${lineSpacing}`,
      recommendation: "Choose one of the supported line spacing modes: COMPACT, NORMAL, or RELAXED.",
    });
  }

  // Validate Primary Color
  const isValidColor = HEX_COLOR_REGEX.test(primaryColor);
  if (!isValidColor) {
    findings.push({
      id: "fmt-invalid-color",
      category: CATEGORIES.FORMATTING,
      severity: SEVERITY.ERROR,
      code: "PRIMARY_COLOR_INVALID",
      title: "Invalid Primary Brand Color",
      message: `Color '${primaryColor}' is not a valid 6-digit hex code.`,
      evidence: `primaryColor = ${primaryColor}`,
      recommendation: "Select an accessible 6-digit hex color (e.g. #2563eb).",
    });
  }

  // Calculate Total Content Items & Volume Indicator
  let totalBullets = 0;
  experiences.forEach((e) => {
    if (Array.isArray(e.bulletPoints)) totalBullets += e.bulletPoints.length;
  });
  projects.forEach((p) => {
    if (Array.isArray(p.bulletPoints)) totalBullets += p.bulletPoints.length;
  });

  const totalPrimaryItems = experiences.length + educations.length + projects.length + customSections.length;
  
  let volumeClassification = "COMPACT";
  let volumeDescription = "Compact content volume (fits cleanly within a 1-page layout).";

  if (totalPrimaryItems >= 8 || totalBullets >= 18) {
    volumeClassification = "COMPREHENSIVE";
    volumeDescription = "Comprehensive multi-entry content volume (typically structures across 2+ pages).";
  } else if (totalPrimaryItems >= 4 || totalBullets >= 8) {
    volumeClassification = "BALANCED";
    volumeDescription = "Balanced content volume (typically 1–2 pages depending on font size and line spacing).";
  }

  findings.push({
    id: "fmt-volume-overview",
    category: CATEGORIES.FORMATTING,
    severity: SEVERITY.SUCCESS,
    code: "CONTENT_VOLUME_ESTIMATE",
    title: "Content Volume Assessment",
    message: `${volumeDescription} Total entries: ${totalPrimaryItems}, total bullet points: ${totalBullets}, total skills: ${skills.length}.`,
    evidence: `${totalPrimaryItems} entries, ${totalBullets} bullets, ${skills.length} skills`,
    recommendation: null,
  });

  let status = STATUS.GOOD;
  if (!isValidFontSize || !isValidLineSpacing || !isValidColor) {
    status = STATUS.NEEDS_ATTENTION;
  }

  return {
    status,
    styling: {
      fontSize,
      lineSpacing,
      primaryColor,
      isValidFontSize,
      isValidLineSpacing,
      isValidColor,
    },
    volume: {
      classification: volumeClassification,
      description: volumeDescription,
      totalEntries: totalPrimaryItems,
      totalBullets,
      totalSkills: skills.length,
    },
    findings,
  };
};

module.exports = {
  analyzeFormatting,
};
