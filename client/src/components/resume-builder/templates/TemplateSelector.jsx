import React from "react";
import { Badge } from "../../ui/Badge";
import { Check, FileText, Sparkles, Award } from "lucide-react";

export const TEMPLATES = [
  {
    id: "ATS_CLASSIC",
    name: "ATS Classic",
    tag: "Highest ATS Score",
    badgeVariant: "success",
    desc: "Single-column standardized hierarchy with maximum machine readability for enterprise ATS filters.",
    icon: FileText,
  },
  {
    id: "MODERN_PROFESSIONAL",
    name: "Modern Professional",
    tag: "Recommended",
    badgeVariant: "primary",
    desc: "Sleek accent borders, badge skills, and balanced structural spacing for tech and corporate roles.",
    icon: Sparkles,
  },
  {
    id: "MINIMAL_EXECUTIVE",
    name: "Minimal Executive",
    tag: "Leadership & Senior",
    badgeVariant: "neutral",
    desc: "Refined serif typography, high information density, and elegant minimalist layout.",
    icon: Award,
  },
];

export const TemplateSelector = ({
  currentTemplate = "ATS_CLASSIC",
  onSelectTemplate,
}) => {
  return (
    <div className="template-selector" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: "0 0 var(--space-1) 0" }}>
        Choose a layout template. Your structured content will instantly re-render without losing any data.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-3)" }}>
        {TEMPLATES.map((tmpl) => {
          const isSelected = currentTemplate === tmpl.id;
          const Icon = tmpl.icon;

          return (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-md)",
                backgroundColor: isSelected ? "var(--primary-subtle)" : "var(--bg-surface)",
                border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: isSelected ? "var(--primary)" : "var(--bg-secondary)",
                  color: isSelected ? "#ffffff" : "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <strong style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                      {tmpl.name}
                    </strong>
                    <Badge variant={tmpl.badgeVariant} styleVariant="subtle" size="sm" style={{ fontSize: "10px" }}>
                      {tmpl.tag}
                    </Badge>
                  </div>

                  {isSelected && (
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: "var(--primary)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                  {tmpl.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default TemplateSelector;
