# JobPortal 2.0 — Phase 4I: Deterministic Job Discovery & Recommendations

## 1. Overview
Phase 4I delivers a production-grade, deterministic **Job Discovery & Recommendation Engine** for candidates on JobPortal 2.0.

While Phase 4G answers:
> *"How well does my profile align with this specific target job?"* (Single-job explainable deep dive)

Phase 4I answers:
> *"Which available database jobs should I explore based on my explicit profile, declared preferences, and normalized skills?"* (Multi-job discovery, filtering, and transparent rule-based ranking)

---

## 2. Core Architectural Principles

1. **Zero Black-Box AI / Opaque Scores**:
   - Strictly NO LLMs, machine learning models, vector databases, embeddings, or probabilistic rankers.
   - Strictly NO fake numeric scores (`matchScore`, `matchPercentage`, `AIConfidence`, `hiringProbability`).
   - Categorical alignment labels only: `HIGH_ALIGNMENT`, `GOOD_ALIGNMENT`, `PARTIAL_ALIGNMENT`, `DISCOVERY_ONLY`.

2. **Real Database Jobs Only**:
   - Only returns real jobs from MongoDB matching criteria.
   - Never hallucinates jobs, salaries, companies, or hiring stats.
   - When no matches exist, returns a factual empty state.

3. **Deterministic Lexicographic Sorting**:
   - Sort by relevance evaluates criteria hierarchically:
     1. Number of canonical matched skills (DESC)
     2. Work mode preference match (DESC)
     3. Location preference match (DESC)
     4. Experience alignment (DESC)
     5. Job creation date (DESC)
     6. `_id` (ASC) deterministic tie-breaker

4. **Transparent Explainable Reasons**:
   - Every discovered job card presents bulleted factual reasons (e.g. *"Matches 4 of your skills: React, Node.js, MongoDB, TypeScript"*, *"Location aligns with your preferred city: Pune"*, *"Work mode aligns with your preference: Hybrid"*).

5. **Strict Security & RBAC**:
   - User identity derived strictly from authenticated JWT token (`req.user._id`).
   - Candidate role (`JOB_SEEKER`, `ADMIN`) enforcement via `requireAuth` and `requireRole`.
   - Complete IDOR protection; parameters like `candidateId` or `userId` in query strings are rejected/ignored.
   - Regex injection protection via `escapeRegex`.

---

## 3. Architecture & Code Structure

### Backend (`server/services/jobDiscovery/`)
- `jobDiscoveryConstants.js`: Engine version `1.0.0`, alignment statuses, sort options, query limit defaults (`DEFAULT_PAGE = 1`, `DEFAULT_LIMIT = 10`, `MAX_LIMIT = 50`).
- `jobDiscoveryFilters.js`: Safe regex query constructor for MongoDB matching (keywords across title/company/description, location, workMode, experience, category, employmentType, explicit skills).
- `jobDiscoveryReasonBuilder.js`: Factual bullet point reason generator based strictly on candidate data vs job parameters.
- `jobDiscoveryRanker.js`: Lexicographical comparator and categorical alignment assigner.
- `jobDiscoveryEngine.js`: Orchestrator retrieving jobs, extracting skills, evaluating alignment factors, ranking results, and generating paginated output payloads.
- `index.js`: Public API facade.

### Backend Routing & Controller
- `server/controllers/jobDiscoveryController.js`: `getRecommendedJobsHandler` for `GET /api/candidate/jobs/recommended`.
- `server/routes/candidateRoutes.js`: Mounted endpoint protected with `requireAuth, requireRole("JOB_SEEKER", "ADMIN")`.

### Frontend (`client/src/`)
- `client/src/api/api.js`: `getRecommendedJobs(params, token)`.
- `client/src/components/job-discovery/RecommendedJobCard.jsx`: Discovered job card with alignment badge, reason bullets, matched/missing skill chips, and CTAs (`[View Job]`, `[Check Alignment]`).
- `client/src/components/job-discovery/DiscoveryFilters.jsx`: Sidebar filter controls for keyword, location, work mode, experience, category, sorting, and reset.
- `client/src/components/job-discovery/DiscoveryReason.jsx`: Renders reason bullet points with clean icons.
- `client/src/components/job-discovery/DiscoveryEmptyState.jsx`: Factual empty state with filter reset and update profile CTAs.
- `client/src/components/job-discovery/DiscoverySkeleton.jsx`: Clean loading skeleton.
- `client/src/components/job-discovery/DiscoveryPagination.jsx`: Paginated navigation controls.
- `client/src/pages/candidate/RecommendedJobsPage.jsx`: Full responsive discovery page with URL-driven search params.
- `client/src/App.jsx`: Mounted `/candidate/jobs/recommended` route.
- `client/src/components/Navbar.jsx` & `client/src/pages/CandidateDashboard.jsx`: Navigated shortcuts to Job Discovery.

---

## 4. API Contract

### `GET /api/candidate/jobs/recommended`
**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Query Parameters (Optional):**
- `keyword` (string)
- `location` (string)
- `workMode` (string: `Remote`, `Hybrid`, `On-site`)
- `experience` (string)
- `category` (string)
- `employmentType` (string: `Full-time`, `Part-time`, `Contract`, `Internship`)
- `sort` (string: `RELEVANCE`, `NEWEST`, `SALARY_HIGH`, `SALARY_LOW`)
- `page` (integer, default: 1)
- `limit` (integer, default: 10, max: 50)

**Response Payload (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "engineVersion": "1.0.0",
    "appliedFilters": {
      "keyword": "",
      "location": "",
      "workMode": "",
      "experience": "",
      "category": "",
      "employmentType": "",
      "sort": "RELEVANCE"
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 12,
      "totalPages": 2
    },
    "results": [
      {
        "job": {
          "_id": "60d0fe4f5311236168a109ca",
          "title": "Senior Fullstack Engineer",
          "company": "Enterprise Tech India",
          "location": "Pune, Maharashtra",
          "workMode": "Hybrid",
          "experience": "3-5 years",
          "salary": "₹18-24 LPA",
          "skills": ["React", "Node.js", "MongoDB", "TypeScript"],
          "createdAt": "2026-09-21T00:00:00.000Z"
        },
        "alignment": {
          "status": "HIGH_ALIGNMENT",
          "reasons": [
            "Matches 4 of your skills: React, Node.js, MongoDB, TypeScript",
            "Location aligns with your preferred city: Pune",
            "Work mode aligns with your preference: Hybrid"
          ],
          "matchedSkills": ["React", "Node.js", "MongoDB", "TypeScript"],
          "missingSkills": []
        }
      }
    ]
  }
}
```

---

## 5. Verification & Test Suite

The test suite in `scratch/test_phase_4i_job_discovery.js` verified 40/40 test cases:
1. **Authentication & RBAC**:
   - Blocks 401 unauthenticated requests.
   - Blocks 403 recruiter role access.
   - Authorizes candidate and admin roles.
2. **Identity & Security Invariants**:
   - Derives identity strictly from `req.user._id`.
   - Rejects injected `candidateId` and `userId` query parameters.
   - Escapes regex special characters to prevent ReDoS/injection.
3. **Filtering & Pagination**:
   - Verified keyword, location, workMode, experience, category, employmentType, and explicit skills query construction.
   - Safe page & limit bounding (`DEFAULT_PAGE = 1`, `MAX_LIMIT = 50`).
4. **Skill Mapping & Alignment**:
   - Reuses Phase 4F canonical skill normalizer.
   - Factual matched & missing skills tracking.
   - Factual reason generation for skills, location, work mode, experience, category.
5. **Deterministic Lexicographic Ranking**:
   - Highest skill match ranked first.
   - Timestamp and `_id` deterministic tie-breaking.
6. **Strict Invariant Auditing**:
   - Verified 0 numeric scores (`matchScore`, `matchPercentage`, `AIConfidence`, `hiringProbability`).
   - Verified preservation of original database IDs, titles, salaries, companies.
7. **Cross-Phase Continuity**:
   - Phase 4A–4H full regression passing.
   - Client production build passes with 0 errors.
