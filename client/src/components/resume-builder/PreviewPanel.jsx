import React from "react";
import { ResumePreviewShell } from "./ResumePreviewShell";
import { Badge } from "../ui/Badge";
import { ZoomIn, ZoomOut, FileCheck } from "lucide-react";
import { ResumePdfExportButton } from "./export/ResumePdfExporter";

export const PreviewPanel = ({
  resume = {},
  content = {},
  zoom = 1,
  onChangeZoom,
  className = "",
}) => {
  const templateName = (resume.template || "ATS_CLASSIC").replace(/_/g, " ");

  return (
    <div
      className={`preview-panel ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--bg-secondary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Preview Controls Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-3) var(--space-5)",
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Badge variant="neutral" styleVariant="subtle" icon={<FileCheck size={12} />}>
            Template: {templateName}
          </Badge>
          <Badge variant="primary" styleVariant="outline" className="hidden sm:inline-flex">
            A4 Canvas (210 × 297mm)
          </Badge>
        </div>

        {/* Right: Export & Zoom Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <ResumePdfExportButton
            resume={resume}
            content={content}
            variant="outline"
            size="sm"
          />

          {/* Zoom Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "var(--bg-secondary)",
              padding: "2px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <button
              type="button"
              onClick={() => onChangeZoom(Math.max(0.75, zoom - 0.25))}
              disabled={zoom <= 0.75}
              aria-label="Zoom out"
              style={{
                background: "transparent",
                border: "none",
                cursor: zoom <= 0.75 ? "not-allowed" : "pointer",
                padding: "4px 6px",
                display: "flex",
                alignItems: "center",
                color: zoom <= 0.75 ? "var(--text-muted)" : "var(--text-primary)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <ZoomOut size={14} />
            </button>

            <span
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                minWidth: "42px",
                textAlign: "center",
                color: "var(--text-primary)",
              }}
            >
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              onClick={() => onChangeZoom(Math.min(1.25, zoom + 0.25))}
              disabled={zoom >= 1.25}
              aria-label="Zoom in"
              style={{
                background: "transparent",
                border: "none",
                cursor: zoom >= 1.25 ? "not-allowed" : "pointer",
                padding: "4px 6px",
                display: "flex",
                alignItems: "center",
                color: zoom >= 1.25 ? "var(--text-muted)" : "var(--text-primary)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Center Scrollable Canvas Viewport */}
      <div
        className="preview-viewport-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "var(--space-6) var(--space-4)",
        }}
      >
        <ResumePreviewShell
          resume={resume}
          content={content}
          zoom={zoom}
        />
      </div>
    </div>
  );
};

export default PreviewPanel;
