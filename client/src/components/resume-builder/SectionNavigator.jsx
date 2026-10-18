import React from "react";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Trophy,
  Languages as LanguagesIcon,
  Layers,
  Eye,
  EyeOff,
  LayoutTemplate,
  Palette,
  Sliders,
} from "lucide-react";

export const CANONICAL_SECTIONS = [
  { id: "PERSONAL", label: "Personal Information", shortLabel: "Personal Info", icon: User, desc: "Name, headline, contact info, and portfolio links." },
  { id: "SUMMARY", label: "Professional Summary", shortLabel: "Summary", icon: FileText, desc: "Overview of your experience and key qualifications." },
  { id: "EXPERIENCE", label: "Work Experience", shortLabel: "Experience", icon: Briefcase, desc: "Employment history, achievements, and impact." },
  { id: "EDUCATION", label: "Education & Academics", shortLabel: "Education", icon: GraduationCap, desc: "Degrees, institutions, grades, and coursework." },
  { id: "SKILLS", label: "Technical & Soft Skills", shortLabel: "Skills", icon: Wrench, desc: "Categorized skills, tools, and proficiencies." },
  { id: "PROJECTS", label: "Featured Projects", shortLabel: "Projects", icon: FolderGit2, desc: "Software projects, portfolios, and tech stacks." },
  { id: "CERTIFICATIONS", label: "Certifications & Licenses", shortLabel: "Certifications", icon: Award, desc: "Industry certifications and credentials." },
  { id: "ACHIEVEMENTS", label: "Key Achievements & Honors", shortLabel: "Achievements", icon: Trophy, desc: "Awards, hackathon wins, and milestones." },
  { id: "LANGUAGES", label: "Languages", shortLabel: "Languages", icon: LanguagesIcon, desc: "Languages and fluency proficiencies." },
  { id: "CUSTOM", label: "Custom Sections", shortLabel: "Custom", icon: Layers, desc: "User-defined sections and custom highlights." },
];

export const DESIGN_SECTIONS = [
  { id: "TEMPLATE", label: "Resume Template", shortLabel: "Template", icon: LayoutTemplate, desc: "Switch between ATS Classic, Modern, and Minimal layouts." },
  { id: "STYLING", label: "Styling & Theme", shortLabel: "Styling & Colors", icon: Palette, desc: "Custom accent colors, font sizes, and spacing density." },
  { id: "ORDER", label: "Section Order & Visibility", shortLabel: "Section Order", icon: Sliders, desc: "Reorder canonical sections and toggle visibility." },
];

export const SectionNavigator = ({
  activeSection = "PERSONAL",
  onSelectSection,
  sectionOrder = [],
  sectionVisibility = {},
  contentCounts = {},
  className = "",
}) => {
  // Order content sections according to resume content sectionOrder, keeping PERSONAL at top
  const orderedSections = React.useMemo(() => {
    const personalSec = CANONICAL_SECTIONS.find((s) => s.id === "PERSONAL");
    const otherSections = CANONICAL_SECTIONS.filter((s) => s.id !== "PERSONAL");

    if (!Array.isArray(sectionOrder) || sectionOrder.length === 0) {
      return [personalSec, ...otherSections];
    }
    const orderMap = new Map(sectionOrder.map((id, index) => [id, index]));
    const sortedOthers = [...otherSections].sort((a, b) => {
      const idxA = orderMap.has(a.id) ? orderMap.get(a.id) : 999;
      const idxB = orderMap.has(b.id) ? orderMap.get(b.id) : 999;
      return idxA - idxB;
    });
    return [personalSec, ...sortedOthers];
  }, [sectionOrder]);

  return (
    <nav
      className={`section-navigator ${className}`}
      aria-label="Resume Section Navigator"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {/* Content Sections Group */}
      <div>
        <div
          style={{
            padding: "var(--space-1) var(--space-3)",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--text-muted)",
            marginBottom: "4px",
          }}
        >
          Resume Content
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {orderedSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            const isVisible = sec.id === "PERSONAL" || sectionVisibility[sec.id] !== false;
            const count = contentCounts[sec.id];

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.id)}
                aria-current={isActive ? "true" : undefined}
                className={`section-nav-item ${isActive ? "active" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid",
                  borderColor: isActive ? "var(--primary)" : "transparent",
                  backgroundColor: isActive ? "var(--primary-subtle)" : "transparent",
                  color: isActive ? "var(--primary)" : "var(--text-primary)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "var(--text-xs)",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Icon
                    size={15}
                    style={{
                      color: isActive ? "var(--primary)" : "var(--text-secondary)",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                  <span>{sec.shortLabel}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {count !== undefined && count > 0 && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "1px 5px",
                        borderRadius: "10px",
                        backgroundColor: isActive ? "var(--bg-surface)" : "var(--bg-secondary)",
                        color: isActive ? "var(--primary)" : "var(--text-secondary)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {count}
                    </span>
                  )}

                  {sec.id !== "PERSONAL" && (
                    <span
                      title={isVisible ? "Visible on resume" : "Hidden from resume"}
                      style={{
                        color: isVisible ? "var(--text-muted)" : "var(--danger)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Design & Layout Group */}
      <div>
        <div
          style={{
            padding: "var(--space-1) var(--space-3)",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--text-muted)",
            marginBottom: "4px",
          }}
        >
          Design & Layout
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {DESIGN_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.id)}
                aria-current={isActive ? "true" : undefined}
                className={`section-nav-item ${isActive ? "active" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid",
                  borderColor: isActive ? "var(--primary)" : "transparent",
                  backgroundColor: isActive ? "var(--primary-subtle)" : "transparent",
                  color: isActive ? "var(--primary)" : "var(--text-primary)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "var(--text-xs)",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Icon
                    size={15}
                    style={{
                      color: isActive ? "var(--primary)" : "var(--text-secondary)",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                  <span>{sec.shortLabel}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
export default SectionNavigator;
