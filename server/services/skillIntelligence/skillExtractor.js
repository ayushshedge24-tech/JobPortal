/**
 * Skill Extractor Module
 * JobPortal 2.0 — Phase 4F Deterministic Skill Intelligence
 */

const { CANONICAL_SKILL_DICTIONARY } = require("./skillDictionary");
const { normalizeSkill } = require("./skillNormalizer");
const { EVIDENCE_SOURCES, SKILL_LEVELS } = require("./skillIntelligenceConstants");

// Build phrase regexes for mentioned skill extraction
const MENTION_MATCHERS = [];

CANONICAL_SKILL_DICTIONARY.forEach((skill) => {
  const terms = [skill.name, ...(skill.aliases || [])];
  
  terms.forEach((term) => {
    if (!term || typeof term !== "string") return;
    const cleanTerm = term.trim();
    if (cleanTerm.length < 2 && cleanTerm.toLowerCase() !== "r" && cleanTerm.toLowerCase() !== "c") {
      return;
    }

    // Escape special regex characters except for + and # which we handle
    let escaped = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    
    // Boundary rules
    let pattern;
    if (cleanTerm.toLowerCase() === "c") {
      pattern = new RegExp(`(?:\\b|\\s)C(?:\\b|\\s|,)`, "g");
    } else if (cleanTerm.toLowerCase() === "r") {
      pattern = new RegExp(`(?:\\b|\\s)R(?:\\b|\\s|,)`, "g");
    } else if (cleanTerm.toLowerCase() === "go") {
      pattern = new RegExp(`\\b(?:Golang|Go lang|Go programming)\\b`, "gi");
    } else {
      pattern = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, "gi");
    }

    MENTION_MATCHERS.push({
      pattern,
      skill,
      rawTerm: cleanTerm,
    });
  });
});

/**
 * Scans free text and returns matched canonical skill objects.
 * @param {string} text
 * @returns {Array<object>}
 */
const scanTextForSkills = (text) => {
  if (!text || typeof text !== "string") return [];
  const foundSkillsMap = new Map();

  for (const matcher of MENTION_MATCHERS) {
    matcher.pattern.lastIndex = 0;
    if (matcher.pattern.test(text)) {
      if (!foundSkillsMap.has(matcher.skill.key)) {
        foundSkillsMap.set(matcher.skill.key, {
          key: matcher.skill.key,
          name: matcher.skill.name,
          category: matcher.skill.category,
          relatedSkills: Array.isArray(matcher.skill.relatedSkills) ? [...matcher.skill.relatedSkills] : [],
        });
      }
    }
  }

  return Array.from(foundSkillsMap.values());
};

/**
 * Extracts and aggregates all skills from Resume.content.
 * @param {object} content - Resume.content object
 * @returns {object} { explicitSkills, mentionedSkills, allSkills, aggregatedMap }
 */
const extractSkillsFromResume = (content) => {
  if (!content || typeof content !== "object") {
    return {
      explicitSkills: [],
      mentionedSkills: [],
      allSkills: [],
    };
  }

  const skillAggregationMap = new Map();

  // Helper to record / merge a skill
  const recordSkill = (normalized, source, evidenceText = "", explicitLevel = null) => {
    if (!normalized || !normalized.key) return;

    if (!skillAggregationMap.has(normalized.key)) {
      skillAggregationMap.set(normalized.key, {
        key: normalized.key,
        name: normalized.name,
        category: normalized.category,
        level: SKILL_LEVELS.NOT_SPECIFIED,
        sources: new Set(),
        evidence: [],
        isExplicit: false,
        normalized: normalized.normalized !== false,
        aliasMatched: !!normalized.aliasMatched,
        originalNames: new Set(),
        relatedSkills: normalized.relatedSkills || [],
      });
    }

    const item = skillAggregationMap.get(normalized.key);
    item.sources.add(source);

    if (normalized.originalName) {
      item.originalNames.add(normalized.originalName);
    }

    if (evidenceText && typeof evidenceText === "string") {
      const trimmed = evidenceText.trim();
      if (trimmed && item.evidence.length < 3) {
        item.evidence.push({
          source,
          text: trimmed.length > 150 ? trimmed.substring(0, 147) + "..." : trimmed,
        });
      }
    }

    // Explicit skill handling
    if (source === EVIDENCE_SOURCES.EXPLICIT_SKILL) {
      item.isExplicit = true;
      if (explicitLevel && typeof explicitLevel === "string" && explicitLevel.trim()) {
        const upperLevel = explicitLevel.trim().toUpperCase();
        if ([SKILL_LEVELS.BEGINNER, SKILL_LEVELS.INTERMEDIATE, SKILL_LEVELS.ADVANCED, SKILL_LEVELS.EXPERT].includes(upperLevel)) {
          item.level = upperLevel;
        }
      }
    }
  };

  // 1. Explicit Skills (Resume.content.skills)
  const explicitRawSkills = Array.isArray(content.skills) ? content.skills : [];
  explicitRawSkills.forEach((skillItem) => {
    const normalized = normalizeSkill(skillItem);
    if (normalized) {
      const level = typeof skillItem === "object" ? skillItem.level : null;
      recordSkill(normalized, EVIDENCE_SOURCES.EXPLICIT_SKILL, `Declared in Skills section: "${normalized.originalName}"`, level);
    }
  });

  // 2. Experience Mentions (bullets & descriptions)
  const experienceList = Array.isArray(content.experience) ? content.experience : [];
  experienceList.forEach((exp) => {
    const roleDesc = [exp.role, exp.company, exp.description].filter(Boolean).join(" ");
    if (roleDesc) {
      const found = scanTextForSkills(roleDesc);
      found.forEach((sk) => {
        recordSkill(sk, EVIDENCE_SOURCES.EXPERIENCE_BULLET, `Mentioned in experience at ${exp.company || "past role"}`);
      });
    }

    if (Array.isArray(exp.bulletPoints)) {
      exp.bulletPoints.forEach((bullet) => {
        if (bullet && typeof bullet === "string") {
          const found = scanTextForSkills(bullet);
          found.forEach((sk) => {
            recordSkill(sk, EVIDENCE_SOURCES.EXPERIENCE_BULLET, bullet);
          });
        }
      });
    }
  });

  // 3. Project Technologies & Descriptions
  const projectList = Array.isArray(content.projects) ? content.projects : [];
  projectList.forEach((proj) => {
    // Explicit project technologies array
    if (Array.isArray(proj.technologies)) {
      proj.technologies.forEach((tech) => {
        const normalized = normalizeSkill(tech);
        if (normalized) {
          recordSkill(
            normalized,
            EVIDENCE_SOURCES.PROJECT_TECHNOLOGY,
            `Listed in project tech stack: "${proj.title || "Project"}"`
          );
        }
      });
    }

    // Project description & bullets
    const projText = [proj.title, proj.subtitle, proj.description].filter(Boolean).join(" ");
    if (projText) {
      const found = scanTextForSkills(projText);
      found.forEach((sk) => {
        recordSkill(sk, EVIDENCE_SOURCES.PROJECT_DESCRIPTION, `Project "${proj.title || "Project"}" description`);
      });
    }

    if (Array.isArray(proj.bulletPoints)) {
      proj.bulletPoints.forEach((bullet) => {
        if (bullet && typeof bullet === "string") {
          const found = scanTextForSkills(bullet);
          found.forEach((sk) => {
            recordSkill(sk, EVIDENCE_SOURCES.PROJECT_DESCRIPTION, bullet);
          });
        }
      });
    }
  });

  // Compile results
  const allSkills = Array.from(skillAggregationMap.values()).map((item) => ({
    key: item.key,
    name: item.name,
    category: item.category,
    level: item.level,
    sources: Array.from(item.sources),
    evidenceCount: item.sources.size,
    isExplicit: item.isExplicit,
    normalized: item.normalized,
    aliasMatched: item.aliasMatched,
    originalNames: Array.from(item.originalNames),
    evidence: item.evidence,
    relatedSkills: item.relatedSkills || [],
  }));

  const explicitSkills = allSkills.filter((s) => s.isExplicit);
  const mentionedSkills = allSkills.filter((s) => !s.isExplicit);

  return {
    explicitSkills,
    mentionedSkills,
    allSkills,
  };
};

/**
 * Extracts skills from CandidateProfile model document
 * @param {object} profile
 * @returns {object}
 */
const extractSkillsFromCandidateProfile = (profile) => {
  if (!profile || typeof profile !== "object") {
    return { explicitSkills: [], mentionedSkills: [], allSkills: [] };
  }

  const fakeResumeContent = {
    skills: Array.isArray(profile.skills) ? profile.skills.map((s) => ({ name: s })) : [],
    experience: Array.isArray(profile.experience) ? profile.experience : [],
    projects: Array.isArray(profile.projects) ? profile.projects : [],
  };

  return extractSkillsFromResume(fakeResumeContent);
};

module.exports = {
  extractSkillsFromResume,
  extractSkillsFromCandidateProfile,
  scanTextForSkills,
};
