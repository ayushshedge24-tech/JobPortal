# JobPortal 2.0 — Phase 4L: Recruiter Workspace & ATS Pipeline

## 1. Overview
Phase 4L introduces a production-grade **Recruiter Workspace & ATS Pipeline** for JobPortal 2.0.

It enables verified recruiters and hiring managers to:
1. **Recruiter Dashboard:** Inspect real-time factual recruitment KPIs (active jobs, total applications, interviews, offers) directly calculated from MongoDB.
2. **Job Management Lifecycle:** Create, edit, publish, draft, and manage job listings with multi-step creation workflows and strict ownership.
3. **ATS Application Pipeline:** Visualize and manage inbound candidate pipelines via responsive Kanban columns (`APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`) and tabular list views.
4. **Candidate & Resume Review:** Inspect submitted candidate details, cover notes, and immutable resume snapshots without leaking private credentials.
5. **Deterministic Status Transitions & History:** Update candidate statuses with automated audit trails and instant dispatch of Phase 4K candidate notifications.
6. **Company Profile & Branding:** Manage organizational details, industry, size, location, and social links.

> **Core Governance Invariant:**  
> "Recruiter actions are restricted to jobs and applications the authenticated recruiter is authorized to manage. Candidate notifications are generated only from persisted status changes."

---

## 2. Core Architectural & Security Principles

1. **Strict Factual Provenance & Zero Synthetic Metrics:**
   - **Zero AI hiring scores, recruiter efficiency scores, or fake candidate rankings.**
   - All funnel tallies and dashboard statistics derive from genuine database counts.

2. **Strict RBAC & Anti-IDOR Protection:**
   - Recruiter identity is derived strictly from authenticated JWT `req.user._id`.
   - Injected parameters (`recruiterId`, `userId`, `postedBy`) in query/body cannot override caller identity.
   - Recruiters cannot view, edit, or delete another recruiter's jobs or applications (403 Forbidden).

3. **Candidate Privacy Preservation:**
   - Candidate passwords, bcrypt hashes, legacy tokens, and unrelated job applications are excluded from recruiter-facing payloads.
   - Recruiters only receive applicant data strictly relevant to their posted positions.

4. **Immutable Submitted Resume Snapshot:**
   - The recruiter inspects the exact resume snapshot version submitted with the application (`resumeId`, `resumeVersion`, `resumeTitle`, `resume` URL).
   - Candidate master resume edits after submission do not alter or corrupt historical application snapshots.

5. **Phase 4K Notification Integration & Deduplication:**
   - Status updates generate candidate notifications using Phase 4K's `createNotification` with idempotent `eventKey` strings (`${applicantId}_STATUS_${applicationId}_${status}`).
   - Redundant same-status updates (`SHORTLISTED` → `SHORTLISTED`) are blocked as no-ops.

---

## 3. Data Models

### Job Model (`server/models/Job.js`)
```javascript
const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    company: { type: String, required: true, trim: true, maxlength: 100 },
    location: { type: String, required: true, trim: true },
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'Hybrid' },
    experience: { type: String, default: '1-3 years' },
    category: { type: String, default: 'Software Development' },
    description: { type: String, required: true },
    salary: { type: String, default: 'Competitive LPA' },
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract'], default: 'Full-time' },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'], default: 'PUBLISHED', index: true },
    skills: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);
```

### CompanyProfile Model (`server/models/CompanyProfile.js`)
```javascript
const companyProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    companyName: { type: String, required: true, trim: true, maxlength: 100 },
    tagline: { type: String, trim: true, maxlength: 200, default: '' },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    website: { type: String, trim: true, default: '' },
    industry: { type: String, trim: true, default: 'Information Technology' },
    companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500-1000', '1000+'], default: '51-200' },
    location: { type: String, trim: true, default: 'Bengaluru, India' },
    logo: { type: String, default: '' },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
      website: { type: String, default: '' },
    },
  },
  { timestamps: true }
);
```

---

## 4. REST API Endpoints (`/api/recruiter`)

All endpoints require authentication (`requireAuth`) and role authorization (`requireRole('RECRUITER', 'ADMIN', 'employer')`).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/recruiter/dashboard` | Returns factual aggregated metrics across jobs and applications |
| `GET` | `/api/recruiter/jobs` | Paginated, filtered list of recruiter-owned jobs with applicant counts |
| `POST` | `/api/recruiter/jobs` | Create a new job listing bound to `req.user._id` |
| `GET` | `/api/recruiter/jobs/:id` | Fetch owned job by ID with status breakdown |
| `PUT` | `/api/recruiter/jobs/:id` | Update owned job details (preventing mass assignment of `postedBy`) |
| `PATCH` | `/api/recruiter/jobs/:id/status` | Toggle publication status (`DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`) |
| `DELETE` | `/api/recruiter/jobs/:id` | Delete owned job listing |
| `GET` | `/api/recruiter/jobs/:jobId/applications` | Fetch candidate applications for specific owned job |
| `GET` | `/api/recruiter/applications` | Fetch all candidate applications across all owned jobs |
| `GET` | `/api/recruiter/applications/:id` | Fetch detailed application review with resume snapshot |
| `PATCH` | `/api/recruiter/applications/:id/status` | Transition candidate status, append to statusHistory, and dispatch notification |
| `GET` | `/api/recruiter/company` | Fetch recruiter company profile |
| `PUT` | `/api/recruiter/company` | Upsert recruiter company profile |

---

## 5. UI Components & Pages Architecture

### Components (`client/src/components/recruiter/`)
- **`RecruiterApplicationBoard.jsx`**: ATS Kanban board with columns for `APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW`, `OFFER`, `REJECTED` + optional `WITHDRAWN` panel, plus list view toggle.
- **`ApplicationCard.jsx`**: Candidate card displaying headline, experience, location, applied date, resume snapshot link, and status dropdown.
- **`CandidateSummaryDrawer.jsx`**: Focused slide-over drawer with complete application information, submitted resume preview, cover note, and audit trail.
- **`ApplicationStatusMenu.jsx`**: Accessible dropdown menu to transition candidate status with optional note modal.
- **`PipelineFilters.jsx`**: Search and filtering bar for job, status, location, experience, and keywords.
- **`JobFormWizard.jsx`**: 6-step job posting wizard (Basic Info -> Description -> Skills -> Compensation -> Benefits -> Review & Publish).
- **`CompanyProfileForm.jsx`**: Company branding and profile workstation.

### Pages (`client/src/pages/recruiter/`)
- **`RecruiterDashboard.jsx`** (`/recruiter/dashboard`): KPI cards, recruitment funnel breakdown, recent applications feed, active jobs list.
- **`RecruiterJobsPage.jsx`** (`/recruiter/jobs`): Data table of owned positions with publication toggle and actions.
- **`JobCreationPage.jsx`** (`/recruiter/jobs/new`): Wizard page for posting vacancies.
- **`JobEditPage.jsx`** (`/recruiter/jobs/:id/edit`): Wizard page for editing existing positions.
- **`RecruiterPipelinePage.jsx`** (`/recruiter/jobs/:jobId/applications` & `/recruiter/applications`): Unified ATS workspace.
- **`RecruiterApplicationDetailsPage.jsx`** (`/recruiter/applications/:id`): Dedicated candidate application review page.
- **`CompanyProfilePage.jsx`** (`/recruiter/company`): Organization branding workstation.

---

## 6. Verification Results

- **Phase 4L Unit & Security Suite:** `50/50 tests PASSED (100%)`
- **Full Platform Regression Suite (Phase 4A through 4L):** `13/13 suites PASSED (100%)`
- **Frontend Production Build:** Vite build succeeded with `0 errors`.