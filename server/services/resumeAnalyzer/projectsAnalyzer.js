/**
 * JobPortal 2.0 — Projects Section Analyzer
 * Evaluates project titles, tech stack presence, live repository/demo links, descriptions, and bullets.
 */

const { STATUS, SEVERITY, CATEGORIES } = require("./analyzerConstants");
const { isSafeUrl } = require("../../models/Resume");

const analyzeProjects = (content = {}) => {
  const projects = Array.isArray(content.projects) ? content.projects : [];
  const findings = [];

  if (projects.length === 0) {
    findings.push({
      id: "projects-missing",
      category: CATEGORIES.PROJECTS,
      severity: SEVERITY.INFO,
      code: "PROJECTS_NOT_RECORDED",
      title: "Featured Projects Not Listed",
      message: "Adding 1–3 featured projects with repository links demonstrates practical application of your skills.",
      evidence: "0 projects detected",
      recommendation: "Add 1–3 portfolio or open-source projects in the Projects section.",
    });

    return {
      status: STATUS.MISSING,
      totalProjects: 0,
      projectsWithLinks: 0,
      projectsWithTech: 0,
      projectsWithBullets: 0,
      findings,
    };
  }

  let projectsWithLinks = 0;
  let projectsWithTech = 0;
  let projectsWithBullets = 0;
  let projectsMissingTitle = 0;
  let projectsMissingDetails = 0;

  projects.forEach((proj, idx) => {
    const projNum = idx + 1;
    const title = (proj.title || "").trim();
    const subtitle = (proj.subtitle || "").trim();
    const desc = (proj.description || "").trim();
    const bullets = Array.isArray(proj.bulletPoints) ? proj.bulletPoints : [];
    const url = (proj.url || "").trim();

    if (!title) {
      projectsMissingTitle++;
      findings.push({
        id: `project-missing-title-${projNum}`,
        category: CATEGORIES.PROJECTS,
        severity: SEVERITY.ERROR,
        code: "PROJECT_TITLE_REQUIRED",
        title: `Project #${projNum} Missing Title`,
        message: `Project #${projNum} does not have a title specified.`,
        evidence: "Project title field is empty",
        recommendation: "Provide a descriptive title for this project.",
      });
    }

    if (subtitle) {
      projectsWithTech++;
    }

    if (bullets.length > 0 || desc.length > 0) {
      projectsWithBullets++;
    } else {
      projectsMissingDetails++;
      findings.push({
        id: `project-missing-details-${projNum}`,
        category: CATEGORIES.PROJECTS,
        severity: SEVERITY.WARNING,
        code: "PROJECT_DETAILS_MISSING",
        title: `Project #${projNum} Lacks Details`,
        message: `Project "${title || `Project #${projNum}`}" has no description or bullet points explaining what you built.`,
        evidence: "No description or bullet points found",
        recommendation: "Add 1–2 bullet points highlighting the architecture, tools used, and business outcome.",
      });
    }

    if (url) {
      if (isSafeUrl(url)) {
        projectsWithLinks++;
      } else {
        findings.push({
          id: `project-unsafe-url-${projNum}`,
          category: CATEGORIES.PROJECTS,
          severity: SEVERITY.ERROR,
          code: "PROJECT_UNSAFE_URL",
          title: `Unsafe URL in Project #${projNum}`,
          message: `The link for project "${title || `Project #${projNum}`}" uses an unsupported scheme.`,
          evidence: "Disallowed protocol detected",
          recommendation: "Use a valid https:// URL for your project link.",
        });
      }
    }
  });

  // Overview Signal
  findings.push({
    id: "projects-overview",
    category: CATEGORIES.PROJECTS,
    severity: SEVERITY.SUCCESS,
    code: "PROJECTS_SUMMARY",
    title: "Projects Configured",
    message: `Your resume contains ${projects.length} ${projects.length === 1 ? "project" : "projects"} (${projectsWithLinks} with links, ${projectsWithTech} with tech stacks).`,
    evidence: `${projects.length} projects, ${projectsWithLinks} with links`,
    recommendation: null,
  });

  // Determine Project Status
  let status = STATUS.GOOD;
  if (projectsMissingTitle > 0 || projectsMissingDetails > 0) {
    status = STATUS.NEEDS_ATTENTION;
  }

  return {
    status,
    totalProjects: projects.length,
    projectsWithLinks,
    projectsWithTech,
    projectsWithBullets,
    projectsMissingTitle,
    projectsMissingDetails,
    findings,
  };
};

module.exports = {
  analyzeProjects,
};
