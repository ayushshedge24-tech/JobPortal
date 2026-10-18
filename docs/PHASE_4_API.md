# JobPortal 2.0 — Phase 4: REST API Specifications

**Status:** Planned / Architecture Review  
**Version:** 2.0.0  
**Target:** Express REST API Endpoints  
**Auth Requirement:** JWT Bearer / HTTP-Only Cookie + RBAC `JOB_SEEKER`  

---

## 1. Global Standards & Conventions

- **Base URL**: `/api/candidate`
- **Authentication**: All endpoints require `requireAuth` + `requireRole("JOB_SEEKER", "ADMIN")`.
- **Response Format**:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional human-readable feedback"
  }
  ```
- **Standard Error Format**:
  ```json
  {
    "success": false,
    "error": "Descriptive error message",
    "details": [ ... ]
  }
  ```

---

## 2. Endpoints Specification

### 2.1 Candidate Profile Endpoints

#### `GET /api/candidate/profile`
- **Description**: Retrieves candidate's full master profile. If profile does not exist, automatically creates a baseline profile from `User` data.
- **Access**: Candidate Owner (`req.user._id`).
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "651f8a...",
      "user": { "_id": "651f80...", "name": "Rahul Sharma", "email": "rahul@example.com" },
      "headline": "Full-Stack Software Engineer (React, Node.js)",
      "bio": "5+ years building scalable MERN web applications...",
      "phone": "+91 98765 43210",
      "location": { "city": "Bengaluru", "state": "Karnataka", "country": "India" },
      "preferences": {
        "preferredLocations": ["Bengaluru", "Pune", "Remote"],
        "preferredWorkModes": ["Hybrid", "Remote"],
        "preferredJobTypes": ["Full-time"],
        "expectedSalaryLPA": 24,
        "noticePeriodDays": 30
      },
      "totalExperienceYears": 5,
      "skills": [
        { "name": "React", "category": "Frontend", "yearsOfExp": 4, "proficiency": "Expert" },
        { "name": "Node.js", "category": "Backend", "yearsOfExp": 4, "proficiency": "Advanced" },
        { "name": "MongoDB", "category": "Database", "yearsOfExp": 3, "proficiency": "Advanced" }
      ],
      "experience": [ ... ],
      "education": [ ... ],
      "projects": [ ... ],
      "certifications": [ ... ],
      "socialLinks": {
        "github": "https://github.com/rahulsharma",
        "linkedin": "https://linkedin.com/in/rahulsharma",
        "portfolio": "https://rahulsharma.dev"
      },
      "completionPercentage": 85
    }
  }
  ```

#### `PUT /api/candidate/profile`
- **Description**: Updates candidate's full profile document. Recalculates `completionPercentage` deterministically.
- **Request Body**: Full or partial `CandidateProfile` payload (validated by schema).
- **Response `200 OK`**: Updated profile object.

---

### 2.2 Resume Management & Builder Endpoints

#### `GET /api/candidate/resumes`
- **Description**: Lists all resumes owned by the authenticated candidate.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "6520ab...",
        "title": "Full-Stack Node/React Resume",
        "template": "ats-classic",
        "isPrimary": true,
        "atsScore": { "overallScore": 88, "lastCalculatedAt": "2026-09-20T10:00:00Z" },
        "updatedAt": "2026-09-20T10:00:00Z"
      }
    ]
  }
  ```

#### `POST /api/candidate/resumes`
- **Description**: Creates a new resume document. Can optionally initialize from candidate's `CandidateProfile`.
- **Request Body**:
  ```json
  {
    "title": "Backend Go / Node Specialist",
    "template": "modern",
    "importFromProfile": true
  }
  ```
- **Response `201 Created`**: Newly created resume document.

#### `GET /api/candidate/resumes/:id`
- **Description**: Fetches detailed resume data for builder editing and live preview.
- **Access Control**: Validates `resume.user.toString() === req.user._id.toString()`.
- **Response `200 OK`**: Complete resume document.

#### `PUT /api/candidate/resumes/:id`
- **Description**: Updates resume sections, template settings, and content.
- **Request Body**: Complete or partial resume fields.
- **Response `200 OK`**: Updated resume document with updated `atsScore`.

#### `DELETE /api/candidate/resumes/:id`
- **Description**: Deletes a resume document. Re-assigns primary resume if deleted resume was primary.
- **Response `200 OK`**: `{ "success": true, "message": "Resume deleted successfully" }`.

#### `POST /api/candidate/resumes/:id/duplicate`
- **Description**: Clones an existing resume document with title `Copy of [Title]`.
- **Response `201 Created`**: Duplicated resume document.

#### `PATCH /api/candidate/resumes/:id/primary`
- **Description**: Sets the specified resume as the default primary resume and unsets others.
- **Response `200 OK`**: Updated resume document.

---

### 2.3 Deterministic Resume Analyzer Endpoints

#### `POST /api/candidate/resumes/:id/analyze`
- **Description**: Runs deterministic ATS & quality rules against resume data (and optional target `jobId`).
- **Request Body (Optional)**:
  ```json
  {
    "targetJobId": "651a2c..." // Optional job reference for targeted keyword matching
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "overallScore": 84,
      "breakdown": {
        "sectionCompleteness": { "score": 25, "max": 25, "status": "pass" },
        "actionOrientedImpact": { "score": 20, "max": 25, "status": "warning", "details": "Found 8 strong action verbs across 12 bullets." },
        "quantifiableMetrics": { "score": 18, "max": 25, "status": "warning", "details": "3 of 5 experience entries include measurable metrics (%, $, LPA)." },
        "atsFormatting": { "score": 21, "max": 25, "status": "pass", "wordCount": 580, "readability": "Optimal" }
      },
      "checklist": {
        "contactInfo": true,
        "professionalSummary": true,
        "experience": true,
        "education": true,
        "skills": true,
        "projects": true,
        "githubOrPortfolio": true
      },
      "strengths": [
        "Strong clear technical skills section with 12 relevant industry keywords.",
        "Optimal word count (580 words) for 1-2 page ATS scanning."
      ],
      "criticalFixes": [],
      "improvementSuggestions": [
        "Include more quantifiable metrics in your Software Engineer role (e.g. '% latency reduction', 'users served').",
        "Add a project live demo or GitHub repository link to strengthen your Portfolio section."
      ]
    }
  }
  ```

---

### 2.4 Explainable Job Matching & Skill Gap Endpoints

#### `GET /api/candidate/jobs/:jobId/match`
- **Description**: Computes exact explainable mathematical match score between candidate profile and a specific job.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "overallScore": 82,
      "breakdown": {
        "skillScore": 90,
        "experienceScore": 80,
        "locationScore": 100,
        "workModeScore": 100,
        "jobTypeScore": 100
      },
      "matchedSkills": ["React", "Node.js", "MongoDB", "Express", "REST APIs"],
      "missingSkills": ["Docker", "Kubernetes", "AWS"],
      "reasons": [
        "Matches 5 out of 7 required technical skills (71% skill overlap).",
        "Your experience (5 years) satisfies the 3-5 years requirement.",
        "Your location preference (Bengaluru) matches the job location."
      ],
      "recommendations": [
        "Highlight any containerization experience (Docker) in your resume to increase match score to 95%."
      ]
    }
  }
  ```

#### `GET /api/candidate/skills/gap-analysis`
- **Description**: Aggregates top in-demand skills from active jobs in candidate's target role category and compares them with candidate's registered skills.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "candidateSkills": ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
      "strongSkills": ["React", "Node.js", "JavaScript"],
      "frequentlyDemandedInMarket": [
        { "skill": "TypeScript", "demandPercentage": 78 },
        { "skill": "Docker", "demandPercentage": 65 },
        { "skill": "AWS", "demandPercentage": 58 },
        { "skill": "PostgreSQL", "demandPercentage": 52 }
      ],
      "recommendedSkillGaps": ["TypeScript", "Docker", "AWS"]
    }
  }
  ```

---

### 2.5 Application Tracking Endpoints

#### `GET /api/candidate/applications`
- **Description**: Returns all applications submitted by candidate with populated job data, salary, status history timeline, and submitted resume snapshot.
- **Query Parameters**:
  - `status`: Filter by status (`Applied`, `Shortlisted`, `Interview`, `Offer`, `Rejected`)
  - `page`: Page index (default: 1)
  - `limit`: Items per page (default: 10)
- **Response `200 OK`**: Paginated applications array.

#### `PATCH /api/candidate/applications/:id/withdraw`
- **Description**: Allows candidate to withdraw an active application with an optional reason.
- **Request Body**: `{ "reason": "Accepted another offer" }`
- **Response `200 OK`**: Updated application document with new timeline entry.

---

### 2.6 Saved Jobs Endpoints

#### `GET /api/candidate/saved-jobs`
- **Description**: Returns all bookmarked jobs with populated job details.
- **Response `200 OK`**: Array of saved job objects.

#### `POST /api/candidate/saved-jobs/:jobId`
- **Description**: Bookmarks a job for the candidate.
- **Response `201 Created`**: Saved job record.

#### `DELETE /api/candidate/saved-jobs/:jobId`
- **Description**: Removes a bookmarked job.
- **Response `200 OK`**: `{ "success": true, "message": "Job removed from saved list" }`.
