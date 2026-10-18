# Walkthrough — JobPortal 2.0 Phase 4G: Explainable Job Matching Engine

**Phase 4G** delivers a deterministic, explainable, and production-grade **Job Matching Engine** for JobPortal 2.0.

---

## 1. Accomplishments & System Architecture

1. **Deterministic Job Matching Engine (`server/services/jobMatching/`)**:
   - [`jobMatchingConstants.js`](file:///C:/Users/Ayush/JobPortal/server/services/jobMatching/jobMatchingConstants.js): Version `1.0.0`, Categorical match statuses (`STRONG_ALIGNMENT`, `PARTIAL_ALIGNMENT`, `LIMITED_ALIGNMENT`, `INSUFFICIENT_DATA`), Factor evaluation statuses (`MATCHED`, `PARTIAL`, `NOT_MATCHED`, `NOT_EVALUATED`), Factor types (`REQUIRED_SKILL_MATCH`, `PREFERRED_SKILL_MATCH`, `EXPERIENCE_ALIGNMENT`, `WORK_MODE_ALIGNMENT`, `LOCATION_ALIGNMENT`, `CATEGORY_ALIGNMENT`), Experience range statuses (`WITHIN_RANGE`, `BELOW_RANGE`, `ABOVE_RANGE`, `NOT_EVALUATED`), and recommendation priorities.
   - [`matchEvidenceBuilder.js`](file:///C:/Users/Ayush/JobPortal/server/services/jobMatching/matchEvidenceBuilder.js): Builds traceable evidence objects connecting candidate sources (`EXPLICIT_SKILL`, `EXPERIENCE_BULLET`, `PROJECT_TECHNOLOGY`) to job requirement sources (`DECLARED_REQUIREMENT`, `MENTIONED_REQUIREMENT`). Sanitizes candidate personal information (no phone or full address in snippets).
   - [`matchFactorEngine.js`](file:///C:/Users/Ayush/JobPortal/server/services/jobMatching/matchFactorEngine.js): Evaluates all 6 deterministic factors independently:
     - **Required Skills**: Evaluated against candidate profile skills with granular matched/missing/unresolved lists and evidence chains.
     - **Preferred Skills**: Evaluated without penalizing or blocking required skills.
     - **Experience Alignment**: Parses job experience strings (e.g. `2-5 years`, `3+ yrs`, `Fresher`, `Entry Level`) and calculates candidate experience years from resume work experience or candidate profile. Assigns `WITHIN_RANGE`, `BELOW_RANGE`, `ABOVE_RANGE` (never penalizes senior candidates), or `NOT_EVALUATED`.
     - **Work Mode Alignment**: Compares job work mode (`Remote`, `Hybrid`, `On-site`) with candidate's declared preferences.
     - **Location Alignment**: Compares job location with candidate city / preferred locations.
     - **Category Alignment**: Compares job domain with candidate primary industry / skills. Enforces architectural rule: **Category alignment cannot override missing required skills**.
   - [`matchRecommendationEngine.js`](file:///C:/Users/Ayush/JobPortal/server/services/jobMatching/matchRecommendationEngine.js): Generates actionable, explainable suggestions for missing required skills, missing preferred skills, experience gaps, and unconfigured preferences.
   - [`explainableMatchEngine.js`](file:///C:/Users/Ayush/JobPortal/server/services/jobMatching/explainableMatchEngine.js): Orchestrates factor evaluation, computes key highlight bullets, and assigns the overall categorical match status based on strict deterministic rules.
   - [`index.js`](file:///C:/Users/Ayush/JobPortal/server/services/jobMatching/index.js): Master facade orchestrator.

2. **Backend API & Controller**:
   - `server/controllers/jobMatchingController.js`:
     - `getJobMatchHandler`: `GET /api/candidate/jobs/:jobId/match`
     - Authenticated candidate identity derived strictly from `req.user._id`.
     - Protected by `requireAuth` and `requireRole("JOB_SEEKER", "ADMIN")`.
     - Recruiter role explicitly blocked with 403 Forbidden.
     - IDOR protection: Candidate profile and resumes are queried strictly with `{ user: req.user._id }`.
   - `server/routes/candidateRoutes.js`:
     - Mounted `GET /jobs/:jobId/match` with authentication and role middleware.

3. **Frontend UI Components & Dedicated Explanation Page**:
   - [`client/src/components/job-matching/MatchFactorCard.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/components/job-matching/MatchFactorCard.jsx): Visual factor card with status badge, score summary, details, and expandable evidence chains.
   - [`client/src/components/job-matching/MatchEvidence.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/components/job-matching/MatchEvidence.jsx): Traceable evidence renderer showing candidate vs job sources.
   - [`client/src/components/job-matching/SkillMatchBreakdown.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/components/job-matching/SkillMatchBreakdown.jsx): Required vs Preferred skill cards with evidence popovers and unresolved tags.
   - [`client/src/components/job-matching/MatchRecommendationList.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/components/job-matching/MatchRecommendationList.jsx): Actionable recommendations prioritized by priority and category.
   - [`client/src/components/job-matching/JobMatchExplanation.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/components/job-matching/JobMatchExplanation.jsx): Complete explainable dashboard with summary banner, 6 factor cards, skill breakdown, and recommendation list.
   - [`client/src/pages/candidate/JobMatchPage.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/pages/candidate/JobMatchPage.jsx): Dedicated match explanation page accessible from job listings and job details.
   - [`client/src/pages/JobDetailsPage.jsx`](file:///C:/Users/Ayush/JobPortal/client/src/pages/JobDetailsPage.jsx): Integrated "Check Alignment" CTAs in top hero action bar, skills tab, and position snapshot sidebar.
   - Mounted route `/candidate/jobs/:jobId/match` in `client/src/App.jsx`.
   - Added `api.getJobMatch(jobId, token)` in `client/src/api/api.js`.

---

## 2. Verification & Automated Test Results

### 2.1 Phase 4G Automated Test Suite
- **Location**: `scratch/test_phase_4g_job_matching.js`
- **Result**: **37 / 37 PASSED (100%)**
- **Verified**:
  - Required skills full match, partial match, and no match evaluation
  - Unresolved non-canonical requirements handling
  - Preferred / mentioned skills evaluation without required factor interference
  - Experience below range, within range, and above range evaluation
  - Experience missing evaluation (`NOT_EVALUATED` without guessing)
  - Work mode match, mismatch, and missing preference evaluation
  - Location match, mismatch, and missing preference evaluation
  - Category alignment evaluation
  - Invariant: Category alignment cannot override missing required skills
  - Strong, Partial, Limited, and Insufficient Data status assignment
  - Exact determinism across repeated executions
  - Strict Rule: Zero numeric match score in payload
  - Strict Rule: Zero hiring probability or success rate in payload
  - Strict Rule: Zero AI confidence score in payload
  - Authenticated user ID binding (`req.user._id`)
  - IDOR protection on candidate profiles and resumes
  - Role-based access control (403 for recruiters)
  - 400 Bad Request on invalid job IDs and 404 on missing jobs
  - Evidence privacy protection (no leaked phone numbers or full addresses)
  - Actionable recommendation generation
  - Phase 4F skill intelligence reuse
  - Phase 4E analyzer compatibility
  - Phase 4A-4D experience parser resilience across Indian job formats

### 2.2 Full Regression Test Matrix
| Component / Phase | Test File | Result |
| :--- | :--- | :---: |
| **Phase 4G Explainable Job Matching** | `test_phase_4g_job_matching.js` | **37/37 PASS** |
| **Phase 4F Skill Intelligence** | `test_phase_4f_skill_intelligence.js` | **30/30 PASS** |
| **Phase 4E Resume Analyzer** | `test_phase_4e_analyzer.js` | **29/29 PASS** |
| **Phase 4D PDF Export Engine** | `test_phase_4d_pdf_export.js` | **14/14 PASS** |
| **Phase 4C Content/Security** | `test_phase_4c_controller_suite.js` | **24/24 PASS** |
| **Phase 4B Resume Management** | `test_resume_controller_logic.js` | **12/12 PASS** |
| **Phase 4A Candidate Profile** | `test_controller_logic.js` | **13/13 PASS** |
| **Phase 4A Profile Completion** | `test_profile_completion.js` | **5/5 PASS** |
| **Frontend Production Build** | `npm run build` (Vite) | **PASS (0 errors, 1887 modules)** |
