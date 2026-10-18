# JobPortal 2.0 — Phase 4: Staged Implementation Plan

**Status:** Planned / Architecture Review  
**Version:** 2.0.0  
**Target:** Staged Rollout from Phase 4A to Phase 4I  
**Author:** Staff Project & Technical Lead  

---

## 1. Staged Execution Overview

To maintain absolute system stability, zero regressions on Phase 1–3, and allow granular verification at every checkpoint, Phase 4 is partitioned into **9 controlled stages (4A through 4I)**:

```
[Phase 4A: Profile & Dashboard] ──> [Phase 4B: Resume Hub] ──> [Phase 4C: Resume Builder]
                                                                        │
[Phase 4F: Skill & Gap Engine]  <── [Phase 4E: Resume Analyzer] <── [Phase 4D: PDF Engine]
       │
       ▼
[Phase 4G: Job Match Engine]   ──> [Phase 4H: App Tracker] ──> [Phase 4I: QA & Final Polish]
```

---

## 2. Stage Breakdown

### Stage 4A: Candidate Profile Workspace + Master Dashboard
- **Objective**: Establish master `CandidateProfile` data model, profile CRUD endpoints with dynamic completion percentage calculation, and the candidate overview dashboard.
- **Backend**:
  - Create [`server/models/CandidateProfile.js`](file:///C:/Users/Ayush/JobPortal/server/models/CandidateProfile.js).
  - Create [`server/controllers/candidateProfileController.js`](file:///C:/Users/Ayush/JobPortal/server/controllers/candidateProfileController.js).
  - Create candidate route group [`server/routes/candidateRoutes.js`](file:///C:/Users/Ayush/JobPortal/server/routes/candidateRoutes.js).
- **Frontend**:
  - Create [`client/src/pages/candidate/CandidateDashboard.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/pages/candidate/CandidateDashboard.jsx).
  - Create [`client/src/pages/candidate/CandidateProfile.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/pages/candidate/CandidateProfile.jsx) with multi-section tabs.
  - Add nested candidate routes in [`client/src/App.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/App.jsx).
- **Verification**: Profile update triggers dynamic completion percentage update; dashboard displays real application and profile metrics without errors.

---

### Stage 4B: Resume Management Hub
- **Objective**: Provide multi-resume CRUD operations (create, view, duplicate, rename, delete, set primary) with ATS score badges.
- **Backend**:
  - Create [`server/models/Resume.js`](file:///C:/Users/Ayush/JobPortal/server/models/Resume.js).
  - Create [`server/controllers/resumeController.js`](file:///C:/Users/Ayush/JobPortal/server/controllers/resumeController.js) (CRUD, duplicate, setPrimary).
- **Frontend**:
  - Create [`client/src/pages/candidate/ResumeManagement.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/pages/candidate/ResumeManagement.jsx).
  - Create resume card components, duplicate modal, delete confirmation modal.
- **Verification**: User can create up to 5 resumes, clone existing resumes, switch primary resume, and safely delete resumes.

---

### Stage 4C: Live ATS Resume Builder
- **Objective**: Build split-screen interactive resume builder with live A4 canvas preview and 3 ATS templates (`ATS Classic`, `Modern Split`, `Minimal Tech`).
- **Frontend**:
  - Create [`client/src/pages/candidate/ResumeBuilder.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/pages/candidate/ResumeBuilder.jsx).
  - Create template components:
    - [`client/src/components/resume/templates/ATSClassicTemplate.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/components/resume/templates/ATSClassicTemplate.jsx)
    - [`client/src/components/resume/templates/ModernSplitTemplate.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/components/resume/templates/ModernSplitTemplate.jsx)
    - [`client/src/components/resume/templates/MinimalTechTemplate.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/components/resume/templates/MinimalTechTemplate.jsx)
  - Create section editors (Experience, Education, Skills, Projects, Certifications).
- **Verification**: Editing form controls instantly updates preview canvas with zero input lag; switching templates preserves all state.

---

### Stage 4D: Client-Side PDF Generation Engine
- **Objective**: Implement clean, vector-crisp A4 PDF generation with selectable text and exact print styling.
- **Frontend**:
  - Add CSS print stylesheets with `@page { size: A4 portrait; margin: 12mm 15mm; }`.
  - Add client-side PDF export utility supporting direct browser print and vector PDF capture.
- **Verification**: Generated PDF matches preview exactly, with proper page breaks, no clipped elements, and selectable text.

---

### Stage 4E: Deterministic Resume Analyzer & Scorer
- **Objective**: Implement multi-dimensional resume scoring algorithm (completeness, action verbs, metrics, formatting) with zero fake AI.
- **Backend / Utility**:
  - Create deterministic scoring engine in [`server/services/resumeScoringService.js`](file:///C:/Users/Ayush/JobPortal/server/services/resumeScoringService.js) and frontend analyzer utility.
- **Frontend**:
  - Create [`client/src/pages/candidate/ResumeAnalyzer.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/pages/candidate/ResumeAnalyzer.jsx).
  - Create score gauge, category cards, and actionable suggestions panel.
- **Verification**: Scorer deterministically flags missing sections, counts action verbs, detects metric patterns (`\d+%`, `₹`, `\d+k`), and yields explainable feedback.

---

### Stage 4F: Skill Engine & Skill Gap Analysis
- **Objective**: Build candidate skill catalog and comparative market demand gap analysis against active jobs.
- **Backend**:
  - Create [`server/services/skillAnalysisService.js`](file:///C:/Users/Ayush/JobPortal/server/services/skillAnalysisService.js) to aggregate skill demand from active jobs.
- **Frontend**:
  - Create [`client/src/pages/candidate/SkillGapAnalysis.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/pages/candidate/SkillGapAnalysis.jsx).
- **Verification**: Candidate can compare skills with target roles and view missing technical competencies.

---

### Stage 4G: Explainable Job Matching Engine
- **Objective**: Implement transparent mathematical job affinity algorithm ($40\%$ Skills $+ 25\%$ Exp $+ 15\%$ Loc $+ 10\%$ Mode $+ 10\%$ Type).
- **Backend / Frontend**:
  - Implement `matchCandidateToJob(candidateProfile, job)` in backend service and client utility.
  - Render match badges and breakdown drawers on Job Cards and Job Details page.
- **Verification**: Match percentage accurately reflects profile/job intersections with explicit explanation of matched vs missing criteria.

---

### Stage 4H: Advanced Application Tracking & Saved Jobs
- **Objective**: Enhance application tracking with multi-step status timeline history, withdrawal functionality, and job bookmarking.
- **Backend**:
  - Create [`server/models/SavedJob.js`](file:///C:/Users/Ayush/JobPortal/server/models/SavedJob.js).
  - Extend [`server/models/Application.js`](file:///C:/Users/Ayush/JobPortal/server/models/Application.js) with `statusHistory`.
  - Create bookmark and application management routes.
- **Frontend**:
  - Upgrade [`client/src/pages/candidate/ApplicationTracker.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/pages/candidate/ApplicationTracker.jsx).
  - Create [`client/src/pages/candidate/SavedJobs.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/pages/candidate/SavedJobs.jsx).
- **Verification**: Application timeline displays correct timestamps and stages; bookmarks persist and toggle seamlessly.

---

### Stage 4I: Final QA, Security Gate, Performance & Polish
- **Objective**: Comprehensive cross-browser verification, dark mode review, responsive mobile check, security audit, and build validation.
- **Actions**:
  - Validate JWT RBAC on all new endpoints.
  - Run `npm run build` on frontend and backend syntax checks.
  - Verify WCAG AA contrast and keyboard accessibility.
  - Create `/docs/PHASE_4_STATUS.md` and walkthrough report.

---

## 3. Risk Mitigation & Preconditions

| Risk | Mitigation Strategy |
|---|---|
| **Breaking Existing Applications** | Backward compatibility layer automatically adapts legacy application documents. |
| **Heavy PDF Export Overhead** | Client-side vector rendering avoids Node.js server memory and headless browser bottlenecks. |
| **Data Inconsistency on Profile Edit** | Deterministic completion calculation runs in Mongoose pre-save hook and client validator. |
| **Regressions in Phase 1–3 UI** | Strict reuse of Phase 1 design system components (`Button`, `Card`, `Badge`, `Tabs`, `Modal`, `Alert`). |
