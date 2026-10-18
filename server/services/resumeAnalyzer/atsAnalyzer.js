/**
 * JobPortal 2.0 — ATS Structural Analyzer
 * Evaluates structural parser readiness, standard section identifiers, contact readability,
 * and visibility configuration without fabricating arbitrary scores or pretending to be an AI.
 */

const { STATUS, SEVERITY, CATEGORIES } = require("./analyzerConstants");
const { CANONICAL_SECTION_IDS } = require("../../models/Resume");

const analyzeAtsStructure = (content = {}) => {
  const personal = content.personal || {};
  const sectionVisibility = content.sectionVisibility || {};
  const sectionOrder = Array.isArray(content.sectionOrder) ? content.sectionOrder : CANONICAL_SECTION_IDS;
  const customSections = Array.isArray(content.customSections) ? content.customSections : [];
  const findings = [];

  const checks = {
    standardSectionsUsed: true,
    contactInfoReadable: false,
    experienceVisible: sectionVisibility.EXPERIENCE !== false,
    skillsVisible: sectionVisibility.SKILLS !== false,
    educationVisible: sectionVisibility.EDUCATION !== false,
    customSectionComplexitySafe: customSections.length <= 3,
  };

  // 1. Standard Section Order & Identifiers Check
  const unknownSections = sectionOrder.filter((id) => !CANONICAL_SECTION_IDS.includes(id));
  if (unknownSections.length > 0) {
    checks.standardSectionsUsed = false;
    findings.push({
      id: "ats-unknown-sections",
      category: CATEGORIES.ATS_STRUCTURE,
      severity: SEVERITY.WARNING,
      code: "NON_STANDARD_SECTION_ID",
      title: "Non-Standard Section Identifiers",
      message: `The resume uses non-canonical section identifiers: ${unknownSections.join(", ")}. Standard section headings ensure automated resume parsers map your data correctly.`,
      evidence: `Non-standard IDs: ${unknownSections.join(", ")}`,
      recommendation: "Use standard canonical sections for primary career headings.",
    });
  } else {
    findings.push({
      id: "ats-standard-headings",
      category: CATEGORIES.ATS_STRUCTURE,
      severity: SEVERITY.SUCCESS,
      code: "STANDARD_HEADINGS_VERIFIED",
      title: "Standard Section Headings Verified",
      message: "All section identifiers follow standard industry naming conventions recognized by applicant tracking systems.",
      evidence: "100% canonical sectionOrder",
      recommendation: null,
    });
  }

  // 2. Contact Information Parseability
  const hasFullName = Boolean(personal.fullName && personal.fullName.trim().length > 0);
  const hasEmail = Boolean(personal.email && personal.email.trim().length > 0);
  const hasPhone = Boolean(personal.phone && personal.phone.trim().length > 0);
  checks.contactInfoReadable = hasFullName && hasEmail;

  if (checks.contactInfoReadable) {
    findings.push({
      id: "ats-contact-parseable",
      category: CATEGORIES.ATS_STRUCTURE,
      severity: SEVERITY.SUCCESS,
      code: "CONTACT_STRUCTURE_CLEAR",
      title: "Contact Structure Clear",
      message: "Candidate name and primary contact endpoints are clearly defined in dedicated metadata fields.",
      evidence: "Full name and email present in structured headers",
      recommendation: null,
    });
  } else {
    findings.push({
      id: "ats-contact-incomplete",
      category: CATEGORIES.ATS_STRUCTURE,
      severity: SEVERITY.ERROR,
      code: "CONTACT_STRUCTURE_INCOMPLETE",
      title: "Essential Contact Details Missing",
      message: "Parsers require a clear candidate name and email to create candidate records in applicant databases.",
      evidence: `Name: ${hasFullName ? "Yes" : "No"}, Email: ${hasEmail ? "Yes" : "No"}`,
      recommendation: "Ensure your full name and email are populated in the Personal section.",
    });
  }

  // 3. Hidden Section Warnings
  if (!checks.experienceVisible && Array.isArray(content.experience) && content.experience.length > 0) {
    findings.push({
      id: "ats-experience-hidden",
      category: CATEGORIES.ATS_STRUCTURE,
      severity: SEVERITY.WARNING,
      code: "CRITICAL_SECTION_HIDDEN",
      title: "Work Experience Section is Hidden",
      message: "The Work Experience section is configured as hidden (`sectionVisibility: false`). It will not be parsed or exported into your PDF.",
      evidence: "sectionVisibility.EXPERIENCE = false",
      recommendation: "Enable the Work Experience section visibility unless you deliberately wish to omit employment history.",
    });
  }

  if (!checks.skillsVisible && Array.isArray(content.skills) && content.skills.length > 0) {
    findings.push({
      id: "ats-skills-hidden",
      category: CATEGORIES.ATS_STRUCTURE,
      severity: SEVERITY.WARNING,
      code: "CRITICAL_SECTION_HIDDEN",
      title: "Skills Section is Hidden",
      message: "The Skills section is marked as hidden. Keyword matchers will not detect skills from this section.",
      evidence: "sectionVisibility.SKILLS = false",
      recommendation: "Enable the Skills section visibility in Section Order settings.",
    });
  }

  // 4. Custom Section Complexity
  if (!checks.customSectionComplexitySafe) {
    findings.push({
      id: "ats-custom-sections-dense",
      category: CATEGORIES.ATS_STRUCTURE,
      severity: SEVERITY.INFO,
      code: "CUSTOM_SECTIONS_DENSE",
      title: "High Number of Custom Sections",
      message: `You have ${customSections.length} custom sections. Standard ATS systems prioritize standard sections (Experience, Education, Skills) over custom blocks.`,
      evidence: `${customSections.length} custom sections detected (> 3)`,
      recommendation: "Consolidate custom items into standard sections where appropriate.",
    });
  }

  // Determine ATS Structure Status
  let status = STATUS.GOOD;
  if (!checks.contactInfoReadable || !checks.standardSectionsUsed) {
    status = STATUS.NEEDS_ATTENTION;
  }

  return {
    status,
    checks,
    findings,
  };
};

module.exports = {
  analyzeAtsStructure,
};
