# 🎨 JobPortal 2.0 — Design System Specification

**Design Philosophy:** Modern SaaS • High-Precision Minimalism • Purposeful Color • Breathable Whitespace  
**Inspiration Level:** Linear, Stripe Dashboard, Notion, Vercel, Wellfound

---

## 1. Color Tokens & Theme Architecture

The system supports **Light Mode** and **Dark Mode** via CSS variables attached to the root `<html>` element (`data-theme="light"` / `data-theme="dark"`).

### 1.1 Neutral Foundations

| Token Name | Light Mode | Dark Mode | Purpose |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#F8FAFC` (Slate 50) | `#090D16` (Deep Midnight) | Primary application background |
| `--bg-surface` | `#FFFFFF` (Pure White) | `#111827` (Gray 900) | Cards, Modals, Popovers |
| `--bg-subtle` | `#F1F5F9` (Slate 100) | `#1E293B` (Slate 800) | Secondary panels, pill badges, inputs |
| `--bg-muted` | `#E2E8F0` (Slate 200) | `#334155` (Slate 700) | Hover highlights, active tab states |
| `--border-subtle` | `#E2E8F0` (Slate 200) | `#1E293B` (Slate 800) | Primary card & section dividers |
| `--border-strong` | `#CBD5E1` (Slate 300) | `#334155` (Slate 700) | Active input borders, focused cards |
| `--text-primary` | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | Primary headlines, titles, active labels |
| `--text-secondary` | `#475569` (Slate 600) | `#94A3B8` (Slate 400) | Body copy, secondary descriptions |
| `--text-muted` | `#94A3B8` (Slate 400) | `#64748B` (Slate 500) | Timestamps, placeholders, inactive icons |

### 1.2 Brand & Semantic Tokens

| Token Name | Light Mode | Dark Mode | Semantic Meaning |
| :--- | :--- | :--- | :--- |
| `--primary-500` | `#4338CA` (Indigo 700) | `#6366F1` (Indigo 500) | Primary brand CTA, active links, accents |
| `--primary-hover` | `#3730A3` (Indigo 800) | `#4F46E5` (Indigo 600) | Hover state for primary buttons |
| `--primary-subtle` | `#EEF2FF` (Indigo 50) | `rgba(99, 102, 241, 0.15)` | Primary badge background, active nav item |
| `--success-500` | `#059669` (Emerald 600) | `#10B981` (Emerald 500) | Hired, offer extended, live status, ₹ salary |
| `--success-subtle` | `#ECFDF5` (Emerald 50) | `rgba(16, 185, 129, 0.15)` | Positive badges, verified badges |
| `--warning-500` | `#D97706` (Amber 600) | `#F59E0B` (Amber 500) | Shortlisted, interview scheduled, pending |
| `--warning-subtle` | `#FFFBEB` (Amber 50) | `rgba(245, 158, 11, 0.15)` | Warning alerts, notice period badges |
| `--danger-500` | `#E11D48` (Rose 600) | `#F43F5E` (Rose 500) | Application rejected, errors, delete action |
| `--danger-subtle` | `#FFF1F2` (Rose 50) | `rgba(244, 63, 94, 0.15)` | Error alerts, rejection badges |

---

## 2. Typography Scale

Using modern **Plus Jakarta Sans** for headings and **Inter** for readable body and data tables.

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-heading: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
```

| Type Scale | Size | Line Height | Weight | Letter Spacing | Target Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | 3.25rem (52px) | 1.15 | 800 | -0.03em | Landing Hero Headline |
| **H1** | 2.25rem (36px) | 1.25 | 800 | -0.025em | Main Page Titles, Dashboard Headers |
| **H2** | 1.5rem (24px) | 1.3 | 700 | -0.02em | Section Headers, Modal Titles |
| **H3** | 1.2rem (19.2px) | 1.35 | 700 | -0.015em | Job Card Titles, Widget Titles |
| **Body (Base)** | 1rem (16px) | 1.6 | 400 / 500 | 0 | Descriptions, Paragraphs, Articles |
| **Small** | 0.875rem (14px) | 1.5 | 500 / 600 | 0.01em | Table cells, Meta items, Form inputs |
| **Caption** | 0.75rem (12px) | 1.4 | 600 / 700 | 0.02em | Badges, Timestamps, Tag pills |

---

## 3. Spacing, Radius & Elevation

### 3.1 Elevation & Shadows
- `shadow-xs`: `0 1px 2px rgba(15, 23, 42, 0.04)` (Buttons, pill badges)
- `shadow-sm`: `0 2px 4px -1px rgba(15, 23, 42, 0.06)` (Cards at rest)
- `shadow-md`: `0 8px 16px -4px rgba(15, 23, 42, 0.08)` (Dropdown menus, Card hover)
- `shadow-lg`: `0 16px 24px -6px rgba(15, 23, 42, 0.1)` (Modals, Slide-over drawers)
- `shadow-glow`: `0 0 20px rgba(67, 56, 202, 0.2)` (Hero elements, Active CTA glow)

### 3.2 Border Radius
- `--radius-xs`: `4px` (Small tags, status dots)
- `--radius-sm`: `8px` (Buttons, form controls, pills)
- `--radius-md`: `12px` (Cards, dialog headers, tables)
- `--radius-lg`: `18px` (Large modal dialogs, hero containers)
- `--radius-full`: `9999px` (Avatars, pills, circular buttons)

---

## 4. Component Standards

### 4.1 Button Variants
1. **Primary:** Solid Deep Indigo background with white text and subtle elevation. Hover translates -1px with enhanced shadow.
2. **Secondary:** Clean white/slate-800 surface with 1px border.
3. **Outline:** Transparent background with primary/danger border.
4. **Ghost:** Zero border, subtle background highlight on hover.
5. **Accent:** Gradient CTA for high-conversion actions (Post Job, Publish).

### 4.2 Form Controls
- Consistent `44px` minimum height on desktop, `48px` on mobile for touch accessibility.
- Left-aligned contextual icons (e.g. search, mail, lock, rupee).
- Subtle focus ring: `box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.2)`.

### 4.3 Badges
- Standardized `24px` height with font-size `0.78rem` and font-weight `700`.
- Color coded:
  - **Job Types:** Blue (Full-time), Purple (Part-time), Green (Internship), Amber (Contract)
  - **Work Mode:** Slate (On-site), Cyan (Remote), Indigo (Hybrid)
  - **Status:** Blue (Applied), Amber (Shortlisted), Green (Selected/Offer), Rose (Rejected)

---

## 5. Micro-Interactions & Animation Guidelines
- **Durations:** `150ms` for micro-hover; `250ms` for modals/drawers; `350ms` for tab cross-fades.
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard curve).
- **Rule:** Never animate elements just for decoration. Animations must signal state transitions, data loading, or user feedback.
