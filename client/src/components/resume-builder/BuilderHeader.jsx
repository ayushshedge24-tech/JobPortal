import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Sparkles, Check, FileText } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { MobileBuilderSwitcher } from "./MobileBuilderSwitcher";
import { ResumePdfExportButton } from "./export/ResumePdfExporter";

export const BuilderHeader = ({
  resume = {},
  content = {},
  isDirty = false,
  saving = false,
  onSave,
  onImportProfile,
  activeMobileTab = "editor",
  onMobileTabChange,
  className = "",
}) => {
  return (
    <header
      className={`builder-header ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--space-3) var(--space-6)",
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        gap: "var(--space-4)",
      }}
    >
      {/* Left: Back Link & Resume Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Link
          to="/candidate/resumes"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            padding: "var(--space-1-5) var(--space-2-5)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-secondary)",
            transition: "all var(--transition-fast)",
          }}
          aria-label="Back to Resumes Hub"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Resumes</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <h1
            style={{
              fontSize: "var(--text-base)",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
              maxWidth: "240px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={resume.title || "Resume Builder"}
          >
            {resume.title || "Untitled Resume"}
          </h1>

          {resume.version && (
            <Badge variant="neutral" styleVariant="subtle">
              v{resume.version}
            </Badge>
          )}

          {resume.isPrimary && (
            <Badge variant="success" styleVariant="subtle">
              Primary
            </Badge>
          )}
        </div>
      </div>

      {/* Center: Mobile Segmented Switcher (Visible only on mobile/tablet) */}
      <div className="flex md:hidden" style={{ justifyContent: "center", flex: 1, maxWidth: "220px" }}>
        <MobileBuilderSwitcher
          activeTab={activeMobileTab}
          onTabChange={onMobileTabChange}
        />
      </div>

      {/* Right: Actions (Import Profile, Save Status, Export PDF, Save Button) */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2-5)" }}>
        {/* Status indicator */}
        <div
          className="hidden sm:flex"
          style={{
            alignItems: "center",
            gap: "6px",
            fontSize: "var(--text-xs)",
            color: isDirty ? "var(--warning)" : "var(--text-muted)",
            fontWeight: 500,
            marginRight: "4px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isDirty ? "var(--warning)" : "var(--success)",
            }}
          />
          <span>{isDirty ? "Unsaved edits" : "Synced"}</span>
        </div>

        {/* Profile Import Action */}
        <Button
          variant="outline"
          size="sm"
          startIcon={<Sparkles size={14} />}
          onClick={onImportProfile}
          className="hidden lg:flex"
          title="Import profile career records into this resume snapshot"
        >
          Import Profile
        </Button>

        {/* Resume Analyzer Action */}
        {resume._id && (
          <Link
            to={`/candidate/resumes/${resume._id}/analyze`}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="outline"
              size="sm"
              startIcon={<FileText size={14} />}
              title="Analyze resume completeness, ATS structure, and quality signals"
            >
              Analyze
            </Button>
          </Link>
        )}

        {/* Export PDF Button */}
        <ResumePdfExportButton
          resume={resume}
          content={content}
          variant="outline"
          size="sm"
        />

        {/* Save Button */}
        <Button
          variant="primary"
          size="sm"
          startIcon={<Save size={14} />}
          loading={saving}
          disabled={!isDirty || saving}
          onClick={onSave}
          title={isDirty ? "Save changes to cloud" : "All changes saved"}
        >
          Save
        </Button>
      </div>
    </header>
  );
};

export default BuilderHeader;
