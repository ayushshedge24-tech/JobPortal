# JobPortal 2.0 — Phase 4: Candidate Workstation Architecture

**Status:** Planned / Architecture Review  
**Version:** 2.0.0  
**Target Subsystem:** Candidate Career Hub & Workstation  
**Author:** Staff Product & System Architect  

---

## 1. Executive Summary & Vision

Phase 4 transforms JobPortal 2.0 from a transactional application submission portal into an end-to-end **Candidate Workstation & Career Operating System**.

Rather than simply listing past applications, the Candidate Workstation empowers Indian job seekers with:
1. **Candidate Profile Workspace**: Multi-section, verified profile builder with dynamic completion scoring.
2. **Deterministic Resume Analyzer & Scorer**: 100% explainable, multi-dimensional scoring (Section Completeness, Impact & Metrics, ATS Keyword Density, Formatting & Brevity).
3. **Professional Resume Builder**: Real-time preview with ATS-optimized templates ('ATS Classic', 'Modern Split', 'Minimal Tech') and client-side crisp vector/A4 PDF generation.
4. **Skill Engine & Skill Gap Analysis**: Granular skill taxonomy with target role benchmark comparisons and learning path recommendations.
5. **Explainable Job Match Engine**: Transparent mathematical affinity scoring with explicit match breakdowns (Skills, Experience, Location, CTC, Work Mode).
6. **Advanced Application Tracker**: Status timeline progression, interview scheduling notes, recruiter touchpoints, and follow-up logging.
7. **Saved Jobs & Search Alerts**: Quick-save bookmarks with customizable email/push alert criteria.
8. **AI Career Copilot Interface Readiness**: Pluggable provider-agnostic abstraction ready for future LLM integration (resume bullet enhancement, cover letter generation, interview prep).

---

## 2. High-Level Architectural Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    CANDIDATE WORKSTATION (FRONTEND)                                 |
|                                                                                                    |
|  +---------------------+  +----------------------+  +---------------------+  +------------------+  |
|  | Overview Dashboard  |  | Profile Workspace    |  | Resume Hub & Builder|  | Skill Analyzer   |  |
|  | - Metrics & KPIs    |  | - 8 Profile Sections |  | - Live ATS Preview  |  | - Skill Radar    |  |
|  | - Action Items      |  | - Dynamic Checklist  |  | - A4 PDF Export     |  | - Gap Assessment |  |
|  | - Matched Jobs Feed |  | - Completion Score   |  | - Version Management|  | - Benchmark Calc |  |
|  +---------------------+  +----------------------+  +---------------------+  +------------------+  |
|  +---------------------+  +----------------------+  +---------------------+  +------------------+  |
|  | Application Tracker |  | Saved Jobs & Alerts  |  | Deterministic Scorer|  | AI Copilot Hub   |  |
|  | - Timeline History  |  | - Bookmark Grid      |  | - ATS Rule Engine   |  | - Prompt Sandbox |  |
|  | - Stage Progression |  | - Match Badges       |  | - Metric Detection  |  | - Bullet Enhancer|  |
|  | - Interview Notes   |  | - Alert Preferences  |  | - Action Verb Checks|  | - Pluggable Hook |  |
|  +---------------------+  +----------------------+  +---------------------+  +------------------+  |
+---------------------------------------------------+------------------------------------------------+
                                                    | (REST APIs with JWT Bearer & Cookie Auth)
                                                    v
+----------------------------------------------------------------------------------------------------+
|                                   BACKEND APPLICATION SERVER (EXPRESS)                             |
|                                                                                                    |
|  +-----------------------------------------------------------------------------------------------+ |
|  | Security & Auth Layer: Rate Limiting | Helmet | JWT Verification | RBAC (JOB_SEEKER / ADMIN)  | |
|  +-----------------------------------------------------------------------------------------------+ |
|  | Controllers & Domain Services:                                                                | |
|  | - ProfileController: Dynamic completion % calc, section CRUD, verification flags             | |
|  | - ResumeController: Multi-resume CRUD, ATS parser, deterministic score calculation             | |
|  | - MatchingService: Explainable weighted affinity algorithm (Skills 40%, Exp 25%, Loc 15%...)   | |
|  | - ApplicationController: Application lifecycle, timeline audits, recruiter feedback view     | |
|  | - SkillService: Skill categorization, frequency aggregation, gap analysis logic               | |
|  | - SavedJobController: Bookmarks, job alert preference management                             | |
|  +-----------------------------------------------------------------------------------------------+ |
+---------------------------------------------------+------------------------------------------------+
                                                    | Mongoose ODM
                                                    v
+----------------------------------------------------------------------------------------------------+
|                                    MONGODB PERSISTENCE LAYER                                       |
|                                                                                                    |
|  +-------------------+  +-------------------+  +-------------------+  +--------------------------+ |
|  | Users Collection  |  | Profiles Col.     |  | Resumes Col.      |  | Applications Col.        | |
|  | - Core Auth & RBAC|  | - Granular Details|  | - Full CV Blobs   |  | - Status Timeline History| |
|  +-------------------+  +-------------------+  +-------------------+  +--------------------------+ |
|  +-------------------+  +-------------------+  +-------------------+                               |
|  | Jobs Collection   |  | SavedJobs Col.    |  | Skills Taxonomy   |                               |
|  | - Active Postings |  | - Candidate Links |  | - Master Library  |                               |
|  +-------------------+  +-------------------+  +-------------------+                               |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Subsystem Architecture & Modular Components

### 3.1 Profile Workspace Subsystem
- **Decoupled Architecture**: Separates basic user identity (`User` model) from rich candidate career data (`CandidateProfile` model).
- **Dynamic Completion Engine**: Deterministic calculation running on both backend (source of truth) and frontend (instant responsive feedback) using an 8-section weighted matrix:
  - Personal Info & Contact: 15%
  - Headline & Bio Summary: 10%
  - Work Experience (at least 1 entry): 20%
  - Education (at least 1 entry): 15%
  - Key Technical Skills (>= 5 skills): 15%
  - Projects / Portfolio (>= 1 project): 10%
  - Certifications / Licenses: 5%
  - Professional Links (GitHub/LinkedIn/Portfolio): 10%
  - *Total: 100%*

### 3.2 Resume Management & Builder Engine
- **Multi-Resume Support**: Candidates can maintain up to 5 targeted resumes (e.g., "Full-Stack Engineer", "Backend Go Specialist", "DevOps / SRE").
- **Live ATS Resume Builder**:
  - Split-pane layout: Form editor on left, real-time A4 scale-accurate rendered preview on right.
  - 3 ATS-optimized templates:
    1. **ATS Classic**: Traditional single-column, high-contrast, zero-graphic format favored by enterprise ATS parsers.
    2. **Modern Split**: Clean two-column sidebar layout for modern tech startups and product companies.
    3. **Minimal Tech**: Compact, monospace-accented layout designed specifically for senior software engineers.
- **Client-Side PDF Generation**: Direct HTML5/CSS vector print stylesheet engine (`window.print()` with `@page { size: A4 portrait; margin: 0; }` and jsPDF/html2canvas fallback) avoiding heavy server dependencies (like Chromium/Puppeteer) while guaranteeing sub-second exports.

### 3.3 Deterministic Resume Analyzer & Scorer
- Zero hallucination or random scores. Evaluates resume text/data against 4 strict criteria:
  1. **Section Completeness (25 pts)**: Contact, Summary, Experience, Education, Skills, Projects.
  2. **Action-Oriented Impact (25 pts)**: Frequency of strong action verbs (e.g., *Architected, Engineered, Optimized, Spearheaded, Reduced, Scaled*).
  3. **Quantifiable Metrics (25 pts)**: Regex detection of numbers, percentages, currency, latency metrics, user counts (e.g., *40% faster, $1.2M, 50k DAU, 99.99% uptime*).
  4. **ATS Formatting & Brevity (25 pts)**: Length optimization (400-900 words), bullet length consistency, contact info completeness (phone, email, LinkedIn).
- Generates categorized suggestions: **Critical Fixes**, **Improvements**, and **Strengths**.

### 3.4 Explainable Job Matching & Skill Gap Engine
- **Matching Score Formula**:
  $$\text{Match} = (\text{SkillScore} \times 0.40) + (\text{ExpScore} \times 0.25) + (\text{LocScore} \times 0.15) + (\text{WorkModeScore} \times 0.10) + (\text{JobTypeScore} \times 0.10)$$
- **Explainability**:
  - `matchedSkills`: List of intersecting required skills.
  - `missingSkills`: High-priority skills requested by the job that the candidate lacks.
  - `recommendations`: Actionable steps (e.g., *"Add Docker & Kubernetes to increase your match score from 72% to 94%"*).

### 3.5 Application Tracking Subsystem
- Full audit timeline per application:
  - `Applied` $\rightarrow$ `Under Review` $\rightarrow$ `Shortlisted` $\rightarrow$ `Technical Interview` $\rightarrow$ `Offer Extended` / `Closed`.
- History log records exact timestamps and notes for each transition.
- Attached snapshot of the specific resume version submitted at time of application.

---

## 4. Technology Stack & Integration Points

| Layer | Component | Choice & Rationale |
|---|---|---|
| **Frontend Framework** | React 19 + Vite | Fast hot reload, concurrent rendering, lightweight bundle. |
| **Routing** | React Router v7 | Nested workstation routes (`/candidate/dashboard`, `/candidate/profile`, `/candidate/resumes`, `/candidate/builder`, `/candidate/skills`, `/candidate/applications`, `/candidate/saved-jobs`). |
| **State Management** | Context API + Custom Hooks | Clean, predictable state for profile, resume editor, and active application filters without heavy Redux boilerplate. |
| **UI System** | JobPortal Design System | 24 reusable UI tokens & components (`Button`, `Card`, `Badge`, `Tabs`, `Modal`, `Drawer`, `Alert`, `Skeleton`, `ProgressBar`). |
| **Icons** | Lucide React | Consistent, lightweight vector iconography. |
| **Backend Framework** | Node.js + Express | Unified REST endpoints with centralized error handling. |
| **Database & ODM** | MongoDB + Mongoose | Highly flexible document schemas ideal for nested profile sections and multi-version resumes. |
| **Security & RBAC** | JWT + Cookie Auth | `requireAuth` & `requireRole("JOB_SEEKER")` ensuring candidate data isolation and zero cross-tenant leakage. |
| **PDF Generation** | CSS Paged Media + jsPDF | Instant client-side export without server memory overhead. |

---

## 5. Architectural Quality Attributes

1. **Deterministic Transparency**: Every score (Profile completion, Resume ATS score, Job Match affinity) is derived from explicit rules and mathematical formulas without opaque or non-reproducible outcomes.
2. **Data Integrity & Isolation**: Candidates can only read and mutate their own profile, resumes, and applications. Recruiter-internal notes remain hidden from candidates.
3. **Performance & Responsiveness**:
   - Complex match computations utilize database projections and indexed skill lookups.
   - Client-side optimistic UI updates for bookmarking and profile field edits.
4. **Backward Compatibility**: Existing Phase 1, Phase 2, and Phase 3 database schemas and routes continue to operate without breaking changes.
