# JobPortal 2.0 — Phase 4K: Candidate Notifications & Communication Center

## 1. Overview
Phase 4K implements a production-grade, real-time-ready **Candidate Notifications & Communication Center** for JobPortal 2.0.

It delivers:
1. **Real-time In-App Notification Bell & Popover:** An accessible header widget indicating real unread alerts with quick actions to mark all read or navigate to full notifications.
2. **Dedicated Candidate Notification Center:** Comprehensive `/candidate/notifications` workstation page with filtering by read state (All / Unread) and event category (Applications, Saved Jobs).
3. **Deterministic Event Dispatching:** Automated notification creation on genuine platform lifecycle milestones (Application Submissions, Status Transitions, Withdrawals, Job Bookmarks, Profile Incompletion, Resume Analysis).
4. **Idempotency & Deduplication:** Robust `eventKey` unique/sparse indexing preventing duplicate alerts on network retries or identical status modifications.
5. **Strict Provenance & Zero Synthetic Activity:** Absolute elimination of fake recruiter events (*"Recruiter viewed your profile"*, *"Recruiter is interested"*) or fabricated unread count badges.

---

## 2. Core Architectural & Security Principles

1. **Strict Factual Provenance — Zero Fake Activity:**
   - **Zero Synthetic Recruiter Events:** Notifications are ONLY triggered by verified database updates or explicit candidate actions.
   - **Real Counter Consistency:** Unread counters strictly reflect actual unread documents in MongoDB matching `{ user: req.user._id, isRead: false }`.
   - **Immutable History:** Each notification maintains an accurate timestamp `createdAt` and record of when it was viewed (`readAt`).

2. **Strict RBAC & Anti-IDOR Protection:**
   - Candidate identity is bound to authenticated JWT `req.user._id`.
   - Injected query/body parameters (`userId`, `candidateId`) are completely disregarded.
   - Read mutations (`PATCH /api/candidate/notifications/:id/read` and `PATCH /api/candidate/notifications/read-all`) enforce caller ownership: a candidate can never view, mutate, or mark another user's notifications.

3. **Idempotency via Event Keys:**
   - Notifications carry an optional `eventKey` (e.g., `${userId}_APP_SUBMITTED_${appId}`, `${userId}_STATUS_${appId}_${status}`).
   - MongoDB sparse index on `eventKey` prevents duplicate creation during retries or concurrent status events.

4. **Sanitized Payload Delivery:**
   - Notification messages and metadata only convey authorized candidate-facing details.
   - Recruiter private internal evaluations, salary budgets, and administrative notes are never leaked into candidate notification payloads.

---

## 3. Data Model (`server/models/Notification.js`)

```javascript
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "APPLICATION_SUBMITTED",
        "APPLICATION_STATUS_CHANGED",
        "APPLICATION_WITHDRAWN",
        "JOB_SAVED",
        "PROFILE_INCOMPLETE",
        "RESUME_ANALYSIS_READY",
        "RESUME_UPDATED",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    entityType: {
      type: String,
      enum: ["APPLICATION", "JOB", "RESUME", "PROFILE", "SYSTEM"],
      default: "SYSTEM",
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    eventKey: {
      type: String,
      sparse: true,
      unique: true,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// High-performance compound indexes for user feeds
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });
```

---

## 4. REST API Endpoints (`/api/candidate/notifications`)

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/candidate/notifications` | Candidate / Admin | Paginated list of candidate notifications with optional `unreadOnly=true` and `type` filters |
| `GET` | `/api/candidate/notifications/unread-count` | Candidate / Admin | Accurate tally of unread notifications |
| `PATCH` | `/api/candidate/notifications/:id/read` | Candidate / Admin | Mark a single owned notification as read |
| `PATCH` | `/api/candidate/notifications/read-all` | Candidate / Admin | Mark all unread notifications for the caller as read |

---

## 5. Event Triggers & Integration Points

| Event Trigger | Source File | Payload Description |
|---|---|---|
| **Application Submitted** | `server/routes/applicationRoutes.js` | Emitted when candidate successfully applies for a role. Links to `/candidate/applications/:id`. |
| **Status Changed** | `server/routes/applicationRoutes.js` | Emitted when recruiter updates status (`SHORTLISTED`, `INTERVIEW`, `OFFER`, `REJECTED`). |
| **Application Withdrawn** | `server/controllers/candidateApplicationController.js` | Emitted upon candidate self-service withdrawal. |
| **Job Saved** | `server/controllers/savedJobController.js` | Emitted when candidate bookmarks a job. Links to `/jobs/:id`. |
| **Resume Analysis Ready** | `server/controllers/candidateResumeController.js` | Emitted when resume ATS audit or scoring is updated. |

---

## 6. Frontend Architecture & UI Components

1. **`NotificationBell.jsx`** (`client/src/components/notifications/NotificationBell.jsx`):
   - Header action button with dynamic unread count pill badge.
   - Popover toggle and outside-click dismissal.
   - Periodic 60s background refresh for seamless synchronization.
2. **`NotificationPopover.jsx`** (`client/src/components/notifications/NotificationPopover.jsx`):
   - Compact dropdown displaying the 5 most recent notifications.
   - One-click "Mark all as read" button.
   - Deep links to specific applications, jobs, or the full Notification Center.
3. **`NotificationItem.jsx`** (`client/src/components/notifications/NotificationItem.jsx`):
   - Semantic color-coded icon mapping (Blue for submitted, Amber for shortlisted, Emerald for offer, Violet for saved jobs).
   - Relative time formatting and unread status indicator.
4. **`NotificationFilters.jsx`** (`client/src/components/notifications/NotificationFilters.jsx`):
   - Tabbed quick-filtering (`All`, `Unread`, `Applications`, `Saved Jobs`).
5. **`NotificationsPage.jsx`** (`client/src/pages/candidate/NotificationsPage.jsx`):
   - Full-page candidate workstation view mounted at `/candidate/notifications`.
   - Comprehensive pagination controls, empty state illustrations, and batch read state actions.

---

## 7. Verification & Regression Results

- **Phase 4K Unit & Security Suite:** `40/40 tests PASSED (100%)`
- **Comprehensive Regression Suite (Phase 4A through 4K):` `12/12 suites PASSED (100%)`
  - `test_controller_logic.js` (Phase 4A Profile)
  - `test_profile_completion.js` (Phase 4A Completion)
  - `test_resume_controller_logic.js` (Phase 4B Resumes)
  - `test_phase_4c_controller_suite.js` (Phase 4C Resume Builder)
  - `test_phase_4d_pdf_export.js` (Phase 4D PDF Export)
  - `test_phase_4e_analyzer.js` (Phase 4E Analyzer)
  - `test_phase_4f_skill_intelligence.js` (Phase 4F Skill Intelligence)
  - `test_phase_4g_job_matching.js` (Phase 4G Explainable Matching)
  - `test_phase_4h_career_intelligence.js` (Phase 4H Career Intelligence)
  - `test_phase_4i_job_discovery.js` (Phase 4I Deterministic Recommendations)
  - `test_phase_4j_job_pipeline.js` (Phase 4J Saved Jobs & Applications)
  - `test_phase_4k_notifications.js` (Phase 4K Notifications)
- **Client Build:** Vite production build executed with `0 errors`.
