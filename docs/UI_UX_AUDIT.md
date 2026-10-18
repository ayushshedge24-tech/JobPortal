# 👁️ JobPortal 2.0 — UI/UX Audit & Interaction Design Standard

**Objective:** Elevate visual aesthetics, micro-interactions, responsive ergonomics, and cognitive clarity from a student prototype to a tier-1 commercial SaaS product.

---

## 1. Page-by-Page UX Audit & Transformation Blueprint

### 1.1 Landing Page (`/`)
- **Current Deficiencies:** Static layout with standard text blocks; lack of interactive demo feel; generic category tags.
- **JobPortal 2.0 Transformation:**
  - Modern hero headline: *"Find work that moves your career forward"* with an interactive live job search preview mockup.
  - Interactive company marquee showcasing verified Indian unicorn employers.
  - Value proposition tabs for Job Seekers (AI match, direct HR chat, transparent LPA) and Recruiters (instant candidate pipeline, automated ATS).
  - Live platform statistics counter and interactive salary insights ticker.

### 1.2 Job Search & Discovery (`/jobs`)
- **Current Deficiencies:** Single column list on mobile; no instant preview pane on desktop; page reload required for filter reset.
- **JobPortal 2.0 Transformation:**
  - 3-column split interface on wide screens (Filters sidebar + Results list + Sticky details preview).
  - Debounced real-time search updating URL parameters seamlessly.
  - Faceted filters for Salary brackets (LPA), Work Mode (Remote/Hybrid/On-site), Experience levels, and Tech skills.
  - 1-click **Save Job** bookmarking with animated micro-feedback.

### 1.3 Job Details View (`/jobs/:id`)
- **Current Deficiencies:** Flat text presentation; lacks company culture insights, benefits breakdown, or hiring process stages.
- **JobPortal 2.0 Transformation:**
  - Sticky header with quick apply button, company logo, verified badge, and compensation pill.
  - Structured tabs: *About Role*, *Responsibilities*, *Requirements & Skills Match*, *Company Culture & Benefits*, *Hiring Workflow*.
  - AI match score indicator comparing candidate's profile with required skills.

### 1.4 Candidate Dashboard (`/candidate-dashboard`)
- **Current Deficiencies:** Simple HTML table; no actionable profile checklist; lacks timeline visualization.
- **JobPortal 2.0 Transformation:**
  - Profile completeness ring meter with 1-click recommendations to reach 100%.
  - Visual Application Pipeline Kanban & Timeline (Applied → Under Review → Shortlisted → Interview Scheduled → Offer Extended).
  - Upcoming scheduled interviews card with countdown and direct meeting link.
  - Quick access to AI Resume Analyzer and Resume Builder tools.

### 1.5 Recruiter Dashboard (`/employer-dashboard`)
- **Current Deficiencies:** Basic table combining jobs and applicants; modal form lacks structured multi-step validation.
- **JobPortal 2.0 Transformation:**
  - Comprehensive SaaS recruiter cockpit with recruitment funnel analytics.
  - Full multi-step job posting wizard (Basics → Requirements → CTC & Perks → Interview Stages → Review & Publish).
  - Interactive ATS applicant pipeline with status drag/dropdown, private recruiter notes, and interview scheduler.

---

## 2. Interaction States Standard

Every interactive component and page must explicitly handle **5 States**:

```
[1. Loading Skeleton] ──► [2. Interactive Data Ready]
          │                           │
          ▼                           ▼
[3. Empty Illustrated State]   [4. Error with Recovery Action]
          │
          ▼
[5. Success Toast / Modal Confirmation]
```

1. **Loading State:** Smooth shimmering pulse skeletons matching exact card and row geometries.
2. **Empty State:** High-quality minimalist vector illustrations with contextual CTA (e.g. *"No applications yet — Discover jobs matching your React profile"*).
3. **Error State:** Clear human-readable explanation, error code, and a primary *"Retry"* or *"Go Back"* button.
4. **Success State:** Non-intrusive bottom-right toast notifications with automatic 4-second dismiss.
5. **Confirmation Dialogs:** Modal confirmations before destructive operations (e.g. withdrawing application, deleting job posting).

---

## 3. Accessibility & Responsive Ergonomics (WCAG 2.1 AA)

- **Keyboard Navigation:** Full focus trap in modals, visible focus rings (`:focus-visible`), and `Escape` key listeners on drawers/modals.
- **Color Contrast:** All text tokens maintain minimum `4.5:1` contrast ratio against their respective backgrounds in both light and dark modes.
- **Touch Target Sizes:** Minimum `44px × 44px` on mobile screens with bottom navigation bar for high thumb-zone reachability.
- **Responsive Layout Breakpoints:**
  - Mobile: `390px` to `640px` (single column, bottom navigation bar)
  - Tablet: `768px` to `1024px` (collapsible drawer filters)
  - Desktop: `1280px` to `1440px+` (3-column power layout)
