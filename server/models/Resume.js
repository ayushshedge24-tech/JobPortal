const mongoose = require("mongoose");

const CANONICAL_SECTION_IDS = [
  "SUMMARY",
  "EXPERIENCE",
  "EDUCATION",
  "SKILLS",
  "PROJECTS",
  "CERTIFICATIONS",
  "ACHIEVEMENTS",
  "LANGUAGES",
  "CUSTOM",
];

const VALID_SKILL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Cloud",
  "Data/AI",
  "Testing",
  "Tools",
  "Soft Skills",
  "Other",
];

const VALID_SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT", ""];
const VALID_LANG_PROFICIENCIES = ["Basic", "Conversational", "Fluent", "Native", ""];
const VALID_FONT_SIZES = ["SM", "MD", "LG"];
const VALID_LINE_SPACINGS = ["COMPACT", "NORMAL", "RELAXED"];
const VALID_TEMPLATES = ["ATS_CLASSIC", "MODERN_PROFESSIONAL", "MINIMAL_EXECUTIVE"];
const VALID_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"];
const VALID_SOURCES = ["MANUAL", "PROFILE_IMPORT", "DUPLICATE"];

const isSafeUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== "string") return true;
  const trimmed = urlStr.trim();
  if (trimmed.length === 0) return true;
  if (trimmed.length > 250) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
      return true;
    }
    return false;
  }
};

// Subdocument: Work Experience
const resumeExperienceSchema = new mongoose.Schema(
  {
    company: { type: String, trim: true, maxlength: [120, "Company name cannot exceed 120 chars"], default: "" },
    role: { type: String, trim: true, maxlength: [120, "Role cannot exceed 120 chars"], default: "" },
    location: { type: String, trim: true, maxlength: [100, "Location cannot exceed 100 chars"], default: "" },
    startDate: { type: String, trim: true, maxlength: 30, default: "" },
    endDate: { type: String, trim: true, maxlength: 30, default: "" },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: [2000, "Description cannot exceed 2000 chars"], default: "" },
    bulletPoints: {
      type: [{ type: String, trim: true, maxlength: [500, "Bullet point cannot exceed 500 chars"] }],
      validate: [v => !v || v.length <= 10, "Cannot exceed 10 bullet points per experience"],
      default: () => []
    }
  },
  { _id: true }
);

// Subdocument: Education
const resumeEducationSchema = new mongoose.Schema(
  {
    institution: { type: String, trim: true, maxlength: [150, "Institution cannot exceed 150 chars"], default: "" },
    degree: { type: String, trim: true, maxlength: [120, "Degree cannot exceed 120 chars"], default: "" },
    fieldOfStudy: { type: String, trim: true, maxlength: [120, "Field of study cannot exceed 120 chars"], default: "" },
    location: { type: String, trim: true, maxlength: [100, "Location cannot exceed 100 chars"], default: "" },
    startDate: { type: String, trim: true, maxlength: 30, default: "" },
    endDate: { type: String, trim: true, maxlength: 30, default: "" },
    grade: { type: String, trim: true, maxlength: [30, "Grade cannot exceed 30 chars"], default: "" },
    description: { type: String, trim: true, maxlength: [1000, "Description cannot exceed 1000 chars"], default: "" }
  },
  { _id: true }
);

// Subdocument: Skill (Optional Level with Controlled Enum, Zero Percentages)
const resumeSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Skill name is required"], trim: true, maxlength: [60, "Skill name cannot exceed 60 chars"] },
    category: {
      type: String,
      enum: VALID_SKILL_CATEGORIES,
      default: "Other"
    },
    level: {
      type: String,
      enum: VALID_SKILL_LEVELS,
      default: ""
    }
  },
  { _id: true }
);

// Subdocument: Project
const resumeProjectSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: [120, "Project title cannot exceed 120 chars"], default: "" },
    subtitle: { type: String, trim: true, maxlength: [120, "Subtitle cannot exceed 120 chars"], default: "" },
    technologies: {
      type: [{ type: String, trim: true, maxlength: [40, "Technology name cannot exceed 40 chars"] }],
      default: () => []
    },
    url: {
      type: String,
      trim: true,
      maxlength: [250, "URL cannot exceed 250 chars"],
      validate: [isSafeUrl, "Project URL contains an invalid or disallowed protocol"],
      default: ""
    },
    repoUrl: {
      type: String,
      trim: true,
      maxlength: [250, "Repo URL cannot exceed 250 chars"],
      validate: [isSafeUrl, "Project Repo URL contains an invalid or disallowed protocol"],
      default: ""
    },
    startDate: { type: String, trim: true, maxlength: 30, default: "" },
    endDate: { type: String, trim: true, maxlength: 30, default: "" },
    description: { type: String, trim: true, maxlength: [1500, "Description cannot exceed 1500 chars"], default: "" },
    bulletPoints: {
      type: [{ type: String, trim: true, maxlength: [500, "Bullet point cannot exceed 500 chars"] }],
      validate: [v => !v || v.length <= 10, "Cannot exceed 10 bullet points per project"],
      default: () => []
    }
  },
  { _id: true }
);

// Subdocument: Certification
const resumeCertificationSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: [150, "Certification name cannot exceed 150 chars"], default: "" },
    issuer: { type: String, trim: true, maxlength: [150, "Issuer cannot exceed 150 chars"], default: "" },
    issueDate: { type: String, trim: true, maxlength: 30, default: "" },
    expiryDate: { type: String, trim: true, maxlength: 30, default: "" },
    credentialId: { type: String, trim: true, maxlength: [100, "Credential ID cannot exceed 100 chars"], default: "" },
    credentialUrl: {
      type: String,
      trim: true,
      maxlength: [250, "Credential URL cannot exceed 250 chars"],
      validate: [isSafeUrl, "Credential URL contains an invalid or disallowed protocol"],
      default: ""
    }
  },
  { _id: true }
);

// Subdocument: Achievement
const resumeAchievementSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: [150, "Achievement title cannot exceed 150 chars"], default: "" },
    description: { type: String, trim: true, maxlength: [1000, "Description cannot exceed 1000 chars"], default: "" },
    date: { type: String, trim: true, maxlength: 30, default: "" }
  },
  { _id: true }
);

// Subdocument: Language
const resumeLanguageSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: [60, "Language name cannot exceed 60 chars"], default: "" },
    proficiency: {
      type: String,
      enum: VALID_LANG_PROFICIENCIES,
      default: "Fluent"
    }
  },
  { _id: true }
);

// Subdocument: Custom Section with Server-Validated Safe ID
const resumeCustomSectionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Custom section ID is required"],
      trim: true,
      match: [/^[a-zA-Z0-9_-]{3,32}$/, "Custom section ID must be alphanumeric (3-32 chars)"]
    },
    title: { type: String, trim: true, maxlength: [80, "Custom section title cannot exceed 80 chars"], default: "Custom Section" },
    items: {
      type: [
        {
          title: { type: String, trim: true, maxlength: [120, "Title cannot exceed 120 chars"], default: "" },
          subtitle: { type: String, trim: true, maxlength: [120, "Subtitle cannot exceed 120 chars"], default: "" },
          date: { type: String, trim: true, maxlength: 30, default: "" },
          description: { type: String, trim: true, maxlength: [1000, "Description cannot exceed 1000 chars"], default: "" },
          bulletPoints: {
            type: [{ type: String, trim: true, maxlength: [500, "Bullet point cannot exceed 500 chars"] }],
            validate: [v => !v || v.length <= 10, "Cannot exceed 10 bullet points per item"],
            default: () => []
          }
        }
      ],
      validate: [v => !v || v.length <= 6, "Cannot exceed 6 items per custom section"],
      default: () => []
    }
  },
  { _id: true }
);

// Master Content Container Schema
const resumeContentSchema = new mongoose.Schema(
  {
    personal: {
      fullName: { type: String, trim: true, maxlength: [100, "Full name cannot exceed 100 chars"], default: "" },
      headline: { type: String, trim: true, maxlength: [150, "Headline cannot exceed 150 chars"], default: "" },
      email: { type: String, trim: true, lowercase: true, maxlength: [100, "Email cannot exceed 100 chars"], default: "" },
      phone: { type: String, trim: true, maxlength: [30, "Phone cannot exceed 30 chars"], default: "" },
      city: { type: String, trim: true, maxlength: [80, "City cannot exceed 80 chars"], default: "" },
      state: { type: String, trim: true, maxlength: [80, "State cannot exceed 80 chars"], default: "" },
      country: { type: String, trim: true, maxlength: [80, "Country cannot exceed 80 chars"], default: "India" },
      linkedin: {
        type: String,
        trim: true,
        maxlength: [250, "LinkedIn URL cannot exceed 250 chars"],
        validate: [isSafeUrl, "LinkedIn URL contains an invalid or disallowed protocol"],
        default: ""
      },
      github: {
        type: String,
        trim: true,
        maxlength: [250, "GitHub URL cannot exceed 250 chars"],
        validate: [isSafeUrl, "GitHub URL contains an invalid or disallowed protocol"],
        default: ""
      },
      portfolio: {
        type: String,
        trim: true,
        maxlength: [250, "Portfolio URL cannot exceed 250 chars"],
        validate: [isSafeUrl, "Portfolio URL contains an invalid or disallowed protocol"],
        default: ""
      },
      website: {
        type: String,
        trim: true,
        maxlength: [250, "Website URL cannot exceed 250 chars"],
        validate: [isSafeUrl, "Website URL contains an invalid or disallowed protocol"],
        default: ""
      }
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [3000, "Professional summary cannot exceed 3000 chars"],
      default: ""
    },
    experience: {
      type: [resumeExperienceSchema],
      validate: [v => !v || v.length <= 15, "Cannot exceed 15 experience entries"],
      default: () => []
    },
    education: {
      type: [resumeEducationSchema],
      validate: [v => !v || v.length <= 8, "Cannot exceed 8 education entries"],
      default: () => []
    },
    skills: {
      type: [resumeSkillSchema],
      validate: [v => !v || v.length <= 40, "Cannot exceed 40 skills"],
      default: () => []
    },
    projects: {
      type: [resumeProjectSchema],
      validate: [v => !v || v.length <= 12, "Cannot exceed 12 project entries"],
      default: () => []
    },
    certifications: {
      type: [resumeCertificationSchema],
      validate: [v => !v || v.length <= 15, "Cannot exceed 15 certification entries"],
      default: () => []
    },
    achievements: {
      type: [resumeAchievementSchema],
      validate: [v => !v || v.length <= 10, "Cannot exceed 10 achievement entries"],
      default: () => []
    },
    languages: {
      type: [resumeLanguageSchema],
      validate: [v => !v || v.length <= 8, "Cannot exceed 8 language entries"],
      default: () => []
    },
    customSections: {
      type: [resumeCustomSectionSchema],
      validate: [v => !v || v.length <= 3, "Cannot exceed 3 custom sections"],
      default: () => []
    },
    sectionOrder: {
      type: [String],
      validate: {
        validator: function (v) {
          if (!Array.isArray(v)) return false;
          // No duplicates allowed
          if (new Set(v).size !== v.length) return false;
          // Every ID must be canonical
          return v.every(id => CANONICAL_SECTION_IDS.includes(id));
        },
        message: "sectionOrder contains invalid or duplicate canonical section IDs"
      },
      default: () => [...CANONICAL_SECTION_IDS]
    },
    sectionVisibility: {
      type: Map,
      of: Boolean,
      default: () => ({
        SUMMARY: true,
        EXPERIENCE: true,
        EDUCATION: true,
        SKILLS: true,
        PROJECTS: true,
        CERTIFICATIONS: true,
        ACHIEVEMENTS: true,
        LANGUAGES: true,
        CUSTOM: true
      })
    },
    styling: {
      fontSize: { type: String, enum: VALID_FONT_SIZES, default: "MD" },
      lineSpacing: { type: String, enum: VALID_LINE_SPACINGS, default: "NORMAL" },
      primaryColor: {
        type: String,
        trim: true,
        match: [/^#([A-Fa-f0-9]{6})$/, "primaryColor must be a valid 6-digit hex string (e.g. #2563eb)"],
        default: "#2563eb"
      }
    }
  },
  { _id: false }
);

// Extended Root Resume Schema
const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Resume must belong to a user"],
      index: true
    },
    title: {
      type: String,
      required: [true, "Resume title is required"],
      trim: true,
      maxlength: [100, "Resume title cannot exceed 100 characters"],
      default: "My Resume"
    },
    template: {
      type: String,
      enum: VALID_TEMPLATES,
      default: "ATS_CLASSIC"
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    version: {
      type: Number,
      default: 1,
      min: 1
    },
    source: {
      type: String,
      enum: VALID_SOURCES,
      default: "MANUAL"
    },
    status: {
      type: String,
      enum: VALID_STATUSES,
      default: "ACTIVE"
    },
    content: {
      type: resumeContentSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

// Performance & Lookup Compound Indexes
resumeSchema.index({ user: 1, isPrimary: 1 });
resumeSchema.index({ user: 1, createdAt: -1 });

const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;
module.exports.CANONICAL_SECTION_IDS = CANONICAL_SECTION_IDS;
module.exports.VALID_SKILL_CATEGORIES = VALID_SKILL_CATEGORIES;
module.exports.VALID_SKILL_LEVELS = VALID_SKILL_LEVELS;
module.exports.VALID_LANG_PROFICIENCIES = VALID_LANG_PROFICIENCIES;
module.exports.VALID_FONT_SIZES = VALID_FONT_SIZES;
module.exports.VALID_LINE_SPACINGS = VALID_LINE_SPACINGS;
module.exports.VALID_TEMPLATES = VALID_TEMPLATES;
module.exports.VALID_STATUSES = VALID_STATUSES;
module.exports.VALID_SOURCES = VALID_SOURCES;
module.exports.isSafeUrl = isSafeUrl;

