# JobPortal 2.0 — Phase 4C: Security Architecture & Content Protection

**Status:** Planned / Architecture Review  
**Version:** 2.0.0 (Phase 4C)  
**Target:** Security Boundaries, Input Sanitization, XSS Defense & Ownership  
**Author:** Staff Security Engineer  

---

## 1. Threat Model & Security Objectives

Resume documents contain highly detailed career records. The Phase 4C architecture enforces 5 security pillars:
1. **Zero Trust User Identity**: The editing user's identity is derived strictly from verified JWT tokens (`req.user._id`).
2. **Strict Multi-Tenant Isolation**: Candidate $A$ cannot view, update, duplicate, or mutate the content of Candidate $B$'s resume.
3. **Cross-Site Scripting (XSS) Prevention**: User-supplied strings (bio summary, bullet points, company names, project descriptions) are treated strictly as plaintext and sanitized before rendering in templates.
4. **Dangerous Protocol Neutralization**: Hyperlinks (GitHub, LinkedIn, portfolio, project URLs) are validated against valid URI schemes (`http:`, `https:`), stripping malicious `javascript:` pseudo-protocols.
5. **Denial-of-Service & Payload Bounding**: Strict payload size limits (50 KB per request) and array element bounds prevent memory exhaustion and database bloat.

---

## 2. Ownership Verification Pattern

All resume content endpoints enforce explicit ownership verification:

```javascript
// server/controllers/resumeController.js
const updateResumeContent = async (req, res) => {
  const userId = req.user._id;
  const resumeId = req.params.id;

  // Strict ownership lookup
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) {
    return res.status(404).json({
      success: false,
      error: { code: "RESUME_NOT_FOUND", message: "Resume not found or access denied." }
    });
  }

  // Sanitize and update content
  resume.content = sanitizeResumeContent(req.body.content);
  resume.version = (resume.version || 1) + 1;
  await resume.save();

  res.json({ success: true, data: resume });
};
```

---

## 3. Input Sanitization & URL Protocol Defense

```javascript
/**
 * URL Validator: rejects javascript:, data:, and malformed strings
 */
function isSafeUrl(urlString) {
  if (!urlString || typeof urlString !== "string" || urlString.trim() === "") return true;
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
```

---

## 4. Mass-Assignment Defense

The `PUT /api/candidate/resumes/:id/content` endpoint explicitly accepts **only** content subfields. Any attempts to inject top-level document properties (`_id`, `user`, `isPrimary`, `status`, `createdAt`, `updatedAt`) are discarded by the controller whitelist before passing to the Mongoose ODM.

---

## 5. Rate Limiting & Denial-of-Service Mitigations

1. **Autosave Rate Limiting**:
   - `PUT /api/candidate/resumes/:id/content` is rate limited to 60 requests per 15 minutes per authenticated user.
   - Client-side debouncing (1500ms) guarantees that normal typing generates less than 5 API calls per minute.
2. **Payload Size Limit**:
   - Body parser limits resume content JSON payloads to 50 KB max.
