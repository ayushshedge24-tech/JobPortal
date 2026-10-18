# 🔌 JobPortal 2.0 — API Architecture & Improvement Plan

**Standard:** Clean RESTful Architecture • JSON API Specifications • RFC 7807 Error Responses  
**Base URL:** `http://localhost:5000/api`

---

## 1. Unified Response Envelope & Error Format

All API responses follow a predictable envelope:

### 1.1 Success Response Envelope
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### 1.2 Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The email or password provided is incorrect.",
    "details": []
  }
}
```

---

## 2. API Endpoint Specifications

### 2.1 Authentication & User Session (`/api/auth`)

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new candidate or recruiter with bcrypt password hash |
| `POST` | `/api/auth/login` | Public | Authenticate user, return JWT access token & user profile |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session user and permissions |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate refresh session |
| `PUT` | `/api/auth/update-password` | Authenticated | Change user password |

### 2.2 Jobs Catalog & Discovery (`/api/jobs`)

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Public | Paginated list with filtering (`q`, `location`, `jobType`, `minSalary`, `experience`, `skills`, `sort`) |
| `GET` | `/api/jobs/:id` | Public | Single job details with populated company, recruiter, and similar roles |
| `POST` | `/api/jobs` | Recruiter/Admin | Publish a new job vacancy (validates required fields, skills array) |
| `PUT` | `/api/jobs/:id` | Recruiter/Admin | Update existing job details |
| `DELETE` | `/api/jobs/:id` | Recruiter/Admin | Archive or close a job opening |
| `GET` | `/api/jobs/recruiter/my-jobs` | Recruiter | Get all jobs posted by the logged-in recruiter with applicant count |

### 2.3 Applications & ATS Workflow (`/api/applications`)

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications` | Candidate | Submit job application (`jobId`, `resumeUrl`, `coverLetter`, `expectedCtc`, `noticePeriod`) |
| `GET` | `/api/applications/candidate/my-apps` | Candidate | Get applications submitted by logged-in candidate with status timeline |
| `GET` | `/api/applications/job/:jobId` | Recruiter/Admin | Get all applications for a specific job with applicant details & match scores |
| `PATCH` | `/api/applications/:id/status` | Recruiter/Admin | Update candidate status (`Under Review`, `Shortlisted`, `Interview`, `Selected`, `Rejected`) |
| `POST` | `/api/applications/:id/notes` | Recruiter/Admin | Add internal recruiter evaluation note |

### 2.4 Candidate Profile & Resume Engine (`/api/profiles`)

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profiles/me` | Candidate | Retrieve extended profile (experience, education, projects, skills) |
| `PUT` | `/api/profiles/me` | Candidate | Update candidate profile & calculate completeness percentage |
| `POST` | `/api/profiles/resume/generate` | Candidate | Generate PDF resume from structured profile data |

### 2.5 Interviews Management (`/api/interviews`)

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/interviews` | Recruiter | Schedule interview round (`applicationId`, `dateTime`, `roundType`, `meetingLink`, `notes`) |
| `GET` | `/api/interviews/my-schedule` | Authenticated | Retrieve upcoming interviews for candidate or recruiter |
| `PATCH` | `/api/interviews/:id` | Authenticated | Update interview status (Confirmed, Completed, Rescheduled, Cancelled) |

### 2.6 Real-Time Notifications & Messaging (`/api/notifications`, `/api/messages`)

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Authenticated | Get unread & recent notifications |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Mark notification as read |
| `GET` | `/api/messages/conversations` | Authenticated | List all active conversation threads |
| `GET` | `/api/messages/:conversationId` | Authenticated | Get message history in thread |
| `POST` | `/api/messages` | Authenticated | Send a direct message in a conversation |

### 2.7 AI Career Services (`/api/ai`)

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/resume-analyzer` | Public / Auth | Analyze resume text: ATS score, keyword density, improvement tips |
| `POST` | `/api/ai/job-match` | Public / Auth | Compute match score between candidate profile and target job requirements |
| `POST` | `/api/ai/assistant` | Public / Auth | AI career copilot prompt responder (interview prep, skill roadmap) |

### 2.8 Platform Administration & Moderation (`/api/admin`)

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/metrics` | Admin | Overall platform statistics, growth metrics, and charts |
| `GET` | `/api/admin/users` | Admin | Paginated user management with search and status toggles |
| `PATCH` | `/api/admin/users/:id/status` | Admin | Suspend or activate user account |
| `GET` | `/api/admin/companies/pending` | Admin | Company verification queue |
| `PATCH` | `/api/admin/companies/:id/verify` | Admin | Approve or reject employer verification |

---

## 3. Backward Compatibility & Migration Strategy

Existing endpoints (`/api/users/register`, `/api/jobs`, `/api/applications`) will remain fully operational while routing into the upgraded controller architecture. New capabilities will be introduced as structured enhancements with zero downtime.
