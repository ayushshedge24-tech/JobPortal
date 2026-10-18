/**
 * JobPortal 2.0 — Education Section Analyzer
 * Evaluates academic degrees, institutions, fields of study, and dates.
 */

const { STATUS, SEVERITY, CATEGORIES } = require("./analyzerConstants");

const analyzeEducation = (content = {}) => {
  const educations = Array.isArray(content.education) ? content.education : [];
  const findings = [];

  if (educations.length === 0) {
    findings.push({
      id: "edu-missing",
      category: CATEGORIES.EDUCATION,
      severity: SEVERITY.INFO,
      code: "EDUCATION_NOT_LISTED",
      title: "No Education Entries Recorded",
      message: "Listing your highest degree, diploma, or certifications confirms your educational background.",
      evidence: "0 education entries detected",
      recommendation: "Add your university, college, or school qualifications in the Education section.",
    });

    return {
      status: STATUS.MISSING,
      totalEntries: 0,
      entriesMissingDegree: 0,
      entriesMissingInstitution: 0,
      findings,
    };
  }

  let entriesMissingDegree = 0;
  let entriesMissingInstitution = 0;

  educations.forEach((edu, idx) => {
    const num = idx + 1;
    const inst = (edu.institution || "").trim();
    const degree = (edu.degree || "").trim();
    const field = (edu.fieldOfStudy || "").trim();

    if (!inst) {
      entriesMissingInstitution++;
      findings.push({
        id: `edu-missing-institution-${num}`,
        category: CATEGORIES.EDUCATION,
        severity: SEVERITY.ERROR,
        code: "EDUCATION_INSTITUTION_REQUIRED",
        title: `Education #${num} Missing Institution`,
        message: `Education entry #${num} (${degree || "Degree"}) does not specify an institution name.`,
        evidence: "Institution field is empty",
        recommendation: "Add the college, university, or school name.",
      });
    }

    if (!degree && !field) {
      entriesMissingDegree++;
      findings.push({
        id: `edu-missing-degree-${num}`,
        category: CATEGORIES.EDUCATION,
        severity: SEVERITY.WARNING,
        code: "EDUCATION_DEGREE_REQUIRED",
        title: `Education #${num} Missing Degree or Field`,
        message: `Education entry #${num} (${inst || "Institution"}) does not specify a degree or field of study.`,
        evidence: "Degree and Field of Study fields are empty",
        recommendation: "Specify your degree (e.g. B.Tech, B.S., High School) and major/field.",
      });
    }
  });

  // Overview Finding
  findings.push({
    id: "edu-overview",
    category: CATEGORIES.EDUCATION,
    severity: SEVERITY.SUCCESS,
    code: "EDUCATION_SUMMARY",
    title: "Education Recorded",
    message: `Your resume contains ${educations.length} academic ${educations.length === 1 ? "qualification" : "qualifications"}.`,
    evidence: `${educations.length} education entries`,
    recommendation: null,
  });

  let status = STATUS.GOOD;
  if (entriesMissingDegree > 0 || entriesMissingInstitution > 0) {
    status = STATUS.NEEDS_ATTENTION;
  }

  return {
    status,
    totalEntries: educations.length,
    entriesMissingDegree,
    entriesMissingInstitution,
    findings,
  };
};

module.exports = {
  analyzeEducation,
};
