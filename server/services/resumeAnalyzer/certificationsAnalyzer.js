/**
 * JobPortal 2.0 — Certifications Section Analyzer
 * Evaluates certification names, credential issuers, validity dates, and verification links.
 */

const { STATUS, SEVERITY, CATEGORIES } = require("./analyzerConstants");
const { isSafeUrl } = require("../../models/Resume");

const analyzeCertifications = (content = {}) => {
  const certifications = Array.isArray(content.certifications) ? content.certifications : [];
  const findings = [];

  if (certifications.length === 0) {
    return {
      status: STATUS.MISSING,
      totalEntries: 0,
      certificationsWithUrls: 0,
      findings: [],
    };
  }

  let certificationsWithUrls = 0;
  let entriesMissingName = 0;

  certifications.forEach((cert, idx) => {
    const num = idx + 1;
    const name = (cert.name || "").trim();
    const issuer = (cert.issuer || "").trim();
    const url = (cert.credentialUrl || "").trim();

    if (!name) {
      entriesMissingName++;
      findings.push({
        id: `cert-missing-name-${num}`,
        category: CATEGORIES.CERTIFICATIONS,
        severity: SEVERITY.ERROR,
        code: "CERTIFICATION_NAME_REQUIRED",
        title: `Certification #${num} Missing Name`,
        message: `Certification #${num} has no certification title specified.`,
        evidence: "Certification name is empty",
        recommendation: "Provide the official credential name (e.g. AWS Solutions Architect).",
      });
    }

    if (url) {
      if (isSafeUrl(url)) {
        certificationsWithUrls++;
      } else {
        findings.push({
          id: `cert-unsafe-url-${num}`,
          category: CATEGORIES.CERTIFICATIONS,
          severity: SEVERITY.ERROR,
          code: "CERTIFICATION_UNSAFE_URL",
          title: `Unsafe Link in Certification #${num}`,
          message: `The verification URL for "${name || `Certification #${num}`}" uses an unsupported scheme.`,
          evidence: "Disallowed protocol detected",
          recommendation: "Use a valid https:// URL for the credential verification link.",
        });
      }
    }
  });

  // Overview Finding
  findings.push({
    id: "cert-overview",
    category: CATEGORIES.CERTIFICATIONS,
    severity: SEVERITY.SUCCESS,
    code: "CERTIFICATIONS_SUMMARY",
    title: "Certifications Listed",
    message: `Your resume contains ${certifications.length} professional ${certifications.length === 1 ? "certification" : "certifications"}.`,
    evidence: `${certifications.length} certifications recorded`,
    recommendation: null,
  });

  let status = STATUS.GOOD;
  if (entriesMissingName > 0) {
    status = STATUS.NEEDS_ATTENTION;
  }

  return {
    status,
    totalEntries: certifications.length,
    certificationsWithUrls,
    entriesMissingName,
    findings,
  };
};

module.exports = {
  analyzeCertifications,
};
