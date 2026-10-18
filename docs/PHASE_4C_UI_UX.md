# JobPortal 2.0 — Phase 4C: UI/UX & Live Builder Interaction Design

**Status:** Planned / Architecture Review  
**Version:** 2.0.0 (Phase 4C)  
**Target:** Interactive Live Resume Builder UI & Template Renderer  
**Route:** `/candidate/resumes/:id/edit`  

---

## 1. Visual Hierarchy & Workstation Layout

The Resume Builder provides an integrated, split-screen desktop workstation that balances structured data editing with an instant, scale-accurate visual preview.

```
+----------------------------------------------------------------------------------------------------+
| TOPBAR: [< Back to Resumes] | Title: [Senior Full-Stack CV] ✏️ | [Template: ATS Classic ▼] | Status   |
|         [Import from Profile] | [Undo] [Redo] | [● Saved at 11:20 AM] | [Save Resume]             |
+----------------------------------------------------------------------------------------------------+
| WORKSPACE CONTAINER (Height: 100vh - 65px)                                                         |
|                                                                                                    |
| +-----------------------------------------+  +---------------------------------------------------+ |
| | LEFT PANE: Section Editors (40% width)  |  | RIGHT PANE: Live A4 Canvas Viewport (60% width)   | |
| | (Scrollable accordion / tabbed stack)   |  | (Sticky, centered, zoomable: 75% | 100% | 125%)    | |
| |                                         |  |                                                   | |
| | ▼ Personal & Contact Information        |  |  +---------------------------------------------+  | |
| |   [Full Name] [Headline] [Phone] [City] |  |  | [ A4 Canvas: 210mm x 297mm ]                |  | |
| |   [LinkedIn URL] [GitHub URL]           |  |  |                                             |  | |
| |                                         |  |  |  RAHUL SHARMA                           |  | |
| | ▼ Professional Summary (Bio)            |  |  |  Senior Software Engineer | Bengaluru, India |  | |
| |   [Textarea with character guidance]    |  |  |  rahul@example.com | +91 98765 43210        |  | |
| |                                         |  |  |  -----------------------------------------  |  | |
| | ▼ Work Experience (3 Entries)           |  |  |  PROFESSIONAL SUMMARY                       |  | |
| |   + [Role 1: Razorpay] [▲][▼][✕]        |  |  |  5+ years building scalable distributed...   |  | |
| |   + [Role 2: Swiggy]   [▲][▼][✕]        |  |  |                                             |  | |
| |   [+ Add Experience]                    |  |  |  WORK EXPERIENCE                            |  | |
| |                                         |  |  |  Senior SDE - Razorpay (2022 - Present)     |  | |
| | ▼ Technical Skills (12 Skills)          |  |  |  • Architected webhook pipeline...          |  | |
| | ▼ Education & Academics                 |  |  |  • Reduced payment retry latency by 45%...  |  | |
| | ▼ Featured Projects                     |  |  |                                             |  | |
| | ▼ Certifications & Credentials          |  |  |  [ Page Break Guide (Page 1 of 2) ]        |  | |
| | ▼ Section Order & Visibility Manager    |  |  +---------------------------------------------+  | |
| +-----------------------------------------+  +---------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Specifications for the 3 ATS Visual Templates

### 2.1 Template 1: `ATS_CLASSIC` (Traditional & Single-Column)
- **Target Persona**: Enterprise, BFSI, Traditional IT Services, Consulting, Government.
- **Design Rules**:
  - Pure single-column linear layout.
  - Standard sans-serif or clean serif typography hierarchy (`18pt` name, `11pt` section headers, `9.5pt` body text).
  - Bold uppercase section headers with a crisp horizontal line divider (`1px solid #333`).
  - Zero icons, zero colored background pills, zero complex multi-column grids that confuse legacy enterprise ATS parsers.
  - Bullet points indented cleanly (`margin-left: 1.25rem`).

### 2.2 Template 2: `MODERN_PROFESSIONAL` (Product & Tech Startup Layout)
- **Target Persona**: High-growth SaaS, Tech Unicorns, Consumer Tech, Product Companies.
- **Design Rules**:
  - Two-column asymmetric layout (Left column 32% width for Contact, Skills, Education, Languages; Right column 68% for Summary, Experience, Projects).
  - Semantic HTML grid guaranteeing left-to-right top-to-bottom reading order for modern parsers.
  - Subtle brand accent color on section headers (`primaryColor`).
  - Skill pills with clean border tags.

### 2.3 Template 3: `MINIMAL_EXECUTIVE` (Typography & Whitespace Density)
- **Target Persona**: Senior ICs, Principal Engineers, Engineering Managers, Executives.
- **Design Rules**:
  - High word density with generous margins and vertical rhythm.
  - Monospace-accented metadata tags (e.g. `[2022 – Present] • Bengaluru`).
  - Emphasizes project impact bullets with bold action verbs.

---

## 3. Section Reordering & Visibility Manager

1. **Section Order**:
   - Allows moving sections up or down using both accessible keyboard buttons (`[▲ Move Up]`, `[▼ Move Down]`) and intuitive drag handles.
   - Section sequence dynamically reorders the live canvas in real time.
2. **Section Visibility Toggle**:
   - Each section has an eye toggle `[👁 Active]` $\leftrightarrow$ `[✕ Hidden]`.
   - Disabled sections are omitted from the preview canvas without deleting the underlying form data.

---

## 4. Mobile & Tablet Adaptive Design

- **Mobile Viewport (390px – 430px)**:
  - Top sticky segmented control: `[ ✏️ Editor ]` $\longleftrightarrow$ `[ 👁 Live Preview ]`.
  - In `Editor` mode: Full-width accordion section forms, touch-friendly add/remove buttons, bottom sticky Save bar.
  - In `Live Preview` mode: Scaled A4 preview centered on screen with quick zoom pinch/controls.
- **Tablet Viewport (768px – 1024px)**:
  - 50/50 vertical split with synchronized scroll capability.

---

## 5. Accessibility & Theme Integration

- **WCAG 2.1 AA Compliance**: All text elements in the editor and preview exceed 4.5:1 contrast ratios.
- **Form Controls**: Explicit `<label>` associating with every input, helper text, and accessible `aria-invalid` attributes.
- **Print Theme Independence**: The Live Preview canvas renders on a high-contrast print white canvas surrounded by the application's active theme frame (Light or Dark), ensuring WYSIWYG accuracy for physical printing and PDF export.
