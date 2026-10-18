/**
 * JobPortal 2.0 — Work Experience & Bullet Quality Analyzer
 * Evaluates roles, company presence, dates, and bullet point quality signals (action verbs, metrics, length).
 */

const {
  STATUS,
  SEVERITY,
  CATEGORIES,
  ACTION_VERBS,
  MEASURABLE_TOKEN_REGEX,
} = require("./analyzerConstants");

const analyzeExperience = (content = {}) => {
  const experiences = Array.isArray(content.experience) ? content.experience : [];
  const findings = [];

  if (experiences.length === 0) {
    findings.push({
      id: "exp-missing",
      category: CATEGORIES.EXPERIENCE,
      severity: SEVERITY.INFO,
      code: "EXPERIENCE_MISSING",
      title: "No Work Experience Recorded",
      message: "Adding work experience, internships, or freelance roles helps recruiters understand your background.",
      evidence: "0 experience entries detected",
      recommendation: "Add your previous or current employment history in the Experience section.",
    });

    return {
      status: STATUS.MISSING,
      totalEntries: 0,
      totalBullets: 0,
      bulletsWithActionVerbs: 0,
      bulletsWithMetrics: 0,
      findings,
    };
  }

  let totalBullets = 0;
  let bulletsWithActionVerbs = 0;
  let bulletsWithMetrics = 0;
  let shortBulletsCount = 0;
  let longBulletsCount = 0;
  let entriesWithoutBullets = 0;
  let entriesWithMissingMeta = 0;

  experiences.forEach((exp, idx) => {
    const entryNum = idx + 1;
    const company = (exp.company || "").trim();
    const role = (exp.role || "").trim();
    const startDate = (exp.startDate || "").trim();
    const endDate = (exp.endDate || "").trim();
    const isCurrent = Boolean(exp.isCurrent);
    const bullets = Array.isArray(exp.bulletPoints) ? exp.bulletPoints : [];

    // Check missing metadata
    const missingFields = [];
    if (!company) missingFields.push("company");
    if (!role) missingFields.push("job title/role");
    if (!startDate) missingFields.push("start date");
    if (!isCurrent && !endDate) missingFields.push("end date");

    if (missingFields.length > 0) {
      entriesWithMissingMeta++;
      findings.push({
        id: `exp-meta-missing-${entryNum}`,
        category: CATEGORIES.EXPERIENCE,
        severity: SEVERITY.WARNING,
        code: "EXPERIENCE_INCOMPLETE_METADATA",
        title: `Incomplete Information in Role #${entryNum}`,
        message: `Role #${entryNum} (${role || "Untitled"} at ${company || "Unspecified"}) is missing: ${missingFields.join(", ")}.`,
        evidence: `Missing: ${missingFields.join(", ")}`,
        recommendation: `Provide the ${missingFields.join(" and ")} for this position.`,
      });
    }

    // Check bullet points presence
    if (bullets.length === 0) {
      entriesWithoutBullets++;
      findings.push({
        id: `exp-no-bullets-${entryNum}`,
        category: CATEGORIES.EXPERIENCE,
        severity: SEVERITY.WARNING,
        code: "EXPERIENCE_NO_BULLETS",
        title: `No Bullet Points in Role #${entryNum}`,
        message: `Role #${entryNum} (${role || "Role"} at ${company || "Company"}) has no bullet points describing your accomplishments.`,
        evidence: "bulletPoints array is empty",
        recommendation: "Add 2–5 bullet points starting with strong action verbs detailing key results.",
      });
    } else {
      totalBullets += bullets.length;

      bullets.forEach((bullet) => {
        const trimmed = (bullet || "").trim();
        if (trimmed.length === 0) return;

        // Length Signals
        if (trimmed.length < 25) {
          shortBulletsCount++;
        } else if (trimmed.length > 350) {
          longBulletsCount++;
        }

        // Action Verb Signal
        const firstWords = trimmed.split(/\s+/).map((w) => w.replace(/[^a-zA-Z]/g, "").toLowerCase());
        const hasActionVerb = firstWords.length > 0 && (
          ACTION_VERBS.has(firstWords[0]) || (firstWords.length > 1 && ACTION_VERBS.has(firstWords[1]))
        );
        if (hasActionVerb) {
          bulletsWithActionVerbs++;
        }

        // Measurable Token Signal
        if (MEASURABLE_TOKEN_REGEX.test(trimmed)) {
          bulletsWithMetrics++;
        }
      });
    }
  });

  // Aggregate Findings & Signals
  findings.push({
    id: "exp-summary-signal",
    category: CATEGORIES.EXPERIENCE,
    severity: SEVERITY.SUCCESS,
    code: "EXPERIENCE_ENTRIES_RECORDED",
    title: "Experience Entries Recorded",
    message: `Your resume contains ${experiences.length} ${experiences.length === 1 ? "role" : "roles"} and ${totalBullets} total ${totalBullets === 1 ? "bullet point" : "bullet points"}.`,
    evidence: `${experiences.length} roles, ${totalBullets} bullets`,
    recommendation: null,
  });

  if (bulletsWithActionVerbs > 0) {
    findings.push({
      id: "exp-action-verbs-signal",
      category: CATEGORIES.EXPERIENCE,
      severity: SEVERITY.SUCCESS,
      code: "ACTION_VERBS_DETECTED",
      title: "Action Verbs Detected",
      message: `${bulletsWithActionVerbs} of ${totalBullets} bullet points begin with identified action verbs (e.g. engineered, led, optimized).`,
      evidence: `${bulletsWithActionVerbs}/${totalBullets} action verbs`,
      recommendation: null,
    });
  } else if (totalBullets > 0) {
    findings.push({
      id: "exp-no-action-verbs-signal",
      category: CATEGORIES.EXPERIENCE,
      severity: SEVERITY.INFO,
      code: "ACTION_VERBS_LOW",
      title: "Few Action Verbs Detected",
      message: "Few bullet points start with recognized active verbs. Starting bullets with action verbs creates clearer role accountability.",
      evidence: `${bulletsWithActionVerbs}/${totalBullets} action verbs`,
      recommendation: "Begin bullet points with verbs like 'Spearheaded', 'Engineered', 'Optimized', or 'Delivered'.",
    });
  }

  if (bulletsWithMetrics > 0) {
    findings.push({
      id: "exp-metrics-signal",
      category: CATEGORIES.EXPERIENCE,
      severity: SEVERITY.SUCCESS,
      code: "MEASURABLE_METRICS_DETECTED",
      title: "Measurable Outcomes Detected",
      message: `${bulletsWithMetrics} of ${totalBullets} bullet points contain quantifiable numbers, percentages, or metrics.`,
      evidence: `${bulletsWithMetrics}/${totalBullets} bullets with metrics`,
      recommendation: null,
    });
  } else if (totalBullets > 0) {
    findings.push({
      id: "exp-no-metrics-signal",
      category: CATEGORIES.EXPERIENCE,
      severity: SEVERITY.INFO,
      code: "MEASURABLE_METRICS_RECOMMENDED",
      title: "Consider Adding Quantifiable Outcomes",
      message: "No numeric or quantifiable metrics were detected in your bullet points.",
      evidence: "0 measurable tokens detected",
      recommendation: "Include quantifiable achievements where available (e.g. 'reduced latency by 35%', 'managed team of 6').",
    });
  }

  if (shortBulletsCount > 0) {
    findings.push({
      id: "exp-short-bullets",
      category: CATEGORIES.EXPERIENCE,
      severity: SEVERITY.INFO,
      code: "BULLETS_TOO_SHORT",
      title: "Short Bullet Points",
      message: `${shortBulletsCount} bullet points are under 25 characters and may benefit from more context on the impact or tools used.`,
      evidence: `${shortBulletsCount} short bullets (< 25 chars)`,
      recommendation: "Provide more details on what was accomplished and the tools involved.",
    });
  }

  if (longBulletsCount > 0) {
    findings.push({
      id: "exp-long-bullets",
      category: CATEGORIES.EXPERIENCE,
      severity: SEVERITY.INFO,
      code: "BULLETS_TOO_LONG",
      title: "Dense Bullet Points",
      message: `${longBulletsCount} bullet points exceed 350 characters and could be split into two concise points for easier scanning.`,
      evidence: `${longBulletsCount} long bullets (> 350 chars)`,
      recommendation: "Split overly long bullet points into two distinct sentences.",
    });
  }

  // Determine Experience Status
  let status = STATUS.GOOD;
  if (entriesWithMissingMeta > 0 || entriesWithoutBullets > 0) {
    status = STATUS.NEEDS_ATTENTION;
  }

  return {
    status,
    totalEntries: experiences.length,
    totalBullets,
    bulletsWithActionVerbs,
    bulletsWithMetrics,
    shortBulletsCount,
    longBulletsCount,
    entriesWithoutBullets,
    entriesWithMissingMeta,
    findings,
  };
};

module.exports = {
  analyzeExperience,
};
