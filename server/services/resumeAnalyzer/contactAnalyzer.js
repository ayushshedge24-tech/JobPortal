/**
 * JobPortal 2.0 — Contact Information Analyzer
 * Evaluates candidate contact details, format validity, and social link presence.
 */

const { STATUS, SEVERITY, CATEGORIES } = require("./analyzerConstants");
const { isSafeUrl } = require("../../models/Resume");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const analyzeContact = (content = {}) => {
  const personal = content.personal || {};
  const findings = [];

  const fullName = (personal.fullName || "").trim();
  const email = (personal.email || "").trim();
  const phone = (personal.phone || "").trim();
  const city = (personal.city || "").trim();
  const state = (personal.state || "").trim();
  const country = (personal.country || "").trim();
  const linkedin = (personal.linkedin || "").trim();
  const github = (personal.github || "").trim();
  const portfolio = (personal.portfolio || "").trim();
  const website = (personal.website || "").trim();

  const checks = {
    hasName: fullName.length >= 2,
    hasEmail: email.length > 0,
    hasValidEmail: EMAIL_REGEX.test(email),
    hasPhone: phone.length >= 7,
    hasLocation: city.length > 0 || state.length > 0,
    hasLinkedIn: linkedin.length > 0,
    hasGitHub: github.length > 0,
    hasPortfolio: portfolio.length > 0 || website.length > 0,
  };

  // Full Name Check
  if (!checks.hasName) {
    findings.push({
      id: "contact-missing-name",
      category: CATEGORIES.CONTACT,
      severity: SEVERITY.ERROR,
      code: "FULLNAME_REQUIRED",
      title: "Full Name Missing",
      message: "A valid full name is required on every professional resume.",
      evidence: fullName.length === 0 ? "Name field is empty" : `Name '${fullName}' is too short`,
      recommendation: "Provide your complete first and last name in the Personal section.",
    });
  }

  // Email Check
  if (!checks.hasEmail) {
    findings.push({
      id: "contact-missing-email",
      category: CATEGORIES.CONTACT,
      severity: SEVERITY.ERROR,
      code: "EMAIL_REQUIRED",
      title: "Email Address Missing",
      message: "Recruiters cannot contact you without an email address.",
      evidence: "Email field is empty",
      recommendation: "Add an active professional email address.",
    });
  } else if (!checks.hasValidEmail) {
    findings.push({
      id: "contact-invalid-email",
      category: CATEGORIES.CONTACT,
      severity: SEVERITY.WARNING,
      code: "EMAIL_FORMAT_INVALID",
      title: "Email Format Invalid",
      message: "The email address does not appear to follow standard email formatting.",
      evidence: "Email format validation failed",
      recommendation: "Verify that your email address is spelled correctly (e.g. name@domain.com).",
    });
  }

  // Phone Check
  if (!checks.hasPhone) {
    findings.push({
      id: "contact-missing-phone",
      category: CATEGORIES.CONTACT,
      severity: SEVERITY.WARNING,
      code: "PHONE_RECOMMENDED",
      title: "Phone Number Missing",
      message: "Adding a phone number enables recruiters to reach you for urgent interview coordination.",
      evidence: "Phone field is empty or under 7 characters",
      recommendation: "Add a phone number with country code (e.g. +91 98765 43210).",
    });
  }

  // Location Check
  if (!checks.hasLocation) {
    findings.push({
      id: "contact-missing-location",
      category: CATEGORIES.CONTACT,
      severity: SEVERITY.INFO,
      code: "LOCATION_RECOMMENDED",
      title: "Location Not Specified",
      message: "Specifying your city and country helps employers identify your time zone and local/remote eligibility.",
      evidence: "City and State fields are empty",
      recommendation: "Add your current city (e.g. Bengaluru, Pune, Mumbai) and country.",
    });
  }

  // Social Links Safety Checks
  const linkFields = [
    { key: "LinkedIn", val: linkedin },
    { key: "GitHub", val: github },
    { key: "Portfolio", val: portfolio },
    { key: "Website", val: website },
  ];

  linkFields.forEach(({ key, val }) => {
    if (val && !isSafeUrl(val)) {
      findings.push({
        id: `contact-unsafe-url-${key.toLowerCase()}`,
        category: CATEGORIES.CONTACT,
        severity: SEVERITY.ERROR,
        code: "UNSAFE_URL_DETECTED",
        title: `Unsafe ${key} Link`,
        message: `The ${key} URL uses an unsupported or potentially unsafe protocol.`,
        evidence: `Disallowed protocol scheme in ${key} link`,
        recommendation: `Use standard https:// URLs for your ${key} profile link.`,
      });
    }
  });

  // Social Links Presence Signals
  if (checks.hasLinkedIn) {
    findings.push({
      id: "contact-has-linkedin",
      category: CATEGORIES.CONTACT,
      severity: SEVERITY.SUCCESS,
      code: "LINKEDIN_PRESENT",
      title: "LinkedIn Profile Present",
      message: "Your resume includes a LinkedIn profile link.",
      evidence: "Valid LinkedIn link detected",
      recommendation: null,
    });
  }

  if (checks.hasGitHub) {
    findings.push({
      id: "contact-has-github",
      category: CATEGORIES.CONTACT,
      severity: SEVERITY.SUCCESS,
      code: "GITHUB_PRESENT",
      title: "GitHub Profile Present",
      message: "Your resume includes a GitHub link for code portfolio review.",
      evidence: "Valid GitHub link detected",
      recommendation: null,
    });
  }

  // Determine Overall Contact Status
  let status = STATUS.GOOD;
  if (!checks.hasName && !checks.hasEmail && !checks.hasPhone) {
    status = STATUS.MISSING;
  } else if (!checks.hasName || !checks.hasEmail || !checks.hasValidEmail || !checks.hasPhone) {
    status = STATUS.NEEDS_ATTENTION;
  }

  return {
    status,
    checks,
    data: {
      hasFullName: checks.hasName,
      hasEmail: checks.hasEmail,
      hasPhone: checks.hasPhone,
      hasLocation: checks.hasLocation,
      socialCount: (checks.hasLinkedIn ? 1 : 0) + (checks.hasGitHub ? 1 : 0) + (checks.hasPortfolio ? 1 : 0),
    },
    findings,
  };
};

module.exports = {
  analyzeContact,
};
