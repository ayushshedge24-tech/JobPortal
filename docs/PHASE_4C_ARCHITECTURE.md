# JobPortal 2.0 — Phase 4C: Professional Resume Builder Architecture

**Status:** Approved Architecture (Final Corrections Applied)  
**Version:** 2.0.0 (Phase 4C)  
**Target:** Live ATS Resume Builder, Schema Evolution, and Template Rendering Engine  
**Author:** Staff Product Architect & Full-Stack Lead  

---

## 1. Executive Summary & Objective

Phase 4C establishes the **Professional Resume Builder** for JobPortal 2.0. It bridges the data layer established in Phase 4B with a responsive split-screen editing workspace, canonical section reordering, live A4 scale-accurate preview canvas, snapshot profile import from `CandidateProfile`, and 3 ATS-optimized visual layout templates (`ATS_CLASSIC`, `MODERN_PROFESSIONAL`, `MINIMAL_EXECUTIVE`).

---

## 2. Core Architectural Principles & Refinements

### 2.1 Single Document Architecture (`Resume.content`)
- **Storage Strategy**: Detailed resume content (personal info, summary, experience array, education array, skills, projects, certifications, achievements, languages, custom sections, section order, visibility flags, styling) is stored in a single structured embedded `content` subdocument inside the `Resume` collection.
- **Atomic Operations**: A single `findByIdAndUpdate` or `save` updates the entire resume atomically without multi-collection transactions.
- **Zero Join Reads**: Fetching a resume for editing or preview requires exactly 1 indexed query (`{ _id: id, user: userId }`) with zero `$lookup` joins.
- **Document Size Bounds**: Strict array bounds and character limits ensure total BSON size remains $< 40$ KB (far below MongoDB's 16 MB limit).

### 2.2 Profile Decoupling & Snapshot Principle
- **`CandidateProfile`**: Master source of truth for the candidate's verified career identity.
- **`Resume.content`**: A self-contained **snapshot / copy** of data customized for a specific job application.
- **Invariance Rule**:
  - Importing profile data copies fields into `Resume.content`.
  - Editing a resume does **not** mutate `CandidateProfile`.
  - Updating `CandidateProfile` does **not** silently overwrite existing resumes.

### 2.3 Canonical Section System
- The platform defines 9 canonical section identifiers:
  ```
  SUMMARY, EXPERIENCE, EDUCATION, SKILLS, PROJECTS,
  CERTIFICATIONS, ACHIEVEMENTS, LANGUAGES, CUSTOM
  ```
- Unknown section IDs are rejected by both backend validation and frontend state managers.
- `sectionOrder` and `sectionVisibility` only operate on these canonical identifiers.

### 2.4 Controlled Skill Representation
- `skill.level` is **optional**.
- If provided, it is restricted to the controlled enum: `["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]`.
- **Zero numeric percentages or fake skill progress bars** are used or rendered.

### 2.5 Styling Security & Parameter Sanitization
- User cannot supply arbitrary CSS strings or injection vectors.
- `primaryColor`: Restricted to a verified 6-digit hex regex (`^#([A-Fa-f0-9]{6})$`) or a controlled curated palette (`["#2563eb", "#0f766e", "#475569", "#7c3aed", "#b91c1c", "#1e293b", "#0d9488"]`).
- `fontSize`: Controlled enum `["SM", "MD", "LG"]`.
- `lineSpacing`: Controlled enum `["COMPACT", "NORMAL", "RELAXED"]`.
- No `url()`, CSS injection, or HTML tags are accepted.

---

## 3. High-Level Subsystem Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                CANDIDATE WORKSTATION (/candidate/resumes/:id/edit)                 |
|                                                                                                    |
|  +---------------------------------------------------+  +----------------------------------------+ |
|  | TOPBAR: Title Edit | Save Status | Template Select|  | Action Bar: [Import Profile] [Save]     | |
|  +---------------------------------------------------+  +----------------------------------------+ |
|  | LEFT PANE: Section Editor Accordion (40% width)   |  | RIGHT PANE: Live A4 Canvas (60% width) | |
|  |                                                   |  |                                        | |
|  |  +-- [Personal & Contact Information]             |  |  +----------------------------------+  | |
|  |  +-- [Professional Summary (Bio)]                 |  |  | Scale: [ 75% | 100% | 125% | Fit ]|  | |
|  |  +-- [Work Experience (Bullets & Metrics)]        |  |  +----------------------------------+  | |
|  |  +-- [Education & Academics]                      |  |  | [ A4 Canvas: 210mm x 297mm ]     |  | |
|  |  +-- [Technical & Soft Skills]                    |  |  |                                  |  | |
|  |  +-- [Featured Projects & Demos]                  |  |  |  ATS Classic / Modern / Minimal  |  | |
|  |  +-- [Certifications & Credentials]              |  |  |  Real-time rendered typography   |  | |
|  |  +-- [Key Achievements & Honors]                  |  |  |  Page-break guides (A4 portrait) |  | |
|  |  +-- [Languages & Custom Sections]                |  |  |                                  |  | |
|  |  +-- [Section Reordering & Visibility Manager]    |  |  +----------------------------------+  | |
|  +---------------------------------------------------+  +----------------------------------------+ |
+---------------------------------------------------+------------------------------------------------+
                                                    | (REST APIs: PUT /content, POST /import-profile)
                                                    v
+----------------------------------------------------------------------------------------------------+
|                                   BACKEND APPLICATION SERVER (EXPRESS)                             |
|                                                                                                    |
|  +-----------------------------------------------------------------------------------------------+ |
|  | Security & Auth Layer: JWT Verification | RBAC (`JOB_SEEKER`, `ADMIN`) | Ownership Assertion  | |
|  +-----------------------------------------------------------------------------------------------+ |
|  | Controllers & Middleware:                                                                     | |
|  | - `resumeController.getResumeById`: Full content retrieval with ownership validation         | |
|  | - `resumeController.updateResumeContent`: Sanitized deep update with payload bounding         | |
|  | - `resumeController.importFromProfile`: Copies master `CandidateProfile` fields into resume   | |
|  | - `resumeController.updateTemplate`: Fast metadata template switcher                          | |
|  +-----------------------------------------------------------------------------------------------+ |
+---------------------------------------------------+------------------------------------------------+
                                                    | Mongoose ODM
                                                    v
+----------------------------------------------------------------------------------------------------+
|                                    MONGODB (RESUME COLLECTION)                                     |
|                                                                                                    |
|  { _id, user, title, template, isPrimary, version, status, content: { personal, experience... } }  |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Frontend Component Breakdown

Divided into modular, single-responsibility components in `client/src/components/resume/`:
- **`ResumeEditor.jsx`**: Main orchestrator & accordion container.
- **`LiveResumePreview.jsx`**: Zoomable A4 viewport & scaling canvas.
- **`SectionOrderManager.jsx`**: Accessible up/down controls & visibility toggles.
- **Section Editors (`editors/`)**:
  - `PersonalSectionEditor.jsx`
  - `SummaryEditor.jsx`
  - `ExperienceEditor.jsx`
  - `EducationEditor.jsx`
  - `SkillsEditor.jsx`
  - `ProjectsEditor.jsx`
  - `CertificationsEditor.jsx`
  - `AchievementsEditor.jsx`
  - `LanguagesEditor.jsx`
  - `CustomSectionEditor.jsx`
- **Templates (`templates/`)**:
  - `ATSClassicTemplate.jsx`
  - `ModernProfessionalTemplate.jsx`
  - `MinimalExecutiveTemplate.jsx`

---

## 5. Versioning & Autosave Strategy

1. **Local Editing**: All form updates occur in client-side state buffer (`useReducer`).
2. **Version Invariant**: Version counter does **not** increment on keystrokes.
3. **Save Trigger**: When user manually clicks Save or the 1500ms debounced autosave fires, a `PUT /content` request is sent.
4. **Server Increment**: The server increments `version = version + 1` upon successfully writing the content payload to the database.
