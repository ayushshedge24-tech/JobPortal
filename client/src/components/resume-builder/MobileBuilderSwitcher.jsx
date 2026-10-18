import React from "react";
import { Edit3, Eye } from "lucide-react";

export const MobileBuilderSwitcher = ({
  activeTab = "editor", // editor | preview
  onTabChange,
  className = "",
}) => {
  return (
    <div
      className={`mobile-builder-switcher ${className}`}
      role="tablist"
      aria-label="Editor and Preview View Switcher"
      style={{
        display: "flex",
        padding: "3px",
        backgroundColor: "var(--bg-secondary)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
        width: "100%",
        maxWidth: "280px",
      }}
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "editor"}
        onClick={() => onTabChange("editor")}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "var(--space-2) var(--space-3)",
          borderRadius: "var(--radius-md)",
          border: "none",
          backgroundColor: activeTab === "editor" ? "var(--bg-surface)" : "transparent",
          color: activeTab === "editor" ? "var(--primary)" : "var(--text-secondary)",
          fontWeight: activeTab === "editor" ? 600 : 500,
          fontSize: "var(--text-xs)",
          boxShadow: activeTab === "editor" ? "var(--shadow-sm)" : "none",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
        }}
      >
        <Edit3 size={14} />
        <span>Editor</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "preview"}
        onClick={() => onTabChange("preview")}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "var(--space-2) var(--space-3)",
          borderRadius: "var(--radius-md)",
          border: "none",
          backgroundColor: activeTab === "preview" ? "var(--bg-surface)" : "transparent",
          color: activeTab === "preview" ? "var(--primary)" : "var(--text-secondary)",
          fontWeight: activeTab === "preview" ? 600 : 500,
          fontSize: "var(--text-xs)",
          boxShadow: activeTab === "preview" ? "var(--shadow-sm)" : "none",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
        }}
      >
        <Eye size={14} />
        <span>Live Preview</span>
      </button>
    </div>
  );
};
