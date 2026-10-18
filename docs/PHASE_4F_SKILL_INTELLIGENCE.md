# Walkthrough — JobPortal 2.0 Phase 4F: Skill Intelligence Engine

**Phase 4F** delivers a deterministic, explainable, and production-grade **Skill Intelligence Engine** for JobPortal 2.0.

---

## 1. Accomplishments & System Architecture

1. **Centralized Skill Intelligence Architecture (`server/services/skillIntelligence/`)**:
   - [`skillIntelligenceConstants.js`](file:///C:/Users/Ayush/JobPortal/server/services/skillIntelligence/skillIntelligenceConstants.js): Version `1.0.0`, 17 controlled categories (`PROGRAMMING`, `FRONTEND`, `BACKEND`, `DATABASE`, `DATA_ANALYTICS`, `DATA_SCIENCE`, `AI_ML`, `CLOUD`, `DEVOPS`, `CYBERSECURITY`, `MOBILE`, `TESTING`, `UI_UX`, `BUSINESS`, `TOOLS`, `SOFT_SKILLS`, `OTHER`), evidence sources (`EXPLICIT_SKILL`, `EXPERIENCE_BULLET`, `PROJECT_TECHNOLOGY`, `PROJECT_DESCRIPTION`, `PROFILE_DECLARED`), controlled skill levels, and recommendation priorities.
   - [`skillDictionary.js`](file:///C:/Users/Ayush/JobPortal/server/services/skillIntelligence/skillDictionary.js): Comprehensive curated dictionary with fast lookup maps, normalized keys, display names, controlled categories, common aliases, and informational related skills.
   - [`skillNormalizer.js`](file:///C:/Users/Ayush/JobPortal/server/services/skillIntelligence/skillNormalizer.js): Normalizes casing, whitespace, punctuation, and known aliases (`reactjs` -> `React`, `postgres` -> `PostgreSQL`, `powerbi` -> `Power BI`). Preserves unmapped skills as `category: OTHER, normalized: false`. De-duplicates while maintaining deterministic order.
   - [`skillCategorizer.js`](file:///C:/Users/Ayush/JobPortal/server/services/skillIntelligence/skillCategorizer.js): Maps freeform and legacy category inputs to controlled enum values.
   - [`skillExtractor.js`](file:///C:/Users/Ayush/JobPortal/server/services/skillIntelligence/skillExtractor.js): Distinguishes explicit skills from mentioned skills in experience bullets and project technologies/descriptions. Enforces rule: **NEVER infer skill levels** (`Python` without level remains `NOT_SPECIFIED`).
   - [`candidateSkillProfile.js`](file:///C:/Users/Ayush/JobPortal/server/services/skillIntelligence/candidateSkillProfile.js): Compiles candidate-wide skill intelligence profile on demand with metrics, category groupings, and alias detection logs.
   - [`jobSkillExtractor.js`](file:///C:/Users/Ayush/JobPortal/server/services/skillIntelligence/jobSkillExtractor.js): Extracts declared skill requirements from `Job.skills` and mentioned requirements from `Job.description`/`title`/`category`.
   - [`skillGapAnalyzer.js`](file:///C:/Users/Ayush/JobPortal/server/services/skillIntelligence/skillGapAnalyzer.js): Evaluates job requirements against candidate profile into `MATCHED`, `MISSING`, and `UNRESOLVED`. Strictly **ZERO fake percentage match scores**.
   - [`recommendationEngine.js`](file:///C:/Users/Ayush/JobPortal/server/services/skillIntelligence/recommendationEngine.js): Generates explainable, category-grouped learning recommendations for missing job skills prioritized by `HIGH`, `MEDIUM`, `LOW`.
   - [`index.js`](file:///C:/Users/Ayush/JobPortal/server/services/skillIntelligence/index.js): Master facade orchestrator.

2. **Backend API & Controllers**:
   - `server/controllers/skillIntelligenceController.js`:
     - `getCandidateSkillsHandler`: `GET /api/candidate/skills`
     - `getResumeSkillsHandler`: `GET /api/candidate/resumes/:id/skills`
     - `getResumeSkillGapHandler`: `GET /api/candidate/resumes/:resumeId/skills/gap/:jobId`
   - Strict RBAC (`JOB_SEEKER`, `ADMIN`) and IDOR protection `{ _id: resumeId, user: req.user._id }`. Blocked recruiters.

3. **Frontend UI & Interactive Workspace**:
   - `client/src/pages/candidate/SkillIntelligence.jsx`:
     - Overview metrics (Total normalized skills, Categories represented, Declared levels, Unspecified levels).
     - Skills by Category tab with category filter pills and expandable evidence snippets.
     - Normalization Transparency tab showing exact alias resolutions (`reactjs` -> `React`).
     - Target Job Skill Gap Engine tab allowing candidates to select any active job and audit Matched, Missing, and Unresolved skills with category-grouped recommendations.
   - Mounted routes `/candidate/skills` and `/candidate/resumes/:id/skills` in `client/src/App.jsx`.
   - Added "Skills" navigation button in `ResumeManagement.jsx` cards and `CandidateDashboard.jsx` quick links.

---

## 2. Verification & Automated Test Results

### 2.1 Phase 4F Automated Test Suite
- **Location**: `scratch/test_phase_4f_skill_intelligence.js`
- **Result**: **30 / 30 PASSED (100%)**
- **Verified**:
  - Python, JS, React, PostgreSQL, Power BI normalization
  - Duplicate collapse with deterministic ordering
  - Unknown skill preservation
  - Explicit vs mentioned skill extraction & multi-source evidence
  - Level preservation & strict rejection of level inference
  - Candidate profile generation & alias logging
  - Job skill extraction & requirement type separation
  - Matched, missing, and unresolved skills categorization
  - Related skills distinction (`RELATED != POSSESSED`)
  - Deterministic recommendation generation
  - Empty resume and malformed inputs resilience
  - Controller IDOR, unauthenticated 401, and recruiter 403 protection
  - Verification that NO percentage match or score fields exist

### 2.2 Full Regression Test Suite
| Component / Phase | Test File | Result |
| :--- | :--- | :---: |
| **Phase 4F Skill Intelligence** | `test_phase_4f_skill_intelligence.js` | **30/30 PASS** |
| **Phase 4E Resume Analyzer** | `test_phase_4e_analyzer.js` | **29/29 PASS** |
| **Phase 4D PDF Export Engine** | `test_phase_4d_pdf_export.js` | **14/14 PASS** |
| **Phase 4C Content/Security** | `test_phase_4c_controller_suite.js` | **24/24 PASS** |
| **Phase 4B Resume Management** | `test_resume_controller_logic.js` | **12/12 PASS** |
| **Phase 4A Candidate Profile** | `test_controller_logic.js` | **13/13 PASS** |
| **Phase 4A Profile Completion** | `test_profile_completion.js` | **5/5 PASS** |
| **Frontend Production Build** | `npm run build` (Vite) | **PASS (0 errors, 1881 modules)** |

---

## 3. Foundation for Phase 4G
The Skill Intelligence Engine is completely decoupled, reusable, and deterministic. It prepares all necessary normalized data structures (`matched`, `missing`, `unresolved`, `candidateProfile`, `jobSkills`) required for the upcoming **Phase 4G — Explainable Job Matching**.
