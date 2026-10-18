/**
 * JobPortal 2.0 — Resume Completeness Analyzer
 * Evaluates the presence and completeness of all required, recommended, and optional resume components.
 */

const {
  SECTION_COMPLETENESS,
  IMPORTANCE,
  SEVERITY,
  CATEGORIES,
} = require("./analyzerConstants");

const analyzeCompleteness = (content = {}) => {
  const personal = content.personal || {};
  const experiences = Array.isArray(content.experience) ? content.experience : [];
  const educations = Array.isArray(content.education) ? content.education : [];
  const skills = Array.isArray(content.skills) ? content.skills : [];
  const projects = Array.isArray(content.projects) ? content.projects : [];
  const certifications = Array.isArray(content.certifications) ? content.certifications : [];
  const achievements = Array.isArray(content.achievements) ? content.achievements : [];
  const languages = Array.isArray(content.languages) ? content.languages : [];
  const summary = (content.summary || "").trim();

  const sections = {};
  const findings = [];

  // 1. Personal Info (Full Name) - REQUIRED
  const hasFullName = Boolean(personal.fullName && personal.fullName.trim().length > 0);
  sections.personal = {
    id: "personal",
    name: "Full Name",
    importance: IMPORTANCE.REQUIRED,
    status: hasFullName ? SECTION_COMPLETENESS.PRESENT : SECTION_COMPLETENESS.MISSING,
    details: hasFullName ? personal.fullName.trim() : "Full name is missing",
  };
  if (!hasFullName) {
    findings.push({
      id: "compl-missing-fullname",
      category: CATEGORIES.CONTACT,
      severity: SEVERITY.ERROR,
      code: "FULLNAME_MISSING",
      title: "Full Name Missing",
      message: "Your resume does not contain a full name.",
      evidence: "personal.fullName is empty",
      recommendation: "Add your full name to the personal information section.",
    });
  }

  // 2. Headline - RECOMMENDED
  const hasHeadline = Boolean(personal.headline && personal.headline.trim().length > 0);
  sections.headline = {
    id: "headline",
    name: "Professional Headline",
    importance: IMPORTANCE.RECOMMENDED,
    status: hasHeadline ? SECTION_COMPLETENESS.PRESENT : SECTION_COMPLETENESS.MISSING,
    details: hasHeadline ? personal.headline.trim() : "Headline is not set",
  };
  if (!hasHeadline) {
    findings.push({
      id: "compl-missing-headline",
      category: CATEGORIES.CONTACT,
      severity: SEVERITY.INFO,
      code: "HEADLINE_MISSING",
      title: "Professional Headline Not Set",
      message: "A professional headline (e.g. 'Senior Full Stack Engineer') provides immediate role clarity.",
      evidence: "personal.headline is empty",
      recommendation: "Add a concise target role title or professional headline.",
    });
  }

  // 3. Contact Info (Email, Phone, City/State) - REQUIRED
  const hasEmail = Boolean(personal.email && personal.email.trim().length > 0);
  const hasPhone = Boolean(personal.phone && personal.phone.trim().length > 0);
  const hasLocation = Boolean(personal.city && personal.city.trim().length > 0);
  const contactScore = (hasEmail ? 1 : 0) + (hasPhone ? 1 : 0) + (hasLocation ? 1 : 0);
  
  let contactStatus = SECTION_COMPLETENESS.MISSING;
  if (contactScore === 3) contactStatus = SECTION_COMPLETENESS.PRESENT;
  else if (contactScore > 0) contactStatus = SECTION_COMPLETENESS.PARTIAL;

  sections.contact = {
    id: "contact",
    name: "Contact Information",
    importance: IMPORTANCE.REQUIRED,
    status: contactStatus,
    details: `Email: ${hasEmail ? "Present" : "Missing"}, Phone: ${hasPhone ? "Present" : "Missing"}, Location: ${hasLocation ? "Present" : "Missing"}`,
  };
  if (contactStatus === SECTION_COMPLETENESS.MISSING) {
    findings.push({
      id: "compl-missing-contact",
      category: CATEGORIES.CONTACT,
      severity: SEVERITY.ERROR,
      code: "CONTACT_INFO_MISSING",
      title: "Contact Information Missing",
      message: "No email, phone number, or location found on your resume.",
      evidence: "Email, Phone, and City are all empty",
      recommendation: "Add an active email, phone number, and location for recruiter outreach.",
    });
  } else if (contactStatus === SECTION_COMPLETENESS.PARTIAL) {
    const missingParts = [];
    if (!hasEmail) missingParts.push("email");
    if (!hasPhone) missingParts.push("phone number");
    if (!hasLocation) missingParts.push("city/location");
    findings.push({
      id: "compl-partial-contact",
      category: CATEGORIES.CONTACT,
      severity: SEVERITY.WARNING,
      code: "CONTACT_INFO_INCOMPLETE",
      title: "Contact Information Incomplete",
      message: `Your contact info is missing: ${missingParts.join(", ")}.`,
      evidence: `Missing: ${missingParts.join(", ")}`,
      recommendation: `Add your ${missingParts.join(" and ")} to ensure employers can reach you.`,
    });
  }

  // 4. Summary - RECOMMENDED
  const hasSummary = summary.length > 0;
  sections.summary = {
    id: "summary",
    name: "Professional Summary",
    importance: IMPORTANCE.RECOMMENDED,
    status: hasSummary ? SECTION_COMPLETENESS.PRESENT : SECTION_COMPLETENESS.MISSING,
    details: hasSummary ? `${summary.length} characters` : "Summary is missing",
  };

  // 5. Experience - RECOMMENDED
  const hasExperience = experiences.length > 0;
  sections.experience = {
    id: "experience",
    name: "Work Experience",
    importance: IMPORTANCE.RECOMMENDED,
    status: hasExperience ? SECTION_COMPLETENESS.PRESENT : SECTION_COMPLETENESS.MISSING,
    details: `${experiences.length} experience entries recorded`,
  };

  // 6. Education - RECOMMENDED
  const hasEducation = educations.length > 0;
  sections.education = {
    id: "education",
    name: "Education",
    importance: IMPORTANCE.RECOMMENDED,
    status: hasEducation ? SECTION_COMPLETENESS.PRESENT : SECTION_COMPLETENESS.MISSING,
    details: `${educations.length} education entries recorded`,
  };

  // 7. Skills - RECOMMENDED
  const hasSkills = skills.length > 0;
  sections.skills = {
    id: "skills",
    name: "Skills",
    importance: IMPORTANCE.RECOMMENDED,
    status: hasSkills ? SECTION_COMPLETENESS.PRESENT : SECTION_COMPLETENESS.MISSING,
    details: `${skills.length} skills listed`,
  };

  // 8. Projects - RECOMMENDED
  const hasProjects = projects.length > 0;
  sections.projects = {
    id: "projects",
    name: "Featured Projects",
    importance: IMPORTANCE.RECOMMENDED,
    status: hasProjects ? SECTION_COMPLETENESS.PRESENT : SECTION_COMPLETENESS.MISSING,
    details: `${projects.length} projects recorded`,
  };

  // 9. Certifications - OPTIONAL
  const hasCertifications = certifications.length > 0;
  sections.certifications = {
    id: "certifications",
    name: "Certifications",
    importance: IMPORTANCE.OPTIONAL,
    status: hasCertifications ? SECTION_COMPLETENESS.PRESENT : SECTION_COMPLETENESS.MISSING,
    details: `${certifications.length} certifications recorded`,
  };

  // 10. Achievements - OPTIONAL
  const hasAchievements = achievements.length > 0;
  sections.achievements = {
    id: "achievements",
    name: "Achievements & Honors",
    importance: IMPORTANCE.OPTIONAL,
    status: hasAchievements ? SECTION_COMPLETENESS.PRESENT : SECTION_COMPLETENESS.MISSING,
    details: `${achievements.length} achievements recorded`,
  };

  // 11. Languages - OPTIONAL
  const hasLanguages = languages.length > 0;
  sections.languages = {
    id: "languages",
    name: "Languages",
    importance: IMPORTANCE.OPTIONAL,
    status: hasLanguages ? SECTION_COMPLETENESS.PRESENT : SECTION_COMPLETENESS.MISSING,
    details: `${languages.length} languages recorded`,
  };

  // 12. Social Links - RECOMMENDED
  const hasLinkedIn = Boolean(personal.linkedin && personal.linkedin.trim().length > 0);
  const hasGitHub = Boolean(personal.github && personal.github.trim().length > 0);
  const hasPortfolio = Boolean(personal.portfolio && personal.portfolio.trim().length > 0);
  const socialLinksCount = (hasLinkedIn ? 1 : 0) + (hasGitHub ? 1 : 0) + (hasPortfolio ? 1 : 0);

  let socialStatus = SECTION_COMPLETENESS.MISSING;
  if (socialLinksCount >= 2) socialStatus = SECTION_COMPLETENESS.PRESENT;
  else if (socialLinksCount === 1) socialStatus = SECTION_COMPLETENESS.PARTIAL;

  sections.socialLinks = {
    id: "socialLinks",
    name: "Professional & Social Links",
    importance: IMPORTANCE.RECOMMENDED,
    status: socialStatus,
    details: `LinkedIn: ${hasLinkedIn ? "Yes" : "No"}, GitHub: ${hasGitHub ? "Yes" : "No"}, Portfolio: ${hasPortfolio ? "Yes" : "No"}`,
  };

  // Compute Summary Metrics
  const sectionList = Object.values(sections);
  const totalTracked = sectionList.length;
  const presentCount = sectionList.filter((s) => s.status === SECTION_COMPLETENESS.PRESENT).length;
  const partialCount = sectionList.filter((s) => s.status === SECTION_COMPLETENESS.PARTIAL).length;
  const missingCount = sectionList.filter((s) => s.status === SECTION_COMPLETENESS.MISSING).length;

  const requiredSections = sectionList.filter((s) => s.importance === IMPORTANCE.REQUIRED);
  const recommendedSections = sectionList.filter((s) => s.importance === IMPORTANCE.RECOMMENDED);
  const optionalSections = sectionList.filter((s) => s.importance === IMPORTANCE.OPTIONAL);

  return {
    sections,
    metrics: {
      totalTracked,
      presentCount,
      partialCount,
      missingCount,
      required: {
        total: requiredSections.length,
        present: requiredSections.filter((s) => s.status === SECTION_COMPLETENESS.PRESENT).length,
        missing: requiredSections.filter((s) => s.status === SECTION_COMPLETENESS.MISSING).length,
      },
      recommended: {
        total: recommendedSections.length,
        present: recommendedSections.filter((s) => s.status === SECTION_COMPLETENESS.PRESENT).length,
        missing: recommendedSections.filter((s) => s.status === SECTION_COMPLETENESS.MISSING).length,
      },
      optional: {
        total: optionalSections.length,
        present: optionalSections.filter((s) => s.status === SECTION_COMPLETENESS.PRESENT).length,
      },
    },
    findings,
  };
};

module.exports = {
  analyzeCompleteness,
};
