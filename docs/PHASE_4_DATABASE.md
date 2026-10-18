# JobPortal 2.0 — Phase 4: Database Design & Schema Specifications

**Status:** Planned / Architecture Review  
**Version:** 2.0.0  
**Target:** MongoDB + Mongoose Data Layer  
**Author:** Staff Database & Full-Stack Architect  

---

## 1. Data Modeling Strategy & Normalization Rationale

### 1.1 Separation of Concerns: `User` vs `CandidateProfile` vs `Resume`
To ensure performance, data integrity, and clean separation of concerns, we divide candidate data into three distinct collections:

```
+------------------+         1 : 1          +--------------------------+
|      User        | ---------------------> |     CandidateProfile     |
| (Auth & Identity)|                        | (Master Career Data)     |
+------------------+                        +--------------------------+
         |                                               |
         | 1 : N                                         | (Used as baseline)
         v                                               v
+------------------+         1 : N          +--------------------------+
|    Application   | <--------------------- |          Resume          |
| (Audit History)  |  (Snapshot on Submit)  | (Versioned ATS CVs)      |
+------------------+                        +--------------------------+
```

1. **`User` (Identity & RBAC)**:
   - Contains minimal authentication and account security fields (`name`, `email`, `passwordHash`, `role`, `isVerified`, `isActive`, `lastLoginAt`).
   - Kept lightweight to minimize memory footprint during high-frequency JWT validation and authentication checks.
2. **`CandidateProfile` (Master Career Profile)**:
   - Holds 1:1 relationship with `User` (`user: { type: ObjectId, ref: 'User', unique: true }`).
   - Contains comprehensive career information: Contact details, headline, summary, location/relocation preferences, work experience array, education array, projects, certifications, verified skills, and social links.
   - Calculates dynamic completion percentage deterministically.
3. **`Resume` (Versioned ATS Document Blobs)**:
   - Supports 1:N relationship with `User` (a candidate can maintain up to 5 targeted resumes, e.g. "React Lead", "Full-Stack Node.js", "Engineering Manager").
   - Contains customized structured sections, selected ATS template (`'ats-classic'`, `'modern'`, `'minimal'`), styling preferences, and target role customization.
4. **`SavedJob` (Candidate Bookmarks)**:
   - Supports 1:N relationship with `User` and `Job` with compound unique index (`{ user: 1, job: 1 }`).
   - Enables saving jobs with personal notes and alert flags.
5. **`Application` (Extended Audit Trail)**:
   - Extends existing Phase 2/3 `Application` model to store a `resumeSnapshot` and structured `statusHistory` array without breaking existing records.

---

## 2. Complete Mongoose Schema Definitions

### 2.1 `CandidateProfile` Schema (`server/models/CandidateProfile.js`)

```javascript
const mongoose = require("mongoose");

const experienceSubSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  location: { type: String, trim: true, default: "" },
  workMode: { type: String, enum: ["On-site", "Hybrid", "Remote"], default: "Hybrid" },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, trim: true, maxlength: 2000, default: "" },
  keyAchievements: [{ type: String, trim: true, maxlength: 300 }]
});

const educationSubSchema = new mongoose.Schema({
  degree: { type: String, required: true, trim: true, maxlength: 120 },
  institution: { type: String, required: true, trim: true, maxlength: 150 },
  fieldOfStudy: { type: String, trim: true, maxlength: 120, default: "" },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  grade: { type: String, trim: true, maxlength: 30, default: "" }, // e.g., "8.8 CGPA" or "82%"
  isCurrent: { type: Boolean, default: false }
});

const projectSubSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  role: { type: String, trim: true, maxlength: 100, default: "" },
  summary: { type: String, trim: true, maxlength: 1500, default: "" },
  skillsUsed: [{ type: String, trim: true }],
  liveUrl: { type: String, trim: true, default: "" },
  repoUrl: { type: String, trim: true, default: "" },
  startDate: { type: Date },
  endDate: { type: Date }
});

const certificationSubSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  issuer: { type: String, required: true, trim: true, maxlength: 150 },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date },
  credentialId: { type: String, trim: true, default: "" },
  credentialUrl: { type: String, trim: true, default: "" }
});

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [120, "Headline cannot exceed 120 characters"],
      default: ""
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1500, "Bio cannot exceed 1500 characters"],
      default: ""
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+() -]{7,20}$/, "Please provide a valid phone number"],
      default: ""
    },
    location: {
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "India" }
    },
    preferences: {
      preferredLocations: [{ type: String, trim: true }],
      preferredWorkModes: [{ type: String, enum: ["Remote", "Hybrid", "On-site"] }],
      preferredJobTypes: [{ type: String, enum: ["Full-time", "Part-time", "Internship", "Contract"] }],
      expectedSalaryLPA: { type: Number, min: 0, max: 200 },
      noticePeriodDays: { type: Number, default: 30 }
    },
    totalExperienceYears: {
      type: Number,
      min: 0,
      max: 50,
      default: 0
    },
    skills: [
      {
        name: { type: String, required: true, trim: true },
        category: {
          type: String,
          enum: ["Frontend", "Backend", "Database", "DevOps", "Cloud", "Data/AI", "Testing", "Tools", "Soft Skills", "Other"],
          default: "Other"
        },
        yearsOfExp: { type: Number, min: 0, default: 1 },
        proficiency: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
          default: "Intermediate"
        }
      }
    ],
    experience: [experienceSubSchema],
    education: [educationSubSchema],
    projects: [projectSubSchema],
    certifications: [certificationSubSchema],
    languages: [
      {
        language: { type: String, trim: true, required: true },
        proficiency: { type: String, enum: ["Basic", "Conversational", "Fluent", "Native"], default: "Fluent" }
      }
    ],
    socialLinks: {
      github: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      portfolio: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" }
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    primaryResume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume"
    }
  },
  {
    timestamps: true
  }
);

// Deterministic Profile Completion Calculation Hook
candidateProfileSchema.methods.calculateCompletion = function () {
  let score = 0;
  
  // 1. Personal & Contact (15 pts)
  if (this.phone && this.location?.city) score += 15;
  else if (this.phone || this.location?.city) score += 8;

  // 2. Headline & Bio (10 pts)
  if (this.headline && this.bio && this.bio.length >= 50) score += 10;
  else if (this.headline || this.bio) score += 5;

  // 3. Work Experience (20 pts)
  if (this.experience && this.experience.length >= 1) score += 20;

  // 4. Education (15 pts)
  if (this.education && this.education.length >= 1) score += 15;

  // 5. Skills (15 pts)
  if (this.skills && this.skills.length >= 5) score += 15;
  else if (this.skills && this.skills.length >= 1) score += Math.round((this.skills.length / 5) * 15);

  // 6. Projects (10 pts)
  if (this.projects && this.projects.length >= 1) score += 10;

  // 7. Certifications (5 pts)
  if (this.certifications && this.certifications.length >= 1) score += 5;

  // 8. Social/Portfolio Links (10 pts)
  const linkCount = [this.socialLinks?.github, this.socialLinks?.linkedin, this.socialLinks?.portfolio].filter(Boolean).length;
  if (linkCount >= 2) score += 10;
  else if (linkCount === 1) score += 5;

  this.completionPercentage = Math.min(100, score);
  return this.completionPercentage;
};

candidateProfileSchema.pre("save", function (next) {
  this.calculateCompletion();
  next();
});

// Indexes for fast candidate discovery and aggregation
candidateProfileSchema.index({ "skills.name": 1 });
candidateProfileSchema.index({ totalExperienceYears: 1 });
candidateProfileSchema.index({ "location.city": 1 });
candidateProfileSchema.index({ completionPercentage: -1 });

module.exports = mongoose.model("CandidateProfile", candidateProfileSchema);
```

---

### 2.2 `Resume` Schema (`server/models/Resume.js`)

```javascript
const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Resume title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
      default: "Full Stack Resume"
    },
    template: {
      type: String,
      enum: ["ats-classic", "modern", "minimal"],
      default: "ats-classic"
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    personalInfo: {
      fullName: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, lowercase: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      location: { type: String, trim: true, default: "" },
      headline: { type: String, trim: true, default: "" },
      website: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      github: { type: String, trim: true, default: "" }
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },
    experience: [
      {
        title: { type: String, trim: true, default: "" },
        company: { type: String, trim: true, default: "" },
        location: { type: String, trim: true, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        isCurrent: { type: Boolean, default: false },
        bullets: [{ type: String, trim: true }]
      }
    ],
    education: [
      {
        degree: { type: String, trim: true, default: "" },
        institution: { type: String, trim: true, default: "" },
        location: { type: String, trim: true, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        grade: { type: String, trim: true, default: "" },
        bullets: [{ type: String, trim: true }]
      }
    ],
    skills: [
      {
        category: { type: String, trim: true, default: "Technical Skills" },
        items: [{ type: String, trim: true }]
      }
    ],
    projects: [
      {
        title: { type: String, trim: true, default: "" },
        subtitle: { type: String, trim: true, default: "" },
        link: { type: String, trim: true, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        bullets: [{ type: String, trim: true }]
      }
    ],
    certifications: [
      {
        name: { type: String, trim: true, default: "" },
        issuer: { type: String, trim: true, default: "" },
        issueDate: { type: String, default: "" },
        link: { type: String, trim: true, default: "" }
      }
    ],
    sectionOrder: {
      type: [String],
      default: ["summary", "experience", "education", "skills", "projects", "certifications"]
    },
    sectionVisibility: {
      summary: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      certifications: { type: Boolean, default: true }
    },
    atsScore: {
      overallScore: { type: Number, min: 0, max: 100, default: 0 },
      lastCalculatedAt: { type: Date }
    }
  },
  {
    timestamps: true
  }
);

resumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Resume", resumeSchema);
```

---

### 2.3 `SavedJob` Schema (`server/models/SavedJob.js`)

```javascript
const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate bookmarks per user
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("SavedJob", savedJobSchema);
```

---

### 2.4 Extended `Application` Schema (`server/models/Application.js`)

```javascript
const mongoose = require("mongoose");

const statusHistorySubSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["Applied", "Under Review", "Shortlisted", "Interview", "Offer", "Rejected", "Withdrawn"],
    required: true
  },
  changedAt: { type: Date, default: Date.now },
  note: { type: String, trim: true, maxlength: 500, default: "" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Shortlisted", "Interview", "Offer", "Rejected", "Withdrawn"],
      default: "Applied"
    },
    resume: {
      type: String, // Legacy URL or reference string
      default: ""
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume"
    },
    resumeSnapshot: {
      title: { type: String },
      personalInfo: { type: Object },
      summary: { type: String },
      skills: { type: Array },
      experience: { type: Array },
      education: { type: Array },
      projects: { type: Array }
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: ""
    },
    statusHistory: [statusHistorySubSchema]
  },
  {
    timestamps: true
  }
);

// Prevent duplicate active applications per user/job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);
```

---

## 3. Migration & Backwards Compatibility Plan

1. **Zero Downtime Database Evolution**:
   - `User` model remains unchanged.
   - When a candidate logs in or visits `/candidate/profile`, an upsert (`findOneAndUpdate` with `{ upsert: true }`) automatically creates their default `CandidateProfile` pre-populated with existing `user.name`, `user.email`, `user.phone`, and `user.location`.
2. **Legacy Application Data Preservation**:
   - Existing applications have `resume: String` (URL) and `status: "Applied" | "Shortlisted" | "Rejected" | "Selected"`.
   - The status mapping automatically handles legacy statuses gracefully (`"Selected"` maps to `"Offer"`, `"Applied"` maps to `"Applied"`).
   - If `statusHistory` is empty on legacy applications, virtual fallback synthesizes the initial `Applied` record from `createdAt`.
