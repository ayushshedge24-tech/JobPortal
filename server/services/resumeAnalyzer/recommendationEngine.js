/**
 * JobPortal 2.0 — Actionable Recommendation Engine
 * Generates prioritized, deterministic improvements mapped 1-to-1 to real detected findings.
 */

const { SEVERITY } = require("./analyzerConstants");

const generateRecommendations = (findings = []) => {
  const recommendations = [];
  const seenCodes = new Set();

  findings.forEach((finding) => {
    if (!finding.recommendation) return;

    // Avoid duplicate recommendation suggestions with the same code
    const uniqueKey = `${finding.category}-${finding.code}`;
    if (seenCodes.has(uniqueKey)) return;
    seenCodes.add(uniqueKey);

    let priority = "LOW";
    if (finding.severity === SEVERITY.ERROR) {
      priority = "HIGH";
    } else if (finding.severity === SEVERITY.WARNING) {
      priority = "MEDIUM";
    }

    recommendations.push({
      id: `rec-${finding.id}`,
      category: finding.category,
      priority,
      title: finding.title,
      message: finding.message,
      action: finding.recommendation,
      relatedFindingCode: finding.code,
    });
  });

  // Sort: HIGH first, then MEDIUM, then LOW
  const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  recommendations.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  return recommendations;
};

module.exports = {
  generateRecommendations,
};
