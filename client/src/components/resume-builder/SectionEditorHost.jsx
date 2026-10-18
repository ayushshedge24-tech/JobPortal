import React from "react";
import { CANONICAL_SECTIONS, DESIGN_SECTIONS } from "./SectionNavigator";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { PersonalSectionEditor } from "./editors/PersonalSectionEditor";
import { SummaryEditor } from "./editors/SummaryEditor";
import { ExperienceEditor } from "./editors/ExperienceEditor";
import { EducationEditor } from "./editors/EducationEditor";
import { SkillsEditor } from "./editors/SkillsEditor";
import { ProjectsEditor } from "./editors/ProjectsEditor";
import { CertificationsEditor } from "./editors/CertificationsEditor";
import { AchievementsEditor } from "./editors/AchievementsEditor";
import { LanguagesEditor } from "./editors/LanguagesEditor";
import { CustomSectionEditor } from "./editors/CustomSectionEditor";
import { SectionOrderManager } from "./editors/SectionOrderManager";
import { TemplateSelector } from "./templates/TemplateSelector";
import { StylingControls } from "./templates/StylingControls";

const ALL_SECTIONS = [...CANONICAL_SECTIONS, ...DESIGN_SECTIONS];

export const SectionEditorHost = ({
  activeSection = "PERSONAL",
  content = {},
  resume = {},
  onContentChange,
  onTemplateChange,
  className = "",
}) => {
  const sectionMeta = ALL_SECTIONS.find((s) => s.id === activeSection) || ALL_SECTIONS[0];
  const Icon = sectionMeta.icon;

  // Handle specific section changes
  const handleSectionDataChange = (field, value) => {
    onContentChange({
      ...content,
      [field]: value,
    });
  };

  const renderActiveEditor = () => {
    switch (activeSection) {
      case "PERSONAL":
        return (
          <PersonalSectionEditor
            data={content.personal || {}}
            onChange={(val) => handleSectionDataChange("personal", val)}
          />
        );

      case "SUMMARY":
        return (
          <SummaryEditor
            value={content.summary || ""}
            onChange={(val) => handleSectionDataChange("summary", val)}
          />
        );

      case "EXPERIENCE":
        return (
          <ExperienceEditor
            items={content.experience || []}
            onChange={(val) => handleSectionDataChange("experience", val)}
          />
        );

      case "EDUCATION":
        return (
          <EducationEditor
            items={content.education || []}
            onChange={(val) => handleSectionDataChange("education", val)}
          />
        );

      case "SKILLS":
        return (
          <SkillsEditor
            items={content.skills || []}
            onChange={(val) => handleSectionDataChange("skills", val)}
          />
        );

      case "PROJECTS":
        return (
          <ProjectsEditor
            items={content.projects || []}
            onChange={(val) => handleSectionDataChange("projects", val)}
          />
        );

      case "CERTIFICATIONS":
        return (
          <CertificationsEditor
            items={content.certifications || []}
            onChange={(val) => handleSectionDataChange("certifications", val)}
          />
        );

      case "ACHIEVEMENTS":
        return (
          <AchievementsEditor
            items={content.achievements || []}
            onChange={(val) => handleSectionDataChange("achievements", val)}
          />
        );

      case "LANGUAGES":
        return (
          <LanguagesEditor
            items={content.languages || []}
            onChange={(val) => handleSectionDataChange("languages", val)}
          />
        );

      case "CUSTOM":
        return (
          <CustomSectionEditor
            sections={content.customSections || []}
            onChange={(val) => handleSectionDataChange("customSections", val)}
          />
        );

      case "ORDER":
        return (
          <SectionOrderManager
            sectionOrder={content.sectionOrder}
            sectionVisibility={content.sectionVisibility}
            onOrderChange={(newOrder) => handleSectionDataChange("sectionOrder", newOrder)}
            onVisibilityChange={(newVis) => handleSectionDataChange("sectionVisibility", newVis)}
          />
        );

      case "TEMPLATE":
        return (
          <TemplateSelector
            currentTemplate={resume.template || "ATS_CLASSIC"}
            onSelectTemplate={(newTemplate) => {
              if (onTemplateChange) onTemplateChange(newTemplate);
            }}
          />
        );

      case "STYLING":
        return (
          <StylingControls
            styling={content.styling || {}}
            onChange={(newStyling) => handleSectionDataChange("styling", newStyling)}
          />
        );

      default:
        return <div>Select a section from the navigator.</div>;
    }
  };

  return (
    <div className={`section-editor-host ${className}`} style={{ width: "100%", paddingBottom: "var(--space-8)" }}>
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "var(--space-4)",
          paddingBottom: "var(--space-3)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--primary-subtle)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={18} />
          </div>

          <div>
            <h2
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {sectionMeta.label}
            </h2>
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-secondary)",
                margin: "2px 0 0 0",
              }}
            >
              {sectionMeta.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Active Editor Component */}
      <div className="active-editor-container">
        {renderActiveEditor()}
      </div>
    </div>
  );
};
export default SectionEditorHost;
