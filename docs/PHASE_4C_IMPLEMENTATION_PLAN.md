# JobPortal 2.0 — Phase 4C: Staged Implementation Plan

**Status:** Planned / Architecture Review  
**Version:** 2.0.0 (Phase 4C)  
**Target:** Staged Execution Plan (Stages 4C-1 to 4C-13)  
**Author:** Staff Technical Lead  

---

## 1. Staged Execution Overview

To maintain complete codebase stability and facilitate granular testing, Phase 4C is broken into **13 controlled implementation stages**:

```
[4C-1: Content Schema] ──> [4C-2: Backend APIs] ──> [4C-3: Builder Shell]
                                                            │
[4C-6: Skills/Projects] <── [4C-5: Exp/Edu] <── [4C-4: Personal/Summary]
       │
       ▼
[4C-7: Reordering]    ──> [4C-8: Templates]   ──> [4C-9: Live A4 Canvas]
                                                            │
[4C-13: Final QA]      <── [4C-12: Responsive] <── [4C-11: Autosave] <── [4C-10: Profile Import]
```

---

## 2. Stage Breakdown

### Stage 4C-1: Resume Content Schema Extension
- **Objective**: Extend [`server/models/Resume.js`](file:///C:/Users/Ayush/JobPortal/server/models/Resume.js) with embedded `content` subdocument (personal, summary, experience, education, skills, projects, certifications, achievements, languages, customSections, sectionOrder, sectionVisibility, styling).
- **Verification**: Node syntax checks and schema default initialization tests.

### Stage 4C-2: Backend Content REST APIs
- **Objective**: Implement `PUT /:id/content`, `PATCH /:id/template`, `POST /:id/import-profile`, and update `getResumeById` in [`server/controllers/resumeController.js`](file:///C:/Users/Ayush/JobPortal/server/controllers/resumeController.js).
- **Verification**: Integration test verifying content persistence, version incrementing, URL validation, and ownership protection.

### Stage 4C-3: Resume Editor Foundation & Shell Layout
- **Objective**: Create [`client/src/pages/candidate/ResumeBuilder.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/pages/candidate/ResumeBuilder.jsx) and register route `/candidate/resumes/:id/edit` in `App.jsx`.
- **Verification**: Route loads resume data and renders topbar controls and split-screen layout frames.

### Stage 4C-4: Personal Info & Summary Section Editors
- **Objective**: Implement `PersonalSectionEditor.jsx` and `SummaryEditor.jsx`.
- **Verification**: Form fields update state cleanly with character length guidance.

### Stage 4C-5: Experience & Education Section Editors
- **Objective**: Implement `ExperienceEditor.jsx` and `EducationEditor.jsx` with array item additions, deletions, and bullet point managers.
- **Verification**: Multiple roles and degrees can be added, updated, reordered, and removed.

### Stage 4C-6: Skills, Projects, Certifications & Achievements Editors
- **Objective**: Implement `SkillsEditor.jsx`, `ProjectsEditor.jsx`, `CertificationsEditor.jsx`, `AchievementsEditor.jsx`, and `LanguagesEditor.jsx`.
- **Verification**: Interactive skill tags, tech project bullet managers, and credential inputs function smoothly.

### Stage 4C-7: Section Ordering & Visibility Manager
- **Objective**: Implement `SectionOrderManager.jsx` with accessible up/down movement and visibility eye toggles.
- **Verification**: Reordering sections alters the rendered sequence immediately.

### Stage 4C-8: Template Renderer Engine & 3 Visual Layouts
- **Objective**: Create `ATSClassicTemplate.jsx`, `ModernProfessionalTemplate.jsx`, and `MinimalExecutiveTemplate.jsx` under `client/src/components/resume/templates/`.
- **Verification**: Templates render normalized content props with distinct typography and layout structures.

### Stage 4C-9: Live A4 Scale-Accurate Preview Canvas
- **Objective**: Implement `LiveResumePreview.jsx` with zoom scaling controls (75%, 100%, 125%, Fit), A4 aspect ratio ($210\text{ mm} \times 297\text{ mm}$), and page divider guides.
- **Verification**: Keystrokes in editor reflect in preview canvas with sub-16ms latency and zero visual jitter.

### Stage 4C-10: Master Profile Import Action
- **Objective**: Implement client "Import Profile" trigger connecting to `POST /import-profile` with confirmation dialog.
- **Verification**: Profile data populates resume content as an independent snapshot.

### Stage 4C-11: Autosave & Dirty State Management
- **Objective**: Implement 1500ms debounced autosave, visual saving indicators, manual `Ctrl+S` shortcut, and React Router unsaved changes navigation guard.
- **Verification**: Auto-saves after typing stops; alerts user if navigating away with unsaved state.

### Stage 4C-12: Responsive Mobile & Accessibility Polish
- **Objective**: Add mobile segmented toggle (`[Editor]` $\leftrightarrow$ `[Preview]`), full keyboard navigation, accessible labels, and focus rings.
- **Verification**: Usable across mobile viewports (390px, 430px) and tablet (768px).

### Stage 4C-13: Final QA, Security Gate & Regression Testing
- **Objective**: Comprehensive test suite execution, frontend `npm run build`, security checks, and regression verification across Phases 1, 2, 3, 4A, and 4B.
- **Documentation**: Produce `/docs/PHASE_4C_IMPLEMENTATION.md` and walkthrough report.

---

## 3. Downstream Phase Compatibility Matrix

| Downstream Phase | How it Consumes Phase 4C Resume Content |
|---|---|
| **Phase 4D (PDF Export)** | Directly prints or captures the rendered template DOM of `LiveResumePreview` using vector `@page { size: A4 portrait; }`. |
| **Phase 4E (Resume Analyzer)** | Evaluates `content.summary`, `content.experience[].bulletPoints`, and `content.skills` against deterministic scoring rules. |
| **Phase 4F (Skill Gap Engine)** | Extracts `content.skills` to compare against market job requirements. |
| **Phase 4G (Job Matching)** | Computes match affinity between `content.skills` / experience and job postings. |
| **Future AI Copilot** | Reads individual bullet points from `content.experience` to suggest STAR-framework enhancements with candidate approval. |
