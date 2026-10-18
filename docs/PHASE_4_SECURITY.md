# JobPortal 2.0 — Phase 4: Security Architecture & Data Protection

**Status:** Planned / Architecture Review  
**Version:** 2.0.0  
**Target:** Security Boundaries, RBAC, Ownership Validation & Sanitization  
**Author:** Staff Security Engineer  

---

## 1. Security Objectives & Threat Model

Candidate career data contains Personally Identifiable Information (PII) such as full names, phone numbers, email addresses, employment history, compensation expectations, and portfolio links.

The security architecture must enforce:
1. **Zero Trust Identity Derivation**: Candidate identity (`userId`) is always extracted from cryptographically verified JWT tokens (`req.user._id`), never from frontend query parameters or request body attributes.
2. **Strict Multi-Tenant Isolation**: Candidate $A$ cannot view, edit, or delete the profile, resumes, saved jobs, or applications belonging to Candidate $B$.
3. **Role-Based Access Control (RBAC)**: Only `JOB_SEEKER` and `ADMIN` roles can access Candidate Workstation routes. Recruiters cannot mutate candidate profiles.
4. **Mass Assignment Prevention**: Strict field whitelisting prevents unauthorized modification of internal fields (e.g., `user`, `role`, `createdAt`, `completionPercentage`, `statusHistory.updatedBy`).
5. **Sanitization & Injection Defense**: Comprehensive input validation prevents NoSQL injection, XSS, and prototype pollution.

---

## 2. Authorization & Ownership Matrix

| Resource / Endpoint | HTTP Method | Allowed Roles | Ownership Verification Rule |
|---|---|---|---|
| `/api/candidate/profile` | `GET`, `PUT`, `PATCH` | `JOB_SEEKER`, `ADMIN` | Strictly operates on `CandidateProfile.findOne({ user: req.user._id })`. |
| `/api/candidate/resumes` | `GET`, `POST` | `JOB_SEEKER`, `ADMIN` | Scoped to `{ user: req.user._id }`. |
| `/api/candidate/resumes/:id` | `GET`, `PUT`, `DELETE` | `JOB_SEEKER`, `ADMIN` | Asserts `resume.user.toString() === req.user._id.toString()`. |
| `/api/candidate/resumes/:id/duplicate` | `POST` | `JOB_SEEKER`, `ADMIN` | Asserts `resume.user.toString() === req.user._id.toString()`. |
| `/api/candidate/resumes/:id/analyze` | `POST` | `JOB_SEEKER`, `ADMIN` | Asserts `resume.user.toString() === req.user._id.toString()`. |
| `/api/candidate/applications` | `GET` | `JOB_SEEKER`, `ADMIN` | Scoped to `{ applicant: req.user._id }`. |
| `/api/candidate/applications/:id/withdraw` | `PATCH` | `JOB_SEEKER` | Asserts `application.applicant.toString() === req.user._id.toString()`. |
| `/api/candidate/saved-jobs/**` | `GET`, `POST`, `DELETE` | `JOB_SEEKER`, `ADMIN` | Scoped to `{ user: req.user._id }`. |

---

## 3. Middleware Architecture & Implementation Pattern

### 3.1 Standard Candidate Route Guard
All candidate routes are mounted behind the unified middleware stack:

```javascript
// server/routes/candidateRoutes.js
const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

// Enforce authentication and RBAC for entire candidate router
router.use(requireAuth);
router.use(requireRole("JOB_SEEKER", "ADMIN"));
```

### 3.2 Resource Ownership Helper
```javascript
// server/utils/ownershipValidator.js
const checkOwnership = (resource, reqUser) => {
  if (!resource) return false;
  if (reqUser.role === "ADMIN") return true;
  
  const ownerId = resource.user ? resource.user.toString() : resource.applicant ? resource.applicant.toString() : null;
  return ownerId === reqUser._id.toString();
};
```

---

## 4. Input Sanitization & Mass Assignment Defense

### 4.1 Strict Body Whitelisting Example (Profile Controller)
```javascript
// Prevents clients from overwriting system-managed fields
const allowedProfileFields = [
  "headline", "bio", "phone", "location", "preferences",
  "totalExperienceYears", "skills", "experience", "education",
  "projects", "certifications", "languages", "socialLinks"
];

const sanitizeProfileInput = (body) => {
  const sanitized = {};
  for (const field of allowedProfileFields) {
    if (body[field] !== undefined) {
      sanitized[field] = body[field];
    }
  }
  return sanitized;
};
```

### 4.2 XSS & Payload Bounds
- String inputs (Headline, Bio, Bullet points) are trimmed and length-bounded.
- Hyperlinks (GitHub, LinkedIn, Portfolio URLs) are validated against standard URI protocols (`https://`) to prevent `javascript:` pseudoprotocol injections.
- HTML tags in free-text fields are escaped before rendering on the frontend.

---

## 5. Rate Limiting & Denial-of-Service Mitigations

1. **Resume Analysis Endpoint**:
   - Rate limited to 30 requests per 15 minutes per IP/User to prevent CPU exhaustion during heavy deterministic text processing.
2. **Client-Side PDF Generation**:
   - PDF generation executes client-side using browser rendering engines and canvas rasterization, completely offloading PDF compute load from the Node.js event loop and preventing server DoS attacks.
3. **Array Length Limits**:
   - Resumes per user: Max 5 documents.
   - Work experiences per profile: Max 20 entries.
   - Skills per profile: Max 50 items.
   - Projects per profile: Max 20 items.
