/**
 * JobPortal 2.0 — Professional Summary Analyzer
 * Deterministically evaluates summary presence, character/word density, length bounds, and structure.
 */

const { STATUS, SEVERITY, CATEGORIES } = require("./analyzerConstants");

const GENERIC_SUMMARY_PATTERNS = [
  /lorem\s+ipsum/i,
  /insert\s+(?:your\s+)?summary/i,
  /your\s+summary\s+goes\s+here/i,
  /looking\s+for\s+a\s+challenging\s+(?:role|position)\s+in\s+a\s+(?:growth|reputed)/i,
  /seeking\s+an\s+entry\s+level\s+position/i,
  /hardworking\s+(?:individual|person)\s+with\s+good\s+communication/i,
];

const analyzeSummary = (content = {}) => {
  const rawSummary = (content.summary || "").trim();
  const findings = [];

  const charCount = rawSummary.length;
  const wordCount = rawSummary.length > 0 ? rawSummary.split(/\s+/).filter(Boolean).length : 0;

  let status = STATUS.GOOD;

  if (charCount === 0) {
    status = STATUS.MISSING;
    findings.push({
      id: "summary-missing",
      category: CATEGORIES.SUMMARY,
      severity: SEVERITY.INFO,
      code: "SUMMARY_MISSING",
      title: "Professional Summary Not Added",
      message: "Adding a 2–4 sentence summary highlights your years of experience, core tech stack, and notable career achievements.",
      evidence: "Summary length is 0 characters",
      recommendation: "Add a concise summary in the Summary section to introduce your professional background.",
    });
  } else if (charCount < 60) {
    status = STATUS.NEEDS_ATTENTION;
    findings.push({
      id: "summary-too-short",
      category: CATEGORIES.SUMMARY,
      severity: SEVERITY.WARNING,
      code: "SUMMARY_TOO_SHORT",
      title: "Summary is Very Brief",
      message: `Your summary contains only ${charCount} characters (${wordCount} words). A more comprehensive summary provides better context for hiring managers.`,
      evidence: `Summary contains ${charCount} characters`,
      recommendation: "Expand your summary to 150–500 characters highlighting your key specializations.",
    });
  } else if (charCount > 1200) {
    status = STATUS.NEEDS_ATTENTION;
    findings.push({
      id: "summary-too-long",
      category: CATEGORIES.SUMMARY,
      severity: SEVERITY.WARNING,
      code: "SUMMARY_TOO_LONG",
      title: "Summary is Exceptionally Long",
      message: `Your summary contains ${charCount} characters (${wordCount} words). Overly lengthy summaries can crowd out experience entries.`,
      evidence: `Summary contains ${charCount} characters (> 1200 chars)`,
      recommendation: "Condense your summary to under 800 characters to keep your resume concise.",
    });
  } else {
    findings.push({
      id: "summary-balanced",
      category: CATEGORIES.SUMMARY,
      severity: SEVERITY.SUCCESS,
      code: "SUMMARY_BALANCED_LENGTH",
      title: "Well-Sized Summary",
      message: `Your summary contains ${charCount} characters (${wordCount} words), fitting cleanly into standard resume layouts.`,
      evidence: `Summary contains ${charCount} characters`,
      recommendation: null,
    });
  }

  // Generic Placeholder Check
  if (charCount > 0) {
    const isGeneric = GENERIC_SUMMARY_PATTERNS.some((pattern) => pattern.test(rawSummary));
    if (isGeneric) {
      findings.push({
        id: "summary-generic-phrases",
        category: CATEGORIES.SUMMARY,
        severity: SEVERITY.WARNING,
        code: "SUMMARY_GENERIC_DETECTED",
        title: "Generic Phrasing Detected in Summary",
        message: "Your summary contains generic objective phrases or placeholder text.",
        evidence: "Matched generic introductory pattern",
        recommendation: "Replace generic career objective phrases with specific technical skills, domain achievements, and experience metrics.",
      });
      if (status === STATUS.GOOD) {
        status = STATUS.NEEDS_ATTENTION;
      }
    }
  }

  return {
    status,
    charCount,
    wordCount,
    findings,
  };
};

module.exports = {
  analyzeSummary,
};
