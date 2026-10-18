const Resume = require("../models/Resume");
const CandidateProfile = require("../models/CandidateProfile");
const {
  CANONICAL_SECTION_IDS,
  VALID_SKILL_CATEGORIES,
  VALID_SKILL_LEVELS,
  VALID_LANG_PROFICIENCIES,
  VALID_FONT_SIZES,
  VALID_LINE_SPACINGS,
  VALID_TEMPLATES,
  VALID_STATUSES,
  isSafeUrl,
} = require("../models/Resume");

const MAX_RESUMES_PER_USER = 5;
const MAX_CONTENT_SIZE_BYTES = 40 * 1024; // 40 KB limit

/**
 * Returns safe structured default content for a resume
 */
const getDefaultContent = () => ({
  personal: {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "India",
    linkedin: "",
    github: "",
    portfolio: "",
    website: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  customSections: [],
  sectionOrder: [...CANONICAL_SECTION_IDS],
  sectionVisibility: {
    SUMMARY: true,
    EXPERIENCE: true,
    EDUCATION: true,
    SKILLS: true,
    PROJECTS: true,
    CERTIFICATIONS: true,
    ACHIEVEMENTS: true,
    LANGUAGES: true,
    CUSTOM: true,
  },
  styling: {
    fontSize: "MD",
    lineSpacing: "NORMAL",
    primaryColor: "#2563eb",
  },
});

/**
 * Server-side validator and sanitizer for resume content payload
 */
const validateContentPayload = (rawContent) => {
  if (!rawContent || typeof rawContent !== "object" || Array.isArray(rawContent)) {
    return { isValid: false, message: "'content' must be a valid JSON object." };
  }

  const sanitized = {};

  // 1. Personal Info
  if (rawContent.personal !== undefined) {
    if (typeof rawContent.personal !== "object" || rawContent.personal === null || Array.isArray(rawContent.personal)) {
      return { isValid: false, message: "'personal' must be an object." };
    }
    const p = rawContent.personal;
    if (p.fullName && p.fullName.length > 100) return { isValid: false, message: "Full name cannot exceed 100 chars." };
    if (p.headline && p.headline.length > 150) return { isValid: false, message: "Headline cannot exceed 150 chars." };
    if (p.email && p.email.length > 100) return { isValid: false, message: "Email cannot exceed 100 chars." };
    if (p.phone && p.phone.length > 30) return { isValid: false, message: "Phone cannot exceed 30 chars." };
    if (p.city && p.city.length > 80) return { isValid: false, message: "City cannot exceed 80 chars." };
    if (p.state && p.state.length > 80) return { isValid: false, message: "State cannot exceed 80 chars." };
    if (p.country && p.country.length > 80) return { isValid: false, message: "Country cannot exceed 80 chars." };

    const urlFields = ["linkedin", "github", "portfolio", "website"];
    for (const field of urlFields) {
      if (p[field]) {
        if (typeof p[field] !== "string" || p[field].length > 250) {
          return { isValid: false, message: `${field} URL cannot exceed 250 chars.` };
        }
        if (!isSafeUrl(p[field])) {
          return { isValid: false, message: `Invalid or disallowed URL protocol in personal.${field}. Only http: and https: are allowed.` };
        }
      }
    }

    sanitized.personal = {
      fullName: (p.fullName || "").trim(),
      headline: (p.headline || "").trim(),
      email: (p.email || "").trim().toLowerCase(),
      phone: (p.phone || "").trim(),
      city: (p.city || "").trim(),
      state: (p.state || "").trim(),
      country: (p.country || "India").trim(),
      linkedin: (p.linkedin || "").trim(),
      github: (p.github || "").trim(),
      portfolio: (p.portfolio || "").trim(),
      website: (p.website || "").trim(),
    };
  } else {
    sanitized.personal = getDefaultContent().personal;
  }

  // 2. Summary
  if (rawContent.summary !== undefined) {
    if (typeof rawContent.summary !== "string") return { isValid: false, message: "'summary' must be a string." };
    if (rawContent.summary.length > 3000) return { isValid: false, message: "Summary cannot exceed 3000 chars." };
    sanitized.summary = rawContent.summary.trim();
  } else {
    sanitized.summary = "";
  }

  // 3. Experience
  if (rawContent.experience !== undefined) {
    if (!Array.isArray(rawContent.experience)) return { isValid: false, message: "'experience' must be an array." };
    if (rawContent.experience.length > 15) return { isValid: false, message: "Cannot exceed 15 experience entries." };
    sanitized.experience = [];

    for (let i = 0; i < rawContent.experience.length; i++) {
      const exp = rawContent.experience[i];
      if (!exp || typeof exp !== "object") return { isValid: false, message: `Experience entry at index ${i} is invalid.` };
      if (exp.company && exp.company.length > 120) return { isValid: false, message: "Company name cannot exceed 120 chars." };
      if (exp.role && exp.role.length > 120) return { isValid: false, message: "Role cannot exceed 120 chars." };
      if (exp.location && exp.location.length > 100) return { isValid: false, message: "Location cannot exceed 100 chars." };
      if (exp.startDate && exp.startDate.length > 30) return { isValid: false, message: "Start date cannot exceed 30 chars." };
      if (exp.endDate && exp.endDate.length > 30) return { isValid: false, message: "End date cannot exceed 30 chars." };
      if (exp.description && exp.description.length > 2000) return { isValid: false, message: "Experience description cannot exceed 2000 chars." };

      let bulletPoints = [];
      if (exp.bulletPoints !== undefined) {
        if (!Array.isArray(exp.bulletPoints)) return { isValid: false, message: "Experience bullet points must be an array." };
        if (exp.bulletPoints.length > 10) return { isValid: false, message: "Cannot exceed 10 bullet points per experience." };
        for (const bp of exp.bulletPoints) {
          if (typeof bp !== "string") return { isValid: false, message: "Bullet points must be strings." };
          if (bp.length > 500) return { isValid: false, message: "Bullet point cannot exceed 500 chars." };
          if (bp.trim().length > 0) bulletPoints.push(bp.trim());
        }
      }

      sanitized.experience.push({
        _id: exp._id,
        company: (exp.company || "").trim(),
        role: (exp.role || "").trim(),
        location: (exp.location || "").trim(),
        startDate: (exp.startDate || "").trim(),
        endDate: (exp.endDate || "").trim(),
        isCurrent: Boolean(exp.isCurrent),
        description: (exp.description || "").trim(),
        bulletPoints,
      });
    }
  } else {
    sanitized.experience = [];
  }

  // 4. Education
  if (rawContent.education !== undefined) {
    if (!Array.isArray(rawContent.education)) return { isValid: false, message: "'education' must be an array." };
    if (rawContent.education.length > 8) return { isValid: false, message: "Cannot exceed 8 education entries." };
    sanitized.education = [];

    for (let i = 0; i < rawContent.education.length; i++) {
      const edu = rawContent.education[i];
      if (!edu || typeof edu !== "object") return { isValid: false, message: `Education entry at index ${i} is invalid.` };
      if (edu.institution && edu.institution.length > 150) return { isValid: false, message: "Institution cannot exceed 150 chars." };
      if (edu.degree && edu.degree.length > 120) return { isValid: false, message: "Degree cannot exceed 120 chars." };
      if (edu.fieldOfStudy && edu.fieldOfStudy.length > 120) return { isValid: false, message: "Field of study cannot exceed 120 chars." };
      if (edu.location && edu.location.length > 100) return { isValid: false, message: "Location cannot exceed 100 chars." };
      if (edu.startDate && edu.startDate.length > 30) return { isValid: false, message: "Start date cannot exceed 30 chars." };
      if (edu.endDate && edu.endDate.length > 30) return { isValid: false, message: "End date cannot exceed 30 chars." };
      if (edu.grade && edu.grade.length > 30) return { isValid: false, message: "Grade cannot exceed 30 chars." };
      if (edu.description && edu.description.length > 1000) return { isValid: false, message: "Education description cannot exceed 1000 chars." };

      sanitized.education.push({
        _id: edu._id,
        institution: (edu.institution || "").trim(),
        degree: (edu.degree || "").trim(),
        fieldOfStudy: (edu.fieldOfStudy || "").trim(),
        location: (edu.location || "").trim(),
        startDate: (edu.startDate || "").trim(),
        endDate: (edu.endDate || "").trim(),
        grade: (edu.grade || "").trim(),
        description: (edu.description || "").trim(),
      });
    }
  } else {
    sanitized.education = [];
  }

  // 5. Skills
  if (rawContent.skills !== undefined) {
    if (!Array.isArray(rawContent.skills)) return { isValid: false, message: "'skills' must be an array." };
    if (rawContent.skills.length > 40) return { isValid: false, message: "Cannot exceed 40 skills." };
    sanitized.skills = [];

    for (let i = 0; i < rawContent.skills.length; i++) {
      const sk = rawContent.skills[i];
      if (!sk || typeof sk !== "object") return { isValid: false, message: `Skill at index ${i} is invalid.` };
      const name = (sk.name || "").trim();
      if (!name) return { isValid: false, message: `Skill at index ${i} requires a name.` };
      if (name.length > 60) return { isValid: false, message: "Skill name cannot exceed 60 chars." };

      const category = sk.category || "Other";
      if (!VALID_SKILL_CATEGORIES.includes(category)) {
        return { isValid: false, message: `Invalid skill category '${category}'.` };
      }

      const level = sk.level || "";
      if (!VALID_SKILL_LEVELS.includes(level)) {
        return { isValid: false, message: `Invalid skill level '${level}'. Must be one of: ${VALID_SKILL_LEVELS.filter(Boolean).join(", ")} or empty.` };
      }

      sanitized.skills.push({
        _id: sk._id,
        name,
        category,
        level,
      });
    }
  } else {
    sanitized.skills = [];
  }

  // 6. Projects
  if (rawContent.projects !== undefined) {
    if (!Array.isArray(rawContent.projects)) return { isValid: false, message: "'projects' must be an array." };
    if (rawContent.projects.length > 12) return { isValid: false, message: "Cannot exceed 12 project entries." };
    sanitized.projects = [];

    for (let i = 0; i < rawContent.projects.length; i++) {
      const proj = rawContent.projects[i];
      if (!proj || typeof proj !== "object") return { isValid: false, message: `Project entry at index ${i} is invalid.` };
      if (proj.title && proj.title.length > 120) return { isValid: false, message: "Project title cannot exceed 120 chars." };
      if (proj.subtitle && proj.subtitle.length > 120) return { isValid: false, message: "Subtitle cannot exceed 120 chars." };
      if (proj.startDate && proj.startDate.length > 30) return { isValid: false, message: "Start date cannot exceed 30 chars." };
      if (proj.endDate && proj.endDate.length > 30) return { isValid: false, message: "End date cannot exceed 30 chars." };
      if (proj.description && proj.description.length > 1500) return { isValid: false, message: "Project description cannot exceed 1500 chars." };

      if (proj.url && !isSafeUrl(proj.url)) {
        return { isValid: false, message: "Invalid or disallowed protocol in project URL. Only http: and https: are allowed." };
      }
      if (proj.repoUrl && !isSafeUrl(proj.repoUrl)) {
        return { isValid: false, message: "Invalid or disallowed protocol in project Repo URL. Only http: and https: are allowed." };
      }

      let technologies = [];
      if (proj.technologies !== undefined) {
        if (!Array.isArray(proj.technologies)) return { isValid: false, message: "Project technologies must be an array." };
        for (const t of proj.technologies) {
          if (typeof t === "string" && t.trim().length > 0 && t.length <= 40) {
            technologies.push(t.trim());
          }
        }
      }

      let bulletPoints = [];
      if (proj.bulletPoints !== undefined) {
        if (!Array.isArray(proj.bulletPoints)) return { isValid: false, message: "Project bullet points must be an array." };
        if (proj.bulletPoints.length > 10) return { isValid: false, message: "Cannot exceed 10 bullet points per project." };
        for (const bp of proj.bulletPoints) {
          if (typeof bp !== "string") return { isValid: false, message: "Bullet points must be strings." };
          if (bp.length > 500) return { isValid: false, message: "Bullet point cannot exceed 500 chars." };
          if (bp.trim().length > 0) bulletPoints.push(bp.trim());
        }
      }

      sanitized.projects.push({
        _id: proj._id,
        title: (proj.title || "").trim(),
        subtitle: (proj.subtitle || "").trim(),
        technologies,
        url: (proj.url || "").trim(),
        repoUrl: (proj.repoUrl || "").trim(),
        startDate: (proj.startDate || "").trim(),
        endDate: (proj.endDate || "").trim(),
        description: (proj.description || "").trim(),
        bulletPoints,
      });
    }
  } else {
    sanitized.projects = [];
  }

  // 7. Certifications
  if (rawContent.certifications !== undefined) {
    if (!Array.isArray(rawContent.certifications)) return { isValid: false, message: "'certifications' must be an array." };
    if (rawContent.certifications.length > 15) return { isValid: false, message: "Cannot exceed 15 certification entries." };
    sanitized.certifications = [];

    for (let i = 0; i < rawContent.certifications.length; i++) {
      const cert = rawContent.certifications[i];
      if (!cert || typeof cert !== "object") return { isValid: false, message: `Certification at index ${i} is invalid.` };
      if (cert.name && cert.name.length > 150) return { isValid: false, message: "Certification name cannot exceed 150 chars." };
      if (cert.issuer && cert.issuer.length > 150) return { isValid: false, message: "Issuer cannot exceed 150 chars." };
      if (cert.issueDate && cert.issueDate.length > 30) return { isValid: false, message: "Issue date cannot exceed 30 chars." };
      if (cert.expiryDate && cert.expiryDate.length > 30) return { isValid: false, message: "Expiry date cannot exceed 30 chars." };
      if (cert.credentialId && cert.credentialId.length > 100) return { isValid: false, message: "Credential ID cannot exceed 100 chars." };

      if (cert.credentialUrl && !isSafeUrl(cert.credentialUrl)) {
        return { isValid: false, message: "Invalid or disallowed protocol in Credential URL. Only http: and https: are allowed." };
      }

      sanitized.certifications.push({
        _id: cert._id,
        name: (cert.name || "").trim(),
        issuer: (cert.issuer || "").trim(),
        issueDate: (cert.issueDate || "").trim(),
        expiryDate: (cert.expiryDate || "").trim(),
        credentialId: (cert.credentialId || "").trim(),
        credentialUrl: (cert.credentialUrl || "").trim(),
      });
    }
  } else {
    sanitized.certifications = [];
  }

  // 8. Achievements
  if (rawContent.achievements !== undefined) {
    if (!Array.isArray(rawContent.achievements)) return { isValid: false, message: "'achievements' must be an array." };
    if (rawContent.achievements.length > 10) return { isValid: false, message: "Cannot exceed 10 achievement entries." };
    sanitized.achievements = [];

    for (let i = 0; i < rawContent.achievements.length; i++) {
      const ach = rawContent.achievements[i];
      if (!ach || typeof ach !== "object") return { isValid: false, message: `Achievement at index ${i} is invalid.` };
      if (ach.title && ach.title.length > 150) return { isValid: false, message: "Achievement title cannot exceed 150 chars." };
      if (ach.description && ach.description.length > 1000) return { isValid: false, message: "Achievement description cannot exceed 1000 chars." };
      if (ach.date && ach.date.length > 30) return { isValid: false, message: "Date cannot exceed 30 chars." };

      sanitized.achievements.push({
        _id: ach._id,
        title: (ach.title || "").trim(),
        description: (ach.description || "").trim(),
        date: (ach.date || "").trim(),
      });
    }
  } else {
    sanitized.achievements = [];
  }

  // 9. Languages
  if (rawContent.languages !== undefined) {
    if (!Array.isArray(rawContent.languages)) return { isValid: false, message: "'languages' must be an array." };
    if (rawContent.languages.length > 8) return { isValid: false, message: "Cannot exceed 8 language entries." };
    sanitized.languages = [];

    for (let i = 0; i < rawContent.languages.length; i++) {
      const lang = rawContent.languages[i];
      if (!lang || typeof lang !== "object") return { isValid: false, message: `Language at index ${i} is invalid.` };
      if (lang.name && lang.name.length > 60) return { isValid: false, message: "Language name cannot exceed 60 chars." };

      const proficiency = lang.proficiency || "Fluent";
      if (!VALID_LANG_PROFICIENCIES.includes(proficiency)) {
        return { isValid: false, message: `Invalid language proficiency '${proficiency}'. Must be one of: ${VALID_LANG_PROFICIENCIES.filter(Boolean).join(", ")}.` };
      }

      sanitized.languages.push({
        _id: lang._id,
        name: (lang.name || "").trim(),
        proficiency,
      });
    }
  } else {
    sanitized.languages = [];
  }

  // 10. Custom Sections
  if (rawContent.customSections !== undefined) {
    if (!Array.isArray(rawContent.customSections)) return { isValid: false, message: "'customSections' must be an array." };
    if (rawContent.customSections.length > 3) return { isValid: false, message: "Cannot exceed 3 custom sections." };
    sanitized.customSections = [];

    for (let i = 0; i < rawContent.customSections.length; i++) {
      const cs = rawContent.customSections[i];
      if (!cs || typeof cs !== "object") return { isValid: false, message: `Custom section at index ${i} is invalid.` };
      const id = (cs.id || "").trim();
      if (!id || !/^[a-zA-Z0-9_-]{3,32}$/.test(id)) {
        return { isValid: false, message: `Custom section ID '${id}' is invalid. Must be alphanumeric (3-32 chars).` };
      }
      if (cs.title && cs.title.length > 80) return { isValid: false, message: "Custom section title cannot exceed 80 chars." };

      let items = [];
      if (cs.items !== undefined) {
        if (!Array.isArray(cs.items)) return { isValid: false, message: "Custom section items must be an array." };
        if (cs.items.length > 6) return { isValid: false, message: "Cannot exceed 6 items per custom section." };

        for (const it of cs.items) {
          if (!it || typeof it !== "object") return { isValid: false, message: "Custom section item is invalid." };
          if (it.title && it.title.length > 120) return { isValid: false, message: "Title cannot exceed 120 chars." };
          if (it.subtitle && it.subtitle.length > 120) return { isValid: false, message: "Subtitle cannot exceed 120 chars." };
          if (it.date && it.date.length > 30) return { isValid: false, message: "Date cannot exceed 30 chars." };
          if (it.description && it.description.length > 1000) return { isValid: false, message: "Description cannot exceed 1000 chars." };

          let bulletPoints = [];
          if (it.bulletPoints !== undefined) {
            if (!Array.isArray(it.bulletPoints)) return { isValid: false, message: "Bullet points must be an array." };
            if (it.bulletPoints.length > 10) return { isValid: false, message: "Cannot exceed 10 bullet points per item." };
            for (const bp of it.bulletPoints) {
              if (typeof bp !== "string") return { isValid: false, message: "Bullet points must be strings." };
              if (bp.length > 500) return { isValid: false, message: "Bullet point cannot exceed 500 chars." };
              if (bp.trim().length > 0) bulletPoints.push(bp.trim());
            }
          }

          items.push({
            title: (it.title || "").trim(),
            subtitle: (it.subtitle || "").trim(),
            date: (it.date || "").trim(),
            description: (it.description || "").trim(),
            bulletPoints,
          });
        }
      }

      sanitized.customSections.push({
        _id: cs._id,
        id,
        title: (cs.title || "Custom Section").trim(),
        items,
      });
    }
  } else {
    sanitized.customSections = [];
  }

  // 11. Section Order
  if (rawContent.sectionOrder !== undefined) {
    if (!Array.isArray(rawContent.sectionOrder)) return { isValid: false, message: "'sectionOrder' must be an array." };
    if (new Set(rawContent.sectionOrder).size !== rawContent.sectionOrder.length) {
      return { isValid: false, message: "Duplicate section IDs are not allowed in sectionOrder." };
    }
    for (const secId of rawContent.sectionOrder) {
      if (!CANONICAL_SECTION_IDS.includes(secId)) {
        return { isValid: false, message: `Unknown section ID '${secId}' in sectionOrder. Must be one of: ${CANONICAL_SECTION_IDS.join(", ")}.` };
      }
    }
    sanitized.sectionOrder = rawContent.sectionOrder;
  } else {
    sanitized.sectionOrder = [...CANONICAL_SECTION_IDS];
  }

  // 12. Section Visibility
  if (rawContent.sectionVisibility !== undefined) {
    if (typeof rawContent.sectionVisibility !== "object" || rawContent.sectionVisibility === null) {
      return { isValid: false, message: "'sectionVisibility' must be an object." };
    }
    sanitized.sectionVisibility = {};
    for (const secId of CANONICAL_SECTION_IDS) {
      sanitized.sectionVisibility[secId] = rawContent.sectionVisibility[secId] !== undefined
        ? Boolean(rawContent.sectionVisibility[secId])
        : true;
    }
  } else {
    sanitized.sectionVisibility = getDefaultContent().sectionVisibility;
  }

  // 13. Styling
  if (rawContent.styling !== undefined) {
    if (typeof rawContent.styling !== "object" || rawContent.styling === null || Array.isArray(rawContent.styling)) {
      return { isValid: false, message: "'styling' must be an object." };
    }
    const st = rawContent.styling;
    const fontSize = st.fontSize || "MD";
    if (!VALID_FONT_SIZES.includes(fontSize)) {
      return { isValid: false, message: `Invalid fontSize '${fontSize}'. Must be one of: ${VALID_FONT_SIZES.join(", ")}.` };
    }

    const lineSpacing = st.lineSpacing || "NORMAL";
    if (!VALID_LINE_SPACINGS.includes(lineSpacing)) {
      return { isValid: false, message: `Invalid lineSpacing '${lineSpacing}'. Must be one of: ${VALID_LINE_SPACINGS.join(", ")}.` };
    }

    const primaryColor = (st.primaryColor || "#2563eb").trim();
    if (!/^#([A-Fa-f0-9]{6})$/.test(primaryColor)) {
      return { isValid: false, message: `Invalid primaryColor '${primaryColor}'. Must be a valid 6-digit hex string (e.g. #2563eb).` };
    }

    sanitized.styling = {
      fontSize,
      lineSpacing,
      primaryColor,
    };
  } else {
    sanitized.styling = getDefaultContent().styling;
  }

  return { isValid: true, sanitizedContent: sanitized };
};

/**
 * @route   GET /api/candidate/resumes
 * @desc    Get all resumes belonging to authenticated candidate
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .sort({ isPrimary: -1, updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: resumes.length,
      limit: MAX_RESUMES_PER_USER,
      data: resumes,
    });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_RESUMES_FAILED",
        message: "Failed to retrieve resumes.",
      },
    });
  }
};

/**
 * @route   GET /api/candidate/resumes/:id
 * @desc    Get single resume by ID (with ownership check and structured content)
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESUME_NOT_FOUND",
          message: "Resume not found or you do not have permission to access it.",
        },
      });
    }

    const resumeObj = resume.toObject();

    // Ensure backwards compatibility with old Phase 4B resumes without content
    if (!resumeObj.content || Object.keys(resumeObj.content).length === 0) {
      resumeObj.content = getDefaultContent();
    } else {
      const defaultContent = getDefaultContent();
      const content = resumeObj.content;
      resumeObj.content = {
        ...defaultContent,
        ...content,
        personal: { ...defaultContent.personal, ...(content.personal || {}) },
        styling: { ...defaultContent.styling, ...(content.styling || {}) },
        sectionOrder: Array.isArray(content.sectionOrder) && content.sectionOrder.length > 0 ? content.sectionOrder : defaultContent.sectionOrder,
        sectionVisibility: content.sectionVisibility instanceof Map
          ? Object.fromEntries(content.sectionVisibility)
          : (content.sectionVisibility || defaultContent.sectionVisibility),
      };
    }

    res.json({
      success: true,
      data: resumeObj,
    });
  } catch (error) {
    console.error("Error fetching resume by ID:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_RESUME_FAILED",
        message: "Failed to retrieve resume details.",
      },
    });
  }
};

/**
 * @route   POST /api/candidate/resumes
 * @desc    Create a new resume (enforcing max 5 resumes per user)
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const createResume = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Enforce max 5 resumes per user
    const existingCount = await Resume.countDocuments({ user: userId });
    if (existingCount >= MAX_RESUMES_PER_USER) {
      return res.status(400).json({
        success: false,
        error: {
          code: "RESUME_LIMIT_REACHED",
          message: `You can have up to ${MAX_RESUMES_PER_USER} resumes. Please delete or update an existing resume.`,
        },
      });
    }

    const { title, template, status, source } = req.body || {};

    // Validate title
    const trimmedTitle = (title || "").trim();
    if (title !== undefined && trimmedTitle.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TITLE",
          message: "Resume title cannot be empty.",
        },
      });
    }
    if (trimmedTitle.length > 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: "TITLE_TOO_LONG",
          message: "Resume title cannot exceed 100 characters.",
        },
      });
    }

    // Validate template if passed
    if (template && !VALID_TEMPLATES.includes(template)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TEMPLATE",
          message: `Template must be one of: ${VALID_TEMPLATES.join(", ")}`,
        },
      });
    }

    // Validate status if passed
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
        },
      });
    }

    // If it's the first resume for the user, make it primary automatically
    const isFirstResume = existingCount === 0;

    const newResume = await Resume.create({
      user: userId,
      title: trimmedTitle || `Resume #${existingCount + 1}`,
      template: template || "ATS_CLASSIC",
      status: status || "ACTIVE",
      source: source || "MANUAL",
      isPrimary: isFirstResume,
      version: 1,
      content: getDefaultContent(),
    });

    res.status(201).json({
      success: true,
      message: "Resume created successfully.",
      data: newResume,
    });
  } catch (error) {
    console.error("Error creating resume:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "CREATE_RESUME_FAILED",
        message: "Failed to create resume.",
      },
    });
  }
};

/**
 * @route   PUT /api/candidate/resumes/:id
 * @desc    Update resume metadata (title, template, status) with ownership check
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESUME_NOT_FOUND",
          message: "Resume not found or you do not have permission to modify it.",
        },
      });
    }

    const { title, template, status } = req.body || {};

    if (title !== undefined) {
      const trimmedTitle = title.trim();
      if (trimmedTitle.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_TITLE",
            message: "Resume title cannot be empty.",
          },
        });
      }
      if (trimmedTitle.length > 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: "TITLE_TOO_LONG",
            message: "Resume title cannot exceed 100 characters.",
          },
        });
      }
      resume.title = trimmedTitle;
    }

    if (template !== undefined) {
      if (!VALID_TEMPLATES.includes(template)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_TEMPLATE",
            message: `Template must be one of: ${VALID_TEMPLATES.join(", ")}`,
          },
        });
      }
      resume.template = template;
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
          },
        });
      }
      resume.status = status;
    }

    await resume.save();

    res.json({
      success: true,
      message: "Resume updated successfully.",
      data: resume,
    });
  } catch (error) {
    console.error("Error updating resume:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "UPDATE_RESUME_FAILED",
        message: "Failed to update resume.",
      },
    });
  }
};

/**
 * @route   DELETE /api/candidate/resumes/:id
 * @desc    Delete resume with ownership check (safely promotes another primary if needed)
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESUME_NOT_FOUND",
          message: "Resume not found or you do not have permission to delete it.",
        },
      });
    }

    const wasPrimary = resume.isPrimary;
    await Resume.deleteOne({ _id: resume._id });

    // If deleted resume was primary, promote another resume if available
    if (wasPrimary) {
      const remainingResume = await Resume.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
      if (remainingResume) {
        remainingResume.isPrimary = true;
        await remainingResume.save();
      }
    }

    res.json({
      success: true,
      message: "Resume deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "DELETE_RESUME_FAILED",
        message: "Failed to delete resume.",
      },
    });
  }
};

/**
 * @route   POST /api/candidate/resumes/:id/duplicate
 * @desc    Duplicate an existing resume as a new document (enforcing max 5 resumes limit)
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const duplicateResume = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check limit
    const existingCount = await Resume.countDocuments({ user: userId });
    if (existingCount >= MAX_RESUMES_PER_USER) {
      return res.status(400).json({
        success: false,
        error: {
          code: "RESUME_LIMIT_REACHED",
          message: `You can have up to ${MAX_RESUMES_PER_USER} resumes. Please delete an existing resume to duplicate.`,
        },
      });
    }

    const sourceResume = await Resume.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!sourceResume) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESUME_NOT_FOUND",
          message: "Source resume not found or you do not have permission to duplicate it.",
        },
      });
    }

    // Clean duplicate title formatting
    let newTitle = `${sourceResume.title} (Copy)`;
    if (newTitle.length > 100) {
      newTitle = newTitle.substring(0, 93) + " (Copy)";
    }

    const sourceObj = sourceResume.toObject();
    const duplicatedContent = sourceObj.content ? JSON.parse(JSON.stringify(sourceObj.content)) : getDefaultContent();

    const duplicatedResume = await Resume.create({
      user: userId,
      title: newTitle,
      template: sourceResume.template,
      status: "DRAFT",
      source: "DUPLICATE",
      isPrimary: false,
      version: 1,
      content: duplicatedContent,
    });

    res.status(201).json({
      success: true,
      message: "Resume duplicated successfully.",
      data: duplicatedResume,
    });
  } catch (error) {
    console.error("Error duplicating resume:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "DUPLICATE_RESUME_FAILED",
        message: "Failed to duplicate resume.",
      },
    });
  }
};

/**
 * @route   PATCH /api/candidate/resumes/:id/primary
 * @desc    Set the specified resume as the single primary resume for candidate
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const setPrimaryResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const resumeId = req.params.id;

    const targetResume = await Resume.findOne({
      _id: resumeId,
      user: userId,
    });

    if (!targetResume) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESUME_NOT_FOUND",
          message: "Resume not found or you do not have permission to set it as primary.",
        },
      });
    }

    // Unset primary flag on all resumes for this user
    await Resume.updateMany({ user: userId, isPrimary: true }, { $set: { isPrimary: false } });

    // Set target as primary
    targetResume.isPrimary = true;
    await targetResume.save();

    res.json({
      success: true,
      message: "Primary resume updated successfully.",
      data: targetResume,
    });
  } catch (error) {
    console.error("Error setting primary resume:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SET_PRIMARY_FAILED",
        message: "Failed to set primary resume.",
      },
    });
  }
};

/**
 * @route   PUT /api/candidate/resumes/:id/content
 * @desc    Update structured resume content (increments version, enforces <40KB payload bound & mass assignment guard)
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const updateResumeContent = async (req, res) => {
  try {
    const userId = req.user._id;
    const resumeId = req.params.id;

    // 1. Strict ownership verification
    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESUME_NOT_FOUND",
          message: "Resume not found or you do not have permission to modify it.",
        },
      });
    }

    // 2. Validate request body presence
    if (!req.body || typeof req.body !== "object" || req.body.content === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: "RESUME_CONTENT_INVALID",
          message: "Missing 'content' object in request body.",
        },
      });
    }

    const rawContent = req.body.content;

    // 3. Payload size check (< 40 KB)
    const contentBytes = Buffer.byteLength(JSON.stringify(rawContent), "utf8");
    if (contentBytes > MAX_CONTENT_SIZE_BYTES) {
      return res.status(400).json({
        success: false,
        error: {
          code: "RESUME_CONTENT_TOO_LARGE",
          message: `Resume content size (${(contentBytes / 1024).toFixed(1)} KB) exceeds the maximum allowed limit of 40 KB.`,
        },
      });
    }

    // 4. Validate & sanitize content
    const validationResult = validateContentPayload(rawContent);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: "RESUME_CONTENT_INVALID",
          message: validationResult.message,
        },
      });
    }

    // 5. Mass-assignment defense: Only assign validated content (ignore client user, isPrimary, version, status, _id)
    resume.content = validationResult.sanitizedContent;
    // Increment version upon successful server write
    resume.version = (resume.version || 1) + 1;

    await resume.save();

    res.json({
      success: true,
      message: "Resume content saved successfully.",
      data: resume,
    });
  } catch (error) {
    console.error("Error updating resume content:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: {
          code: "RESUME_CONTENT_INVALID",
          message: error.message,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: "UPDATE_CONTENT_FAILED",
        message: "Failed to update resume content.",
      },
    });
  }
};

/**
 * @route   PATCH /api/candidate/resumes/:id/template
 * @desc    Update resume layout template without altering content
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const updateResumeTemplate = async (req, res) => {
  try {
    const userId = req.user._id;
    const resumeId = req.params.id;

    // Strict ownership verification
    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESUME_NOT_FOUND",
          message: "Resume not found or you do not have permission to modify it.",
        },
      });
    }

    const { template } = req.body || {};
    if (!template || !VALID_TEMPLATES.includes(template)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TEMPLATE",
          message: `Template must be one of: ${VALID_TEMPLATES.join(", ")}`,
        },
      });
    }

    resume.template = template;
    await resume.save();

    res.json({
      success: true,
      message: "Template updated successfully.",
      data: resume,
    });
  } catch (error) {
    console.error("Error updating resume template:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "UPDATE_TEMPLATE_FAILED",
        message: "Failed to update resume template.",
      },
    });
  }
};

/**
 * @route   POST /api/candidate/resumes/:id/import-profile
 * @desc    Snapshot copy candidate profile data into resume content (sets source=PROFILE_IMPORT and increments version)
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const importProfileToResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const resumeId = req.params.id;

    // 1. Strict ownership verification
    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESUME_NOT_FOUND",
          message: "Resume not found or you do not have permission to import profile into it.",
        },
      });
    }

    // 2. Fetch CandidateProfile
    const profile = await CandidateProfile.findOne({ user: userId }).lean();
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "Candidate profile not found. Please create your profile before importing.",
        },
      });
    }

    // 3. Deep-copy and map profile data into independent snapshot
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || req.user.name || "";

    const snapshotContent = {
      personal: {
        fullName,
        headline: profile.headline || "",
        email: req.user.email || "",
        phone: profile.phone || "",
        city: profile.city || "",
        state: profile.state || "",
        country: "India",
        linkedin: profile.socialLinks?.linkedin || "",
        github: profile.socialLinks?.github || "",
        portfolio: profile.socialLinks?.portfolio || "",
        website: profile.socialLinks?.website || "",
      },
      summary: profile.professionalSummary || "",
      experience: (profile.experience || []).slice(0, 15).map((exp) => ({
        company: exp.company || "",
        role: exp.role || "",
        location: exp.location || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || (exp.currentlyWorking ? "Present" : ""),
        isCurrent: Boolean(exp.currentlyWorking),
        description: exp.description || "",
        bulletPoints: exp.description
          ? exp.description
              .split("\n")
              .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
              .filter(Boolean)
              .slice(0, 10)
          : [],
      })),
      education: (profile.education || []).slice(0, 8).map((edu) => ({
        institution: edu.institution || "",
        degree: edu.degree || "",
        fieldOfStudy: edu.fieldOfStudy || "",
        location: "",
        startDate: edu.startDate || "",
        endDate: edu.endDate || "",
        grade: edu.grade || "",
        description: "",
      })),
      skills: (profile.skills || []).slice(0, 40).map((skill) => {
        if (typeof skill === "string") {
          return { name: skill.trim(), category: "Other", level: "" };
        }
        return {
          name: skill.name || "",
          category: VALID_SKILL_CATEGORIES.includes(skill.category) ? skill.category : "Other",
          level: VALID_SKILL_LEVELS.includes(skill.level) ? skill.level : "",
        };
      }),
      projects: (profile.projects || []).slice(0, 12).map((proj) => ({
        title: proj.title || "",
        subtitle: "",
        technologies: Array.isArray(proj.technologies) ? proj.technologies.slice(0, 10) : [],
        url: proj.url || "",
        repoUrl: "",
        startDate: "",
        endDate: "",
        description: proj.description || "",
        bulletPoints: proj.description
          ? proj.description
              .split("\n")
              .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
              .filter(Boolean)
              .slice(0, 10)
          : [],
      })),
      certifications: (profile.certifications || []).slice(0, 15).map((cert) => ({
        name: cert.name || "",
        issuer: cert.issuer || "",
        issueDate: cert.issueDate || "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: cert.credentialUrl || "",
      })),
      achievements: (profile.achievements || []).slice(0, 10).map((ach) => {
        if (typeof ach === "string") {
          return { title: ach.trim(), description: "", date: "" };
        }
        return {
          title: ach.title || "",
          description: ach.description || "",
          date: ach.date || "",
        };
      }),
      languages: (profile.languages || []).slice(0, 8).map((lang) => ({
        name: lang.language || lang.name || "",
        proficiency: VALID_LANG_PROFICIENCIES.includes(lang.proficiency) ? lang.proficiency : "Fluent",
      })),
      customSections: resume.content?.customSections || [],
      sectionOrder: resume.content?.sectionOrder && resume.content.sectionOrder.length > 0
        ? resume.content.sectionOrder
        : [...CANONICAL_SECTION_IDS],
      sectionVisibility: resume.content?.sectionVisibility
        ? (resume.content.sectionVisibility instanceof Map ? Object.fromEntries(resume.content.sectionVisibility) : resume.content.sectionVisibility)
        : getDefaultContent().sectionVisibility,
      styling: resume.content?.styling || getDefaultContent().styling,
    };

    // 4. Validate snapshot content
    const validationResult = validateContentPayload(snapshotContent);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: "RESUME_CONTENT_INVALID",
          message: `Imported profile data validation failed: ${validationResult.message}`,
        },
      });
    }

    // 5. Apply snapshot to resume (preserving existing resume metadata: title, template, isPrimary, status)
    resume.content = validationResult.sanitizedContent;
    resume.source = "PROFILE_IMPORT";
    resume.version = (resume.version || 1) + 1;

    await resume.save();

    res.json({
      success: true,
      message: "Profile imported into resume successfully.",
      data: resume,
    });
  } catch (error) {
    console.error("Error importing profile to resume:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "IMPORT_PROFILE_FAILED",
        message: "Failed to import candidate profile data.",
      },
    });
  }
};

/**
 * @desc    Analyze a candidate's resume content deterministically
 * @route   GET /api/candidate/resumes/:id/analyze
 * @access  Private (JOB_SEEKER, ADMIN)
 */
const analyzeResumeHandler = async (req, res) => {
  try {
    const { analyzeResume } = require("../services/resumeAnalyzer/analyzeResume");

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESUME_NOT_FOUND",
          message: "Resume not found.",
        },
      });
    }

    const analysis = analyzeResume(resume);

    return res.json({
      success: true,
      message: "Resume analyzed successfully.",
      data: analysis,
    });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "RESUME_ANALYSIS_FAILED",
        message: "An error occurred while analyzing the resume.",
      },
    });
  }
};

module.exports = {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
  setPrimaryResume,
  updateResumeContent,
  updateResumeTemplate,
  importProfileToResume,
  analyzeResumeHandler,
  validateContentPayload,
  getDefaultContent,
};


