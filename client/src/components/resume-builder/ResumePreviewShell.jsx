import React from "react";
import { ATSClassicTemplate } from "./templates/ATSClassicTemplate";
import { ModernProfessionalTemplate } from "./templates/ModernProfessionalTemplate";
import { MinimalExecutiveTemplate } from "./templates/MinimalExecutiveTemplate";

export const ResumePreviewShell = ({
  resume = {},
  content = {},
  zoom = 1,
  className = "",
}) => {
  const styling = content.styling || { fontSize: "MD", lineSpacing: "NORMAL", primaryColor: "#2563eb" };
  const templateId = resume.template || "ATS_CLASSIC";

  const renderTemplate = () => {
    switch (templateId) {
      case "MODERN_PROFESSIONAL":
        return <ModernProfessionalTemplate content={content} styling={styling} />;
      case "MINIMAL_EXECUTIVE":
        return <MinimalExecutiveTemplate content={content} styling={styling} />;
      case "ATS_CLASSIC":
      default:
        return <ATSClassicTemplate content={content} styling={styling} />;
    }
  };

  return (
    <div
      className={`resume-preview-scale-wrapper ${className}`}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "var(--space-6) var(--space-4)",
        transformOrigin: "top center",
        transform: `scale(${zoom})`,
        transition: "transform var(--transition-fast)",
      }}
    >
      {/* Physical A4 Canvas Container (210mm x 297mm min-height) */}
      <div
        id="resume-a4-canvas"
        className="resume-a4-sheet"
        style={{
          width: "210mm",
          minHeight: "297mm",
          backgroundColor: "#ffffff",
          color: "#1e293b",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          borderRadius: "2px",
          padding: "20mm 18mm",
          boxSizing: "border-box",
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
};

export default ResumePreviewShell;
