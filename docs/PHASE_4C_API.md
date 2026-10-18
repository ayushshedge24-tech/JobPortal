# JobPortal 2.0 — Phase 4C: REST API Specifications

**Status:** Planned / Architecture Review  
**Version:** 2.0.0 (Phase 4C)  
**Target:** Resume Content & Template REST Endpoints  
**Auth Requirement:** JWT Access Token + `JOB_SEEKER` / `ADMIN`  

---

## 1. Global Conventions & Standards

- **Base URL**: `/api/candidate/resumes`
- **Authentication**: `requireAuth` + `requireRole("JOB_SEEKER", "ADMIN")`
- **Ownership**: Every operation queries `{ _id: req.params.id, user: req.user._id }`
- **Standard Envelope**:
  ```json
  {
    "success": true,
    "message": "Human-readable status",
    "data": { ... }
  }
  ```

---

## 2. API Endpoints Specification

### 2.1 Get Full Resume by ID
- **Endpoint**: `GET /api/candidate/resumes/:id`
- **Description**: Returns the complete resume document including all structured content sections for builder editing.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "65f12a...",
      "user": "65f100...",
      "title": "Full-Stack Engineer Resume",
      "template": "ATS_CLASSIC",
      "isPrimary": true,
      "version": 2,
      "source": "MANUAL",
      "status": "ACTIVE",
      "content": {
        "personal": {
          "fullName": "Rahul Sharma",
          "headline": "Senior Software Engineer",
          "email": "rahul.sharma@example.com",
          "phone": "+91 98765 43210",
          "city": "Bengaluru",
          "state": "Karnataka",
          "country": "India",
          "linkedin": "https://linkedin.com/in/rahulsharma",
          "github": "https://github.com/rahulsharma",
          "portfolio": "https://rahulsharma.dev",
          "website": ""
        },
        "summary": "Full-stack engineer with 5+ years experience building high-throughput payment architectures...",
        "experience": [
          {
            "company": "Razorpay",
            "role": "SDE-2",
            "location": "Bengaluru, India",
            "startDate": "2022-06",
            "endDate": "Present",
            "isCurrent": true,
            "description": "Led backend payments integration.",
            "bulletPoints": [
              "Architected webhook pipeline processing 10k events/sec.",
              "Reduced payment retry latency by 45% using Redis clusters."
            ]
          }
        ],
        "education": [
          {
            "institution": "IIT Bombay",
            "degree": "B.Tech",
            "fieldOfStudy": "Computer Science",
            "startDate": "2018",
            "endDate": "2022",
            "grade": "8.9 CGPA"
          }
        ],
        "skills": [
          { "name": "React", "category": "Frontend", "level": "EXPERT" },
          { "name": "Node.js", "category": "Backend", "level": "EXPERT" },
          { "name": "MongoDB", "category": "Database", "level": "ADVANCED" }
        ],
        "projects": [ ... ],
        "certifications": [ ... ],
        "achievements": [ ... ],
        "languages": [ ... ],
        "customSections": [],
        "sectionOrder": ["SUMMARY", "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS"],
        "sectionVisibility": {
          "SUMMARY": true,
          "EXPERIENCE": true,
          "EDUCATION": true,
          "SKILLS": true,
          "PROJECTS": true,
          "CERTIFICATIONS": true
        },
        "styling": {
          "fontSize": "MD",
          "lineSpacing": "NORMAL",
          "primaryColor": "#2563eb"
        }
      },
      "createdAt": "2026-09-20T10:00:00.000Z",
      "updatedAt": "2026-09-20T11:15:00.000Z"
    }
  }
  ```

---

### 2.2 Update Resume Content (Save / Autosave)
- **Endpoint**: `PUT /api/candidate/resumes/:id/content`
- **Description**: Updates the structured `content` payload of the resume. Automatically increments the `version` counter and updates `updatedAt`.
- **Request Body**: Complete or partial `content` object.
- **Validation**:
  - `personal.email`: Valid email format if provided.
  - `personal.phone`: Valid phone format if provided.
  - URLs in `personal`, `projects`, and `certifications`: Valid `http://` or `https://` protocol.
  - Length checks: `summary` $\le 3000$ chars, individual bullet points $\le 500$ chars.
  - Array bounds: `experience` $\le 15$, `projects` $\le 12$, `skills` $\le 40$.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Resume content saved successfully.",
    "data": { ... }
  }
  ```
- **Error Codes**:
  - `400 INVALID_CONTENT_PAYLOAD`: Validation error in content subfields.
  - `404 RESUME_NOT_FOUND`: Target resume does not exist or user lacks ownership.

---

### 2.3 Update Resume Template
- **Endpoint**: `PATCH /api/candidate/resumes/:id/template`
- **Description**: Lightweight endpoint to quickly switch the resume layout template without re-sending the full content payload.
- **Request Body**:
  ```json
  {
    "template": "MODERN_PROFESSIONAL"
  }
  ```
- **Validation**: `template` must be one of `["ATS_CLASSIC", "MODERN_PROFESSIONAL", "MINIMAL_EXECUTIVE"]`.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Template updated successfully.",
    "data": { "_id": "...", "template": "MODERN_PROFESSIONAL" }
  }
  ```

---

### 2.4 Import Master Profile into Resume
- **Endpoint**: `POST /api/candidate/resumes/:id/import-profile`
- **Description**: Reads the authenticated candidate's `CandidateProfile` and deep-copies relevant sections into the resume's `content`. Sets `source = "PROFILE_IMPORT"`.
- **Mapping Logic**:
  - `personal.fullName` $\leftarrow$ `${profile.firstName} ${profile.lastName}`
  - `personal.headline` $\leftarrow$ `profile.headline`
  - `personal.email` $\leftarrow$ `req.user.email`
  - `personal.phone` $\leftarrow$ `profile.phone`
  - `personal.city` $\leftarrow$ `profile.city`
  - `personal.state` $\leftarrow$ `profile.state`
  - `personal.linkedin` $\leftarrow$ `profile.socialLinks.linkedin`
  - `personal.github` $\leftarrow$ `profile.socialLinks.github`
  - `personal.portfolio` $\leftarrow$ `profile.socialLinks.portfolio`
  - `summary` $\leftarrow$ `profile.professionalSummary`
  - `experience` $\leftarrow$ `profile.experience` (maps descriptions and extracts initial bullet points)
  - `education` $\leftarrow$ `profile.education`
  - `skills` $\leftarrow$ `profile.skills` (converts string skills to `{ name, category: "Other", level: "" }`)
  - `projects` $\leftarrow$ `profile.projects`
  - `certifications` $\leftarrow$ `profile.certifications`
  - `achievements` $\leftarrow$ `profile.achievements`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Profile imported into resume successfully.",
    "data": { ... }
  }
  ```
- **Guaranteed Isolation**: Modifying the resume after import does not alter `CandidateProfile`.
