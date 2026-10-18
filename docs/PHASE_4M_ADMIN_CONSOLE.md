# JobPortal 2.0 — Phase 4M: Admin SaaS Console

## 1. Overview
Phase 4M introduces a production-grade **Admin SaaS Console** for JobPortal 2.0.

It equips platform administrators and superusers with complete operational governance over:
1. **Platform Analytics & Fact-Based Dashboard:** Real-time factual metrics (total users, candidates, recruiters, jobs, active listings, applications, 30-day growth, and recent operational activity) aggregated directly from MongoDB.
2. **User Management & Identity Administration:** Comprehensive user directory with filtering by role (`JOB_SEEKER`, `RECRUITER`, `ADMIN`) and active status, pagination, deep inspection of profile and resume metadata, role changes, and account activation/deactivation.
3. **Safety Safeguards & Role Elevation Defense:** Absolute protection preventing administrators from accidentally demoting or deactivating the last active administrator account.
4. **Job Content Moderation:** Platform-wide oversight of job postings across all recruiters, with state transitions (`PUBLISHED`, `DRAFT`, `CLOSED`, `ARCHIVED`) and audit logging.
5. **Application Oversight & Status Moderation:** Cross-platform inspection of candidate applications with frozen resume snapshot preservation and dispatch of Phase 4K candidate notifications on moderation events.
6. **Platform Distribution Reports:** Factual categorical aggregations covering user role distributions, job category distributions, work mode ratios, and application pipeline status breakdowns.
7. **Append-Only Audit Log:** Comprehensive, immutable audit trail tracking all privileged operations (`USER_ROLE_CHANGED`, `USER_STATUS_CHANGED`, `JOB_MODERATED`, `APPLICATION_MODERATED`, `SETTING_CHANGED`) with actor provenance and sanitized metadata (zero passwords or tokens).

> **Core Platform Invariant:**  
> "All administration actions are protected by strict RBAC (`requireRole('ADMIN')`) and actor provenance binding (`req.user._id`). All analytics and reporting metrics derive exclusively from genuine database counts without synthetic scores or simulated AI predictions."

---

## 2. Core Architectural & Security Principles

1. **Zero Fake Metrics & Zero Synthetic Scores:**
   - No synthetic "Platform health index", "AI match scores", or simulated hiring probabilities.
   - All counters, conversion ratios, and distributions are computed directly via database aggregations (`countDocuments`, `$facet`, `$group`).

2. **Strict Admin RBAC & Identity Invariance:**
   - All admin endpoints (`/api/admin/*`) require valid JWT authentication and role `ADMIN`.
   - The acting administrator's identity and provenance are strictly bound to `req.user._id`.
   - Injected body/query parameters (`adminId`, `actorId`, `role`) cannot spoof or forge audit log actor identity.

3. **Last Active Administrator Safeguard:**
   - A safety invariant prevents demoting or deactivating an admin if they are the sole remaining active administrator on the platform (`adminCount <= 1`).
   - Prevents accidental platform lockouts and privilege bricking.

4. **Candidate Privacy Preservation & Snapshot Integrity:**
   - Candidate passwords, bcrypt hashes, and security tokens are excluded (`-password`, `-tokens`) from all admin queries.
   - Admin application views preserve the frozen resume snapshot submitted by the applicant, without overwriting it with post-submission profile edits.

5. **Non-Destructive Soft Deactivation:**
   - User deactivation sets `isActive: false` with an administrative reason, preserving relational integrity across historical jobs, applications, and audit records.

6. **Append-Only Auditing:**
   - All high-impact state changes generate structured `AuditLog` records containing `actor`, `actorName`, `actorEmail`, `actorRole`, `action`, `entityType`, `entityId`, `summary`, and sanitized `metadata`.

---

## 3. Data Models

### AuditLog Model (`server/models/AuditLog.js`)
```javascript
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorName: { type: String, required: true, trim: true },
    actorEmail: { type: String, required: true, trim: true },
    actorRole: { type: String, required: true, trim: true },
    action: {
      type: String,
      required: true,
      enum: [
        "USER_ROLE_CHANGED",
        "USER_STATUS_CHANGED",
        "JOB_MODERATED",
        "APPLICATION_MODERATED",
        "SYSTEM_CONFIG_UPDATED",
        "SETTING_CHANGED",
      ],
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ["USER", "JOB", "APPLICATION", "SETTINGS", "SYSTEM"],
      index: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    summary: { type: String, required: true, trim: true, maxlength: 500 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Compound indexes for rapid administrative querying
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });
```

---

## 4. REST API Endpoints (`/api/admin`)

All endpoints are protected by `requireAuth` and `requireRole("ADMIN")`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Aggregated factual platform metrics and recent activity |
| `GET` | `/api/admin/users` | Paginated user directory with search, role, and active status filters |
| `GET` | `/api/admin/users/:id` | Detailed user record with candidate profile, resume count, and jobs |
| `PATCH` | `/api/admin/users/:id/role` | Updates user role (with last-admin protection) & logs audit event |
| `PATCH` | `/api/admin/users/:id/status` | Activates/deactivates user (with last-admin protection) & logs audit event |
| `GET` | `/api/admin/jobs` | Paginated job listings across all recruiters with status and category filters |
| `GET` | `/api/admin/jobs/:id` | Full job details with applicant count and recruiter information |
| `PATCH` | `/api/admin/jobs/:id/status` | Moderates job status (`PUBLISHED`, `DRAFT`, `CLOSED`, `ARCHIVED`) & logs audit |
| `GET` | `/api/admin/applications` | Paginated candidate applications across all jobs with status filters |
| `GET` | `/api/admin/applications/:id` | Full application detail with applicant snapshot, cover letter, and resume |
| `PATCH` | `/api/admin/applications/:id/status` | Moderates application status & dispatches Phase 4K notification |
| `GET` | `/api/admin/reports` | Factual platform distributions (roles, categories, work modes, statuses) |
| `GET` | `/api/admin/audit-logs` | Paginated, filterable audit log stream |

---

## 5. Frontend Architecture & Components

The Admin SaaS Console UI is organized into dense, responsive, and accessible views in `client/src/pages/admin/` and `client/src/components/admin/`:

### Components (`client/src/components/admin/`)
- `AdminSidebar.jsx`: Operations navigation with active route highlights, badges, and quick links.
- `AdminStatCard.jsx`: Metric display cards supporting factual counts, trend indicators, and theme-aware accents.
- `RoleChangeModal.jsx`: Modal for changing user roles with safeguard warning when modifying admins.
- `UserStatusModal.jsx`: Modal for account activation/deactivation with mandatory reason field.
- `JobModerationModal.jsx`: Modal for moderating job listing lifecycle statuses.
- `AuditLogDrawer.jsx`: Slide-out inspection drawer for detailed JSON audit payloads.
- `AdminFilters.jsx`: Reusable search, role, category, and status filter bar.

### Pages (`client/src/pages/admin/`)
- `AdminDashboard.jsx`: Platform overview with core KPI cards, job/application counters, and recent activity log.
- `AdminUsersPage.jsx`: User management directory with tabular layout, role pills, status toggles, and modal controls.
- `AdminUserDetailsPage.jsx`: In-depth profile inspection showing candidate/recruiter metadata, resumes, and posted jobs.
- `AdminJobsPage.jsx`: Platform-wide job listing table with status badges and moderation action controls.
- `AdminJobDetailsPage.jsx`: Full job overview with company details, description, skill requirements, and applicant summary.
- `AdminApplicationsPage.jsx`: Cross-platform application table with candidate name, job title, status, and view actions.
- `AdminApplicationDetailsPage.jsx`: Application review page displaying candidate snapshot, resume download, and status moderation.
- `AdminReportsPage.jsx`: Data distribution reports featuring role breakdown, job categories, work modes, and status funnels.
- `AdminAuditLogsPage.jsx`: System audit log table with actor tags, action badges, and metadata inspection drawer.

---

## 6. Automated Verification & Regression Suite

The Phase 4M implementation is verified by a dedicated 60-test unit and contract test suite (`test_phase_4m_admin_console.js`), as well as full platform regression covering all 14 phases.

### Phase 4M Test Matrix (60/60 Tests Passing)
1. **Authentication & RBAC Enforcement (6 tests):** Unauthenticated 401, non-admin role rejection (403), admin authorization.
2. **Actor Provenance Binding (4 tests):** Identity bound to JWT `req.user._id`, spoofed actor IDs rejected.
3. **Factual Metrics & Dashboard Accuracy (6 tests):** Non-empty counts, zero fake scores, 30-day user growth calculation.
4. **User & Candidate Administration (8 tests):** Paginated search, role filtering, detail inspection without password leakage.
5. **Role Elevation & Demotion Safeguards (6 tests):** Last active admin demotion blocked (400), valid role changes persisted.
6. **User Activation & Deactivation Safeguards (6 tests):** Last active admin deactivation blocked (400), soft deactivation persisted.
7. **Job Content Moderation (6 tests):** Cross-recruiter job listing, valid state transitions, audit event generation.
8. **Application Oversight & Candidate Privacy (6 tests):** Frozen resume snapshot preserved, credentials stripped, notification dispatched.
9. **Factual Reports & Distributions (6 tests):** Zero synthetic values, exact MongoDB aggregation consistency.
10. **Audit Log Provenance & Sanitization (6 tests):** Non-null actor/entityId/action, metadata sanitization, query indexing.

### Platform Regression Summary (14/14 Suites Passing)
- Suite 1: `test_controller_logic.js` (Passed)
- Suite 2: `test_profile_completion.js` (Passed)
- Suite 3: `test_resume_controller_logic.js` (Passed)
- Suite 4: `test_phase_4c_controller_suite.js` (24/24 Passed)
- Suite 5: `test_phase_4d_pdf_export.js` (14/14 Passed)
- Suite 6: `test_phase_4e_analyzer.js` (29/29 Passed)
- Suite 7: `test_phase_4f_skill_intelligence.js` (30/30 Passed)
- Suite 8: `test_phase_4g_job_matching.js` (37/37 Passed)
- Suite 9: `test_phase_4h_career_intelligence.js` (30/30 Passed)
- Suite 10: `test_phase_4i_job_discovery.js` (40/40 Passed)
- Suite 11: `test_phase_4j_job_pipeline.js` (45/45 Passed)
- Suite 12: `test_phase_4k_notifications.js` (40/40 Passed)
- Suite 13: `test_phase_4l_recruiter_workspace.js` (50/50 Passed)
- Suite 14: `test_phase_4m_admin_console.js` (60/60 Passed)
