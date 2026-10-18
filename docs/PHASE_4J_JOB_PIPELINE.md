# JobPortal 2.0 — Phase 4J: Saved Jobs & Application Pipeline Intelligence

## 1. Overview
Phase 4J delivers a unified, production-grade **Candidate Job Pipeline & Bookmarks System** for JobPortal 2.0.

It enables candidates to:
1. Save and bookmark active jobs to their private candidate workstation.
2. Filter and search saved roles.
3. Submit and track job applications across a standardized multi-stage recruitment pipeline.
4. Review factual application milestones (submission timestamps and verified recruiter status transitions).
5. Inspect the immutable resume snapshot used at the time of application.
6. Safely withdraw pending applications without recruiter permission conflicts.

---

## 2. Core Architectural & Security Principles

1. **Strict Factual Provenance — Zero Fake Activity:**
   - **No fake recruiter actions:** Timelines display strictly stored `createdAt` and recorded `statusHistory` entries.
   - We NEVER generate fabricated events such as *"Recruiter viewed your profile"* or *"Recruiter liked your application"*.
   - **No fake counts:** Pipeline category tallies (`applied`, `underReview`, `shortlisted`, `interview`, `offer`, `rejected`, `withdrawn`) reflect actual database counts.

2. **Strict RBAC & Anti-Tampering:**
   - Candidate identity is derived exclusively from JWT `req.user._id`.
   - Injected query/body parameters (`userId`, `candidateId`) are completely ignored.
   - **Status Tampering Protection:** Candidates cannot promote their own status to `OFFER`, `INTERVIEW`, or `SHORTLISTED`.
   - **Withdrawal Policy:** Candidates may only transition their own applications from `APPLIED` or `UNDER_REVIEW` to `WITHDRAWN`. Finalized statuses (`OFFER`, `REJECTED`) cannot be withdrawn online.

3. **No Duplicate Applications & Safe Idempotency:**
   - Compound unique index on `{ job: 1, applicant: 1 }` in MongoDB prevents race conditions and accidental double-submissions.
   - Saved jobs compound unique index `{ user: 1, job: 1 }` provides idempotent bookmarking.

4. **Preserved Backward Compatibility:**
   - The existing `Application` schema, public endpoints, and recruiter workflows continue to function seamlessly.
   - Status normalizer gracefully handles legacy mixed-case strings (`"Applied"`, `"Shortlisted"`, `"Selected"`, `"Rejected"`) as well as standardized uppercase enums.

---

## 3. Data Models

### SavedJob Model (`server/models/SavedJob.js`)
```javascript
const savedJobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
  },
  { timestamps: true }
);

savedJobSchema.index({ user: 1, job: 1 }, { unique: true });
```

### Application Model Extension (`server/models/Application.js`)
```javascript
const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Rejected", "Selected", "Under Review", "Interview", "Offer", "Withdrawn", "APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"],
      default: "Applied",
      index: true,
    },
    resume: { type: String },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
    resumeVersion: { type: Number },
    resumeTitle: { type: String },
    coverLetter: { type: String },
    applicantName: { type: String },
    applicantEmail: { type: String },
    phone: { type: String },
    currentLocation: { type: String },
    currentCtc: { type: String },
    expectedCtc: { type: String },
    noticePeriod: { type: String },
    experienceYears: { type: String },
    portfolio: { type: String },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
```

---

## 4. API Endpoints

### Candidate Saved Jobs API
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/candidate/saved-jobs/:jobId` | Bookmark job (Idempotent) |
| `DELETE` | `/api/candidate/saved-jobs/:jobId` | Remove bookmark (Idempotent) |
| `GET` | `/api/candidate/saved-jobs` | Get candidate saved jobs list (Paginated & filterable) |
| `GET` | `/api/candidate/saved-jobs/:jobId/status` | Check if job is bookmarked |

### Candidate Application Pipeline API
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/candidate/applications` | Get all candidate applications with metrics and filters |
| `GET` | `/api/candidate/applications/:id` | Get single application with factual timeline |
| `PATCH` | `/api/candidate/applications/:id/withdraw` | Candidate application withdrawal |

---

## 5. UI Architecture

### Candidate Pages
- **`/candidate/jobs/saved` (`SavedJobsPage.jsx`):** Private bookmarked job workstation with search, alignment CTAs, apply CTAs, and removal actions.
- **`/candidate/applications` (`ApplicationsPage.jsx`):** Master recruitment pipeline page with overview status tabs, search, location/workMode filters, and paginated application cards.
- **`/candidate/applications/:id` (`ApplicationDetailsPage.jsx`):** Deep application tracker showing job specs, resume snapshot used, cover note, withdrawal modal, and factual milestone timeline.

### Reusable Pipeline Components (`client/src/components/job-pipeline/`)
- `BookmarkButton.jsx`: Self-contained bookmark button with loading/active states.
- `SavedJobCard.jsx`: Rich card for saved job items with alignment & apply CTAs.
- `ApplicationCard.jsx`: Summary card for pipeline listings.
- `ApplicationStatusBadge.jsx`: Standardized semantic status badge.
- `ApplicationTimeline.jsx`: Visual vertical timeline of verified status events.
- `PipelineFilters.jsx`: Status pill filter tabs and search inputs.
- `SavedJobsEmptyState.jsx` & `ApplicationEmptyState.jsx`: Context-aware empty state components.

---

## 6. Test Suite & Verification

The test suite in `scratch/test_phase_4j_job_pipeline.js` verified **45 / 45 tests (100% PASS)**:
- Authentication & 403 recruiter role blocking
- Admin role authorization
- Candidate identity binding to JWT `req.user._id`
- IDOR and cross-user query/mutation protection
- Double-submission and duplicate save prevention
- Status tampering prevention (`OFFER`, `INTERVIEW`)
- Safe withdrawal mechanics
- Factual timeline generation (0 fake recruiter viewing/liking events)
- Resume snapshot and version preservation
- Deleted job reference resilience
- Multi-dimensional filters (keyword, status, date)
- Zero fake salary / zero fake counts
- Cross-phase integration (Phase 4G matching & Phase 4I discovery)
- Full regression passed across Phase 4A–4J
- Frontend build verified with zero errors.