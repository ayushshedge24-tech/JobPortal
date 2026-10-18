# JobPortal 2.0 — Production Go-Live Checklist

Use this checklist to perform the final pre-flight verification before switching DNS or announcing general availability.

---

## 1. Codebase & Build Certification
- [x] Phase 4A through 4N frozen and unmodified.
- [x] Phase 5 production hardening optimizations verified.
- [x] Client production build succeeds with 0 errors and 0 chunk warnings (`npm run build`).
- [x] Entry JS bundle is under 200 kB (Current: 183.34 kB / 37.37 kB gzip).
- [x] Vendor code split into `react-vendor`, `router-vendor`, and `icons-vendor`.
- [x] Heavy workstation pages code-split asynchronously with `React.lazy()`.
- [x] Top-level `<ErrorBoundary>` mounted in React root.

---

## 2. Backend, Database & Security
- [x] All 12+ compound and timeline indexes defined across User, Job, Application, SavedJob, Notification, Conversation, Message.
- [x] `boundPagination()` enforces `limit` between 1 and 50 on all query streams.
- [x] `escapeRegex()` neutralizes special characters in user search inputs.
- [x] Role-Based Access Control (RBAC) active: Candidate, Recruiter, Admin.
- [x] Admin routes strictly blocked for non-admin roles (403 Forbidden).
- [x] Last Admin Safety verified: Single remaining active admin cannot be demoted or deactivated.
- [x] Identity anti-spoofing verified: `sender` and `actorId` strictly bound to JWT `req.user._id`.
- [x] Application-bound 1-on-1 messaging boundaries enforced (Anti-IDOR).
- [x] Plain-text message sanitization strips HTML tags to prevent stored XSS.
- [x] Message body bounded to [1, 4000] characters and rate-limited to 30 msg/5 min.
- [x] Password hashes omitted from all serialized JSON API responses.
- [x] Health check endpoint `GET /api/health` active without exposing environment secrets.

---

## 3. End-to-End Functional Flows
- [x] Candidate registration, profile completion (0–100%), and profile update.
- [x] Multiple resume creation, editing, primary toggle, and A4 Unicode PDF export.
- [x] ATS keyword analyzer and skill intelligence suggestions.
- [x] Deterministic job search, facet filtering, sorting, and explainable match breakdown.
- [x] Job bookmarking/saving with duplicate prevention.
- [x] Application submission with immutable frozen resume snapshot.
- [x] Recruiter job posting, draft saving, and publishing.
- [x] Recruiter ATS candidate pipeline (7 stages) with status history tracking.
- [x] Candidate ↔ Recruiter 1-on-1 contextual messaging.
- [x] Candidate notifications with idempotent `eventKey` deduplication.
- [x] Admin console user moderation, job moderation, and immutable audit logs.

---

## 4. UI/UX, Viewports & Theme
- [x] Viewport responsiveness verified from 390px (mobile) to 1920px (desktop).
- [x] Dark / Light theme styling consistent with zero contrast breaks.
- [x] Interactive buttons and inputs provide visible keyboard focus rings.
- [x] Modals support keyboard Escape dismissal and background scroll locking.

---

## 5. Automated Test Suite Results
- [x] All 18 regression and release test suites passed (18/18, 100%).
- [x] Total automated test checks: 600+ invariant tests passing.
- [x] Zero P0 critical blockers.
- [x] Zero P1 high blockers.

---

## 6. Sign-off & Certification
* **Release Version:** 2.0.0
* **Release Status:** **APPROVED FOR GO-LIVE**
