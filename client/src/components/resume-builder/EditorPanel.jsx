import React from "react";
import { SectionNavigator } from "./SectionNavigator";
import { SectionEditorHost } from "./SectionEditorHost";

export const EditorPanel = ({
  activeSection = "PERSONAL",
  onSelectSection,
  content = {},
  resume = {},
  onContentChange,
  onTemplateChange,
  className = "",
}) => {
  // Compute count of entries per section
  const contentCounts = React.useMemo(() => ({
    PERSONAL: content.personal && content.personal.fullName ? 1 : 0,
    SUMMARY: content.summary ? 1 : 0,
    EXPERIENCE: Array.isArray(content.experience) ? content.experience.length : 0,
    EDUCATION: Array.isArray(content.education) ? content.education.length : 0,
    SKILLS: Array.isArray(content.skills) ? content.skills.length : 0,
    PROJECTS: Array.isArray(content.projects) ? content.projects.length : 0,
    CERTIFICATIONS: Array.isArray(content.certifications) ? content.certifications.length : 0,
    ACHIEVEMENTS: Array.isArray(content.achievements) ? content.achievements.length : 0,
    LANGUAGES: Array.isArray(content.languages) ? content.languages.length : 0,
    CUSTOM: Array.isArray(content.customSections) ? content.customSections.length : 0,
  }), [content]);

  return (
    <div
      className={`editor-panel ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
        height: "100%",
        padding: "var(--space-4) var(--space-5)",
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        overflowY: "auto",
      }}
    >
      {/* Section Navigator */}
      <SectionNavigator
        activeSection={activeSection}
        onSelectSection={onSelectSection}
        sectionOrder={content.sectionOrder}
        sectionVisibility={content.sectionVisibility}
        contentCounts={contentCounts}
      />

      {/* Active Section Editor Container */}
      <SectionEditorHost
        activeSection={activeSection}
        content={content}
        resume={resume}
        onContentChange={onContentChange}
        onTemplateChange={onTemplateChange}
      />
    </div>
  );
};
export default EditorPanel;
