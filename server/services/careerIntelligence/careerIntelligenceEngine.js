/**
 * Career Intelligence Engine Module
 * JobPortal 2.0 — Phase 4H Candidate Career Intelligence Workspace
 *
 * Orchestrates deterministic facts from:
 * - Phase 4A (Candidate Profile & Completion)
 * - Phase 4B (Resume Manager)
 * - Phase 4C (Resume Content)
 * - Phase 4E (Resume Analyzer)
 * - Phase 4F (Skill Intelligence)
 * - Phase 4G (Job Matching)
 */

const {
  CAREER_INTELLIGENCE_VERSION,
  RESUME_READINESS_STATUS,
} = require("./careerIntelligenceConstants");

const { analyzeResume } = require("../resumeAnalyzer/analyzeResume");
const { buildCandidateSkillProfile } = require("../skillIntelligence/candidateSkillProfile");
const { calculateProfileCompletion } = require("../../utils/profileCompletion");
const { aggregateCareerActions } = require("./careerActionAggregator");

/**
 * Builds the complete Candidate Career Intelligence snapshot.
 * STRICTLY DETERMINISTIC — ZERO FAKE AI / ARBITRARY CAREER SCORES.
 *
 * @param {object} params
 * @param {object} params.candidateProfile - CandidateProfile document/object
 * @param {object} params.primaryResume - Primary Resume document/object (or null)
 * @param {Array<object>} params.allResumes - All candidate resumes
 * @param {object} params.evaluatedJobContext - Optional recent evaluated job match result
 * @returns {object} Complete Career Intelligence Payload
 */
const buildCareerIntelligence = ({
  candidateProfile = null,
  primaryResume = null,
  allResumes = [],
  evaluatedJobContext = null,
} = {}) => {
  const generatedAt = new Date().toISOString();

  // 1. Profile Data (Phase 4A)
  const completionPercentage = candidateProfile
    ? calculateProfileCompletion(candidateProfile)
    : 0;

  const profileSummary = {
    completionPercentage,
    headline: candidateProfile?.headline || "",
    currentRole: candidateProfile?.experience?.[0]?.role || "",
    city: candidateProfile?.city || candidateProfile?.location || "",
    totalExperienceEntries: Array.isArray(candidateProfile?.experience)
      ? candidateProfile.experience.length
      : 0,
    preferredWorkModes: Array.isArray(candidateProfile?.preferredWorkModes)
      ? candidateProfile.preferredWorkModes
      : [],
    preferredLocations: Array.isArray(candidateProfile?.preferredLocations)
      ? candidateProfile.preferredLocations
      : [],
  };

  // 2. Resumes Summary (Phase 4B/4C)
  const resumesSummary = {
    total: Array.isArray(allResumes) ? allResumes.length : 0,
    hasPrimary: !!primaryResume,
    primary: primaryResume
      ? {
          id: String(primaryResume._id),
          title: primaryResume.title || "Primary Resume",
          template: primaryResume.template || "ATS_CLASSIC",
          version: primaryResume.version || 1,
          isPrimary: true,
          updatedAt: primaryResume.updatedAt || null,
        }
      : null,
  };

  // 3. Resume Readiness (Phase 4E Analyzer)
  let resumeReadiness = {
    analyzerAvailable: false,
    status: RESUME_READINESS_STATUS.NO_RESUME,
    resumeTitle: null,
    summary: null,
    categoryStatuses: {},
    strengths: [],
    warnings: [],
    recommendations: [],
  };

  let analyzerResult = null;
  if (primaryResume && primaryResume.content) {
    analyzerResult = analyzeResume(primaryResume);

    // Derive concise strengths (sections with GOOD status or positive metrics)
    const strengths = [];
    const warnings = [];

    if (analyzerResult.summary?.categoryStatuses) {
      Object.entries(analyzerResult.summary.categoryStatuses).forEach(([cat, status]) => {
        if (status === "GOOD") {
          strengths.push(`${cat.charAt(0).toUpperCase() + cat.slice(1)} section is well-structured and complete.`);
        } else if (status === "ERROR" || status === "WARNING") {
          warnings.push(`${cat.charAt(0).toUpperCase() + cat.slice(1)} section requires attention or improvement.`);
        }
      });
    }

    // Determine overall readiness status deterministically
    let readinessStatus = RESUME_READINESS_STATUS.GOOD;
    if (analyzerResult.summary.highPriorityRecommendations > 0) {
      readinessStatus = RESUME_READINESS_STATUS.NEEDS_ATTENTION;
    } else if (analyzerResult.summary.completeness?.completedSectionsCount >= 5) {
      readinessStatus = RESUME_READINESS_STATUS.EXCELLENT;
    }

    resumeReadiness = {
      analyzerAvailable: true,
      status: readinessStatus,
      resumeId: String(primaryResume._id),
      resumeTitle: primaryResume.title || "Primary Resume",
      template: primaryResume.template || "ATS_CLASSIC",
      summary: {
        totalFindings: analyzerResult.summary.totalFindings,
        totalRecommendations: analyzerResult.summary.totalRecommendations,
        highPriorityRecommendations: analyzerResult.summary.highPriorityRecommendations,
        completedSectionsCount: analyzerResult.summary.completeness?.completedSectionsCount || 0,
        totalSectionsCount: analyzerResult.summary.completeness?.totalSectionsCount || 8,
      },
      categoryStatuses: analyzerResult.summary.categoryStatuses || {},
      strengths,
      warnings,
      recommendations: (analyzerResult.recommendations || []).slice(0, 5),
    };
  }

  // 4. Skills Profile (Phase 4F Skill Intelligence)
  const skillSourceDoc = primaryResume && primaryResume.content
    ? primaryResume
    : candidateProfile || { content: { skills: [] } };

  const skillProfile = buildCandidateSkillProfile(skillSourceDoc, {
    candidateId: candidateProfile?.user || primaryResume?.user || null,
    resumeId: primaryResume?._id || null,
    title: primaryResume?.title || "Candidate Profile",
  });

  const skillsSummary = {
    total: skillProfile.metrics?.totalSkills || (skillProfile.skills || []).length || 0,
    explicitCount: skillProfile.metrics?.explicitSkillsCount || 0,
    evidenceCount: skillProfile.metrics?.mentionedSkillsCount || 0,
    unspecifiedLevelCount: skillProfile.metrics?.unspecifiedLevelsCount || 0,
    categoriesRepresented: skillProfile.metrics?.categoriesRepresented || 0,
    categories: skillProfile.categories || {},
    unresolved: (skillProfile.skills || []).filter((s) => !s.normalized),
    recentAliases: (skillProfile.aliasesDetected || []).slice(0, 5),
  };

  // 5. Job Alignment (Phase 4G - Factual, on-demand or empty state)
  let jobAlignment = {
    hasEvaluatedJobs: false,
    evaluatedJobsCount: 0,
    recent: [],
  };

  if (evaluatedJobContext && evaluatedJobContext.job && evaluatedJobContext.summary) {
    jobAlignment = {
      hasEvaluatedJobs: true,
      evaluatedJobsCount: 1,
      recent: [
        {
          jobId: evaluatedJobContext.job.id,
          title: evaluatedJobContext.job.title,
          company: evaluatedJobContext.job.company,
          location: evaluatedJobContext.job.location,
          workMode: evaluatedJobContext.job.workMode,
          status: evaluatedJobContext.summary.status,
          headline: evaluatedJobContext.summary.headline,
          matchedRequiredSkills: (evaluatedJobContext.requiredSkills?.matched || []).map((s) => s.canonicalName),
          missingRequiredSkills: (evaluatedJobContext.requiredSkills?.missing || []).map((s) => s.canonicalName),
          keyHighlights: evaluatedJobContext.summary.keyHighlights || [],
        },
      ],
    };
  }

  // 6. Action Aggregator
  const actions = aggregateCareerActions({
    profileDoc: candidateProfile,
    analyzerRecs: analyzerResult?.recommendations || [],
    resumeId: primaryResume?._id || "",
    skillRecs: [],
    matchRecs: evaluatedJobContext?.recommendations || [],
  });

  return {
    version: CAREER_INTELLIGENCE_VERSION,
    generatedAt,
    profile: profileSummary,
    resumes: resumesSummary,
    resumeReadiness,
    skills: skillsSummary,
    jobAlignment,
    actions,
  };
};

module.exports = {
  buildCareerIntelligence,
};
