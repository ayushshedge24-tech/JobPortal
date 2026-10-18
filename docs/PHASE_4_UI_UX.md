# JobPortal 2.0 — Phase 4: UI/UX & Workstation Interaction Design

**Status:** Planned / Architecture Review  
**Version:** 2.0.0  
**Target:** Candidate Workstation Frontend Pages & Components  
**Design Foundation:** Phase 1 Design System Tokens & Atomic UI Components  

---

## 1. Visual Language & Workspace Principles

The Candidate Workstation embodies the design philosophy established in Phase 1:
- **Clean, High-Utility SaaS**: Designed for daily job hunting and career progression without distracting ornamental gradients or oversized cards.
- **Strict Theme Fidelity**: Seamless, flicker-free rendering across both **Light Mode** and **Dark Mode** utilizing semantic CSS variables (`var(--bg-card)`, `var(--text-main)`, `var(--primary)`, `var(--border)`).
- **Responsive Architecture**: First-class experience across mobile (390px–430px), tablet (768px), laptop (1024px–1280px), and wide desktop displays (1440px+).
- **Accessibility & Interaction**: Full keyboard navigation, visible focus rings, WCAG 2.1 AA color contrast, screen-reader friendly status announcements, and informative error banners.

---

## 2. Workstation Page Layouts & Component Hierarchy

```
+----------------------------------------------------------------------------------------------------+
| TOPBAR: Logo | Jobs | Applications | Workstation Menu | Theme Toggle | Candidate Avatar Menu       |
+----------------------------------------------------------------------------------------------------+
| WORKSTATION HEADER: Dynamic Greeting | Role Title | Profile Completion Bar | Quick Actions Toolbar |
+----------------------------------------------------------------------------------------------------+
| SUB-NAV TABS: [Overview]  [Profile]  [Resumes & Builder]  [Skill Gap]  [Applications]  [Saved Jobs]|
+----------------------------------------------------------------------------------------------------+
| PAGE CONTENT AREA (Nested Route Outlet)                                                            |
|                                                                                                    |
| Example 1: Overview Dashboard                                                                      |
| +-------------------------------------------------------+ +--------------------------------------+ |
| | 4 Metric Cards (Applications, Under Review, Interviews)| | Profile Strength Gauge & Next Actions | |
| +-------------------------------------------------------+ +--------------------------------------+ |
| | Active Applications Tracker Feed                      | | AI/Deterministic Job Match Feed       | |
| +-------------------------------------------------------+ +--------------------------------------+ |
|                                                                                                    |
| Example 2: Resume Builder (Split View)                                                             |
| +------------------------------------+ +---------------------------------------------------------+ |
| | LEFT: Section Editor Form Panes    | | RIGHT: Live A4 Scaled Preview Canvas                   | |
| | - Personal Info                    | | +-----------------------------------------------------+ | |
| | - Work Experience (Reorderable)    | | | [ATS Classic / Modern / Minimal Tech]               | | |
| | - Technical Skills                 | | | High-contrast, precise vector A4 typography         | | |
| | - Education & Certifications       | | +-----------------------------------------------------+ | |
| | - Save / Template Switcher Bar     | | [Download PDF] [Print] [Analyze ATS Score]            | | |
| +------------------------------------+ +---------------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Detailed Page Breakdown

### 3.1 Overview Dashboard (`/candidate/dashboard`)
1. **Welcome & Quick Health Banner**:
   - Personalized greeting with verified badge, primary resume status, and last activity timestamp.
   - Interactive profile completion meter with direct "Next Step" suggestion button (e.g., *"Add 2 projects to reach 90% strength"*).
2. **Key Metric Cards (4 Grid)**:
   - Total Applications Submitted
   - In Active Review / Screening
   - Shortlisted & Interview Calls
   - Offers Extended / Closed
3. **Smart Action Strip**:
   - Quick buttons: "Update Resume", "Run ATS Analyzer", "Check Skill Gaps", "Search Bangalore Roles".
4. **Active Applications Preview**:
   - Top 5 recent applications with progress step indicators and upcoming interview notes.
5. **High-Match Recommended Jobs Feed**:
   - Top 4 jobs calculated via explainable matching with affinity score badges (e.g., `92% Match`).

### 3.2 Master Profile Workspace (`/candidate/profile`)
1. **Multi-Section Navigator**:
   - Vertical tab bar on desktop / horizontal scrollable pill bar on mobile:
     - 1. Personal & Contact
     - 2. Headline & Bio Summary
     - 3. Work Experience
     - 4. Education
     - 5. Technical Skills
     - 6. Projects & Portfolio
     - 7. Certifications
     - 8. Job Preferences & Salary
2. **Form Interaction Architecture**:
   - Floating "Unsaved Changes" bar with "Discard" and "Save Changes" triggers.
   - Inline field validation with immediate visual feedback (e.g., Phone number format, LinkedIn URL validation).
   - Array item managers with add, edit, delete, and duplicate actions.

### 3.3 Resume Hub (`/candidate/resumes`)
1. **Resume Cards Grid**:
   - Displays up to 5 resumes with thumbnail previews, template badge, primary status toggle, and ATS score pill.
   - Quick action dropdown: "Edit in Builder", "Duplicate", "Download PDF", "Run ATS Analyzer", "Delete".
2. **Empty State**:
   - Clean illustration with CTA: "Create Your First ATS-Optimized Resume" or "Import from Profile".

### 3.4 Live Resume Builder (`/candidate/resumes/:id/edit`)
1. **Split-Screen Desktop Architecture**:
   - **Left Pane (50% width)**: Tabbed accordion form controls for each resume section. Reorderable bullet points with live character count recommendations.
   - **Right Pane (50% width, sticky)**: Real-time rendered A4 canvas with zoom controls (75%, 100%, 125%, Fit to Screen).
2. **Mobile / Tablet Adaptive Mode**:
   - Toggle switch at top: `[Edit Mode]` $\leftrightarrow$ `[Live Preview]`.
3. **Template Selector Bar**:
   - Instant template switching between `ATS Classic`, `Modern Split`, and `Minimal Tech` with zero state loss.
4. **Export Action Group**:
   - "Download PDF" (generates clean vector A4 PDF), "Print", and "Check ATS Score".

---

## 4. The 3 ATS Resume Templates

| Template Name | Target Industry / Persona | Design Characteristics | ATS Optimization Strategy |
|---|---|---|---|
| **1. ATS Classic** | Enterprise, BFSI, Traditional Tech, Fortune 500 | Single-column, standard serif/sans-serif, bold section headers, zero tables or complex columns. | 100% compliant with legacy enterprise ATS parsers (Workday, Taleo, Greenhouse). |
| **2. Modern Split** | High-growth Tech Startups, Product SaaS, Unicorns | Two-column asymmetric header, clean border dividers, left sidebar for skills and contact. | Semantic HTML layout ensuring parsers read left-to-right top-to-bottom sequentially. |
| **3. Minimal Tech** | Senior Software Engineers, SREs, Architects, Staff ICs | Compact vertical density, monospace-accented metadata tags, bullet-focused project impact. | High word density, optimized for technical hiring managers and GitHub/system link scanning. |

---

## 5. Deterministic Resume Analyzer UI (`/candidate/resume-analyzer`)

1. **Overall Health Gauge**:
   - Circular SVG gauge showing 0–100 score with qualitative badge (`Needs Work` < 60, `Good` 60–79, `Strong ATS Ready` 80–100).
2. **Multi-Dimensional Score Breakdown Cards**:
   - **Section Completeness** (Score / 25)
   - **Action Verbs & Impact** (Score / 25)
   - **Quantifiable Metrics** (Score / 25)
   - **ATS Formatting & Word Density** (Score / 25)
3. **Categorized Actionable Recommendations**:
   - **Critical Fixes (Red)**: Missing contact info, zero measurable achievements.
   - **Improvements (Amber)**: Suggestion to add 2–3 in-demand skills or add repository links.
   - **Strengths (Green)**: Optimal word count, strong action verbs, clean structure.

---

## 6. Skill & Skill Gap Workspace (`/candidate/skills`)

1. **Candidate Skills Matrix**:
   - Categorized pill tags with proficiency indicators (`Expert`, `Advanced`, `Intermediate`).
2. **Target Role Market Benchmark**:
   - Visual bar chart comparing candidate's skill set against active high-frequency skills in Indian tech hubs (Bengaluru, Pune, Hyderabad, Gurgaon).
3. **Target Job Gap Comparator**:
   - Allows candidate to select any active job to see an instant diff: `[Skills You Have]` vs `[Missing Required Skills]` with one-click "Add to Learning Plan".

---

## 7. Application Tracker & Timeline (`/candidate/applications`)

1. **Filter & Search Bar**:
   - Quick filters: `All`, `Under Review`, `Shortlisted`, `Interview Scheduled`, `Offer Extended`, `Archived`.
2. **Timeline Visualizer Card**:
   - Each application expands to show a stepped progress bar:
     $$\text{Applied (Sep 10)} \longrightarrow \text{Reviewed (Sep 12)} \longrightarrow \text{Technical Round (Sep 18)} \longrightarrow \text{Offer Stage}$$
3. **Interview Details Drawer**:
   - Displays interview round details, meeting links (if provided by recruiter), preparation notes, and submitted resume snapshot.

---

## 8. Data States & Error Handling

Every candidate page implements all 7 UI states using Phase 1 atomic components:
1. **Loading State**: Clean skeleton loaders matching exact layout dimensions.
2. **Empty State**: Contextual Lucide icon, clear explanation, and primary action button.
3. **Success / Saving State**: Non-blocking toast notification (`ToastProvider`) and inline save badge.
4. **Error State**: Actionable error card with retry trigger.
5. **Unauthorized State**: Redirects to `/login` with return URL preservation.
6. **No Search Results**: Suggestion to clear filters.
7. **Unsaved Changes Warning**: Modal prompt if user attempts to navigate away with dirty form state.
