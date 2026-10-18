/**
 * JobPortal 2.0 — Master Resume Analyzer Engine
 * Orchestrates deterministic, explainable, and production-grade resume analysis.
 * Completely deterministic — Zero fabricated AI scores or arbitrary benchmarks.
 */

const { ANALYZER_VERSION, STATUS } = require("./analyzerConstants");
const { analyzeCompleteness } = require("./completenessAnalyzer");
const { analyzeContact } = require("./contactAnalyzer");
const { analyzeSummary } = require("./summaryAnalyzer");
const { analyzeExperience } = require("./experienceAnalyzer");
const { analyzeSkills } = require("./skillsAnalyzer");
const { analyzeProjects } = require("./projectsAnalyzer");
const { analyzeEducation } = require("./educationAnalyzer");
const { analyzeCertifications } = require("./certificationsAnalyzer");
const { analyzeAtsStructure } = require("./atsAnalyzer");
const { analyzeFormatting } = require("./formattingAnalyzer");
const { generateRecommendations } = require("./recommendationEngine");

const analyzeResume = (resume = {}) => {
  const content = resume.content || {};

  // Run all modular deterministic analyzers
  const completenessRes = analyzeCompleteness(content);
  const contactRes = analyzeContact(content);
  const summaryRes = analyzeSummary(content);
  const experienceRes = analyzeExperience(content);
  const skillsRes = analyzeSkills(content);
  const projectsRes = analyzeProjects(content);
  const educationRes = analyzeEducation(content);
  const certificationsRes = analyzeCertifications(content);
  const atsRes = analyzeAtsStructure(content);
  const formattingRes = analyzeFormatting(content);

  // Aggregate all findings
  const allFindings = [
    ...completenessRes.findings,
    ...contactRes.findings,
    ...summaryRes.findings,
    ...experienceRes.findings,
    ...skillsRes.findings,
    ...projectsRes.findings,
    ...educationRes.findings,
    ...certificationsRes.findings,
    ...atsRes.findings,
    ...formattingRes.findings,
  ];

  // Generate actionable recommendations mapped 1-to-1 to findings
  const recommendations = generateRecommendations(allFindings);

  // Top-level Category Statuses
  const categoryStatuses = {
    contact: contactRes.status,
    summary: summaryRes.status,
    experience: experienceRes.status,
    education: educationRes.status,
    skills: skillsRes.status,
    projects: projectsRes.status,
    certifications: certificationsRes.status,
    atsStructure: atsRes.status,
    formatting: formattingRes.status,
  };

  // High priority recommendations count
  const highPriorityRecs = recommendations.filter((r) => r.priority === "HIGH").length;

  return {
    resumeId: String(resume._id || ""),
    resumeTitle: resume.title || "Untitled Resume",
    template: resume.template || "ATS_CLASSIC",
    analyzedAt: new Date().toISOString(),
    analyzerVersion: ANALYZER_VERSION,
    summary: {
      categoryStatuses,
      completeness: completenessRes.metrics,
      totalFindings: allFindings.length,
      totalRecommendations: recommendations.length,
      highPriorityRecommendations: highPriorityRecs,
    },
    sections: {
      completeness: completenessRes.sections,
      contact: contactRes,
      summary: summaryRes,
      experience: experienceRes,
      education: educationRes,
      skills: skillsRes,
      projects: projectsRes,
      certifications: certificationsRes,
      atsStructure: atsRes,
      formatting: formattingRes,
    },
    findings: allFindings,
    recommendations,
  };
};

module.exports = {
  analyzeResume,
  ANALYZER_VERSION,
};
