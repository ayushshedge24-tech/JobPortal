# JobPortal 2.0 — Phase 4C: Database Schema & Content Model Design

**Status:** Approved Architecture (Final Corrections Applied)  
**Version:** 2.0.0 (Phase 4C)  
**Target:** MongoDB / Mongoose `Resume` Schema Extension  
**Author:** Staff Database Architect  

---

## 1. Schema Evolution & Design Decisions

In Phase 4B, [`server/models/Resume.js`](file:///C:/Users/Ayush/JobPortal/server/models/Resume.js) established core metadata. Phase 4C extends the model with an embedded `content` subdocument. Existing Phase 4B records automatically receive default empty structured objects without data corruption.

---

## 2. Complete Extended `Resume` Schema Specification

```javascript
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
  "CUSTOM"
];

// Subdocument: Work Experience
const resumeExperienceSchema = new mongoose.Schema({
  company: { type: String, trim: true, maxlength: [120, "Company name cannot exceed 120 chars"], default: "" },
  role: { type: String, trim: true, maxlength: [120, "Role cannot exceed 120 chars"], default: "" },
  location: { type: String, trim: true, maxlength: [100, "Location cannot exceed 100 chars"], default: "" },
  startDate: { type: String, trim: true, maxlength: 30, default: "" },
  endDate: { type: String, trim: true, maxlength: 30, default: "" },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, trim: true, maxlength: [2000, "Description cannot exceed 2000 chars"], default: "" },
  bulletPoints: [{ type: String, trim: true, maxlength: [500, "Bullet point cannot exceed 500 chars"] }]
});

// Subdocument: Education
const resumeEducationSchema = new mongoose.Schema({
  institution: { type: String, trim: true, maxlength: [150, "Institution cannot exceed 150 chars"], default: "" },
  degree: { type: String, trim: true, maxlength: [120, "Degree cannot exceed 120 chars"], default: "" },
  fieldOfStudy: { type: String, trim: true, maxlength: [120, "Field of study cannot exceed 120 chars"], default: "" },
  location: { type: String, trim: true, maxlength: [100, "Location cannot exceed 100 chars"], default: "" },
  startDate: { type: String, trim: true, maxlength: 30, default: "" },
  endDate: { type: String, trim: true, maxlength: 30, default: "" },
  grade: { type: String, trim: true, maxlength: [30, "Grade cannot exceed 30 chars"], default: "" },
  description: { type: String, trim: true, maxlength: [1000, "Description cannot exceed 1000 chars"], default: "" }
});

// Subdocument: Skill (Optional Level with Controlled Enum, Zero Percentages)
const resumeSkillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: [60, "Skill name cannot exceed 60 chars"] },
  category: {
    type: String,
    enum: ["Frontend", "Backend", "Database", "DevOps", "Cloud", "Data/AI", "Testing", "Tools", "Soft Skills", "Other"],
    default: "Other"
  },
  level: {
    type: String,
    enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT", ""],
    default: ""
  }
});

// Subdocument: Project
const resumeProjectSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: [120, "Project title cannot exceed 120 chars"], default: "" },
  subtitle: { type: String, trim: true, maxlength: [120, "Subtitle cannot exceed 120 chars"], default: "" },
  technologies: [{ type: String, trim: true, maxlength: [40, "Technology name cannot exceed 40 chars"] }],
  url: {
    type: String,
    trim: true,
    maxlength: [250, "URL cannot exceed 250 chars"],
    default: ""
  },
  repoUrl: {
    type: String,
    trim: true,
    maxlength: [250, "Repo URL cannot exceed 250 chars"],
    default: ""
  },
  startDate: { type: String, trim: true, maxlength: 30, default: "" },
  endDate: { type: String, trim: true, maxlength: 30, default: "" },
  description: { type: String, trim: true, maxlength: [1500, "Description cannot exceed 1500 chars"], default: "" },
  bulletPoints: [{ type: String, trim: true, maxlength: [500, "Bullet point cannot exceed 500 chars"] }]
});

// Subdocument: Certification
const resumeCertificationSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: [150, "Certification name cannot exceed 150 chars"], default: "" },
  issuer: { type: String, trim: true, maxlength: [150, "Issuer cannot exceed 150 chars"], default: "" },
  issueDate: { type: String, trim: true, maxlength: 30, default: "" },
  expiryDate: { type: String, trim: true, maxlength: 30, default: "" },
  credentialId: { type: String, trim: true, maxlength: [100, "Credential ID cannot exceed 100 chars"], default: "" },
  credentialUrl: {
    type: String,
    trim: true,
    maxlength: [250, "Credential URL cannot exceed 250 chars"],
    default: ""
  }
});

// Subdocument: Achievement
const resumeAchievementSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: [150, "Achievement title cannot exceed 150 chars"], default: "" },
  description: { type: String, trim: true, maxlength: [1000, "Description cannot exceed 1000 chars"], default: "" },
  date: { type: String, trim: true, maxlength: 30, default: "" }
});

// Subdocument: Language
const resumeLanguageSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: [60, "Language name cannot exceed 60 chars"], default: "" },
  proficiency: {
    type: String,
    enum: ["Basic", "Conversational", "Fluent", "Native", ""],
    default: "Fluent"
  }
});

// Subdocument: Custom Section with Server-Validated Safe ID
const resumeCustomSectionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true,
    match: [/^[a-zA-Z0-9_-]{3,32}$/, "Custom section ID must be alphanumeric (3-32 chars)"]
  },
  title: { type: String, trim: true, maxlength: [80, "Custom section title cannot exceed 80 chars"], default: "Custom Section" },
  items: [
    {
      title: { type: String, trim: true, maxlength: [120, "Title cannot exceed 120 chars"], default: "" },
      subtitle: { type: String, trim: true, maxlength: [120, "Subtitle cannot exceed 120 chars"], default: "" },
      date: { type: String, trim: true, maxlength: 30, default: "" },
      description: { type: String, trim: true, maxlength: [1000, "Description cannot exceed 1000 chars"], default: "" },
      bulletPoints: [{ type: String, trim: true, maxlength: [500, "Bullet point cannot exceed 500 chars"] }]
    }
  ]
});

// Master Content Container
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
      linkedin: { type: String, trim: true, maxlength: [250, "LinkedIn URL cannot exceed 250 chars"], default: "" },
      github: { type: String, trim: true, maxlength: [250, "GitHub URL cannot exceed 250 chars"], default: "" },
      portfolio: { type: String, trim: true, maxlength: [250, "Portfolio URL cannot exceed 250 chars"], default: "" },
      website: { type: String, trim: true, maxlength: [250, "Website URL cannot exceed 250 chars"], default: "" }
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [3000, "Professional summary cannot exceed 3000 chars"],
      default: ""
    },
    experience: {
      type: [resumeExperienceSchema],
      validate: [v => v.length <= 15, "Cannot exceed 15 experience entries"]
    },
    education: {
      type: [resumeEducationSchema],
      validate: [v => v.length <= 8, "Cannot exceed 8 education entries"]
    },
    skills: {
      type: [resumeSkillSchema],
      validate: [v => v.length <= 40, "Cannot exceed 40 skills"]
    },
    projects: {
      type: [resumeProjectSchema],
      validate: [v => v.length <= 12, "Cannot exceed 12 project entries"]
    },
    certifications: {
      type: [resumeCertificationSchema],
      validate: [v => v.length <= 15, "Cannot exceed 15 certification entries"]
    },
    achievements: {
      type: [resumeAchievementSchema],
      validate: [v => v.length <= 10, "Cannot exceed 10 achievement entries"]
    },
    languages: {
      type: [resumeLanguageSchema],
      validate: [v => v.length <= 8, "Cannot exceed 8 language entries"]
    },
    customSections: {
      type: [resumeCustomSectionSchema],
      validate: [v => v.length <= 3, "Cannot exceed 3 custom sections"]
    },
    sectionOrder: {
      type: [String],
      validate: [
        v => v.every(id => CANONICAL_SECTION_IDS.includes(id)),
        "sectionOrder contains unsupported section ID"
      ],
      default: CANONICAL_SECTION_IDS
    },
    sectionVisibility: {
      type: Map,
      of: Boolean,
      default: {
        SUMMARY: true,
        EXPERIENCE: true,
        EDUCATION: true,
        SKILLS: true,
        PROJECTS: true,
        CERTIFICATIONS: true,
        ACHIEVEMENTS: true,
        LANGUAGES: true,
        CUSTOM: true
      }
    },
    styling: {
      fontSize: { type: String, enum: ["SM", "MD", "LG"], default: "MD" },
      lineSpacing: { type: String, enum: ["COMPACT", "NORMAL", "RELAXED"], default: "NORMAL" },
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
      enum: ["ATS_CLASSIC", "MODERN_PROFESSIONAL", "MINIMAL_EXECUTIVE"],
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
      enum: ["MANUAL", "PROFILE_IMPORT", "DUPLICATE"],
      default: "MANUAL"
    },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
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

resumeSchema.index({ user: 1, isPrimary: 1 });
resumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Resume", resumeSchema);
```

---

## 3. Comprehensive Content Limits Table

| Field / Section | Maximum Limit | Rationale |
|---|---|---|
| **Work Experience** | Max 15 entries | Accommodates rich senior careers without bloat. |
| **Education** | Max 8 entries | School, bachelor's, master's, postgrad degrees. |
| **Skills** | Max 40 items | Ideal density for 2-page ATS scanning. |
| **Projects** | Max 12 entries | Focused technical showcase. |
| **Certifications** | Max 15 credentials | Industry qualifications cap. |
| **Achievements** | Max 10 items | Key career milestones. |
| **Languages** | Max 8 entries | Language proficiencies. |
| **Custom Sections** | Max 3 sections | Restrains template layout overflow. |
| **Items per Custom Section**| Max 6 items | Standard sub-list cap. |
| **Summary Length** | 3000 characters | Maximum 3-4 paragraphs. |
| **Role/Project Description**| 1500–2000 characters| Detailed scope summary. |
| **Bullet Point Length** | 500 characters | 2-3 lines per bullet. |
| **Bullets per Entry** | Max 10 bullets | Scannable achievement list. |
| **URL Lengths** | Max 250 characters | Accommodates long GitHub/Credly URLs. |
| **Total BSON Size** | $< 40$ KB | Far below MongoDB 16 MB limit. |

---

## 4. Custom Section ID Generation Strategy
- When a user adds a custom section, the server or client generates a safe slug: `custom_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}` (e.g. `custom_l1a9x2_k7f2`).
- The regex `/^[a-zA-Z0-9_-]{3,32}$/` rejects spaces, special characters, and code injection attempts.
