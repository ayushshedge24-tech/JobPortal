import React, { useState } from "react";
import { Input } from "../../ui/Input";
import { Textarea } from "../../ui/Textarea";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { BulletPointsManager } from "./BulletPointsManager";
import { Plus, Trash2, ChevronUp, ChevronDown, FolderGit2, Globe, Code2, Calendar, Tag, X } from "lucide-react";

export const ProjectsEditor = ({ items = [], onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [newTechText, setNewTechText] = useState("");

  const handleAddItem = () => {
    if (items.length >= 12) return;
    const newItem = {
      title: "",
      subtitle: "",
      technologies: [],
      url: "",
      repoUrl: "",
      startDate: "",
      endDate: "",
      description: "",
      bulletPoints: [],
    };
    const updated = [...items, newItem];
    onChange(updated);
    setExpandedIndex(updated.length - 1);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleDeleteItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex >= updated.length) {
      setExpandedIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
    setExpandedIndex(targetIndex);
  };

  const handleAddTech = (projectIndex) => {
    const tech = newTechText.trim();
    if (!tech) return;
    const currentTechs = items[projectIndex].technologies || [];
    if (currentTechs.includes(tech)) return;

    handleUpdateItem(projectIndex, "technologies", [...currentTechs, tech]);
    setNewTechText("");
  };

  const handleDeleteTech = (projectIndex, techIndex) => {
    const currentTechs = items[projectIndex].technologies || [];
    handleUpdateItem(
      projectIndex,
      "technologies",
      currentTechs.filter((_, i) => i !== techIndex)
    );
  };

  const isSafeUrl = (urlStr) => {
    if (!urlStr || typeof urlStr !== "string") return true;
    const trimmed = urlStr.trim();
    if (trimmed.length === 0) return true;
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("data:") ||
      lower.startsWith("vbscript:") ||
      lower.startsWith("file:")
    ) {
      return false;
    }
    return true;
  };

  return (
    <div className="projects-editor" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0 }}>
          Highlight your key projects, open-source work, or side projects ({items.length}/12 entries).
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          disabled={items.length >= 12}
        >
          <Plus size={15} />
          <span>Add Project</span>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card
          variant="default"
          padding="lg"
          style={{
            textAlign: "center",
            padding: "var(--space-8) var(--space-4)",
            border: "1px dashed var(--border-medium)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--space-3) auto",
            }}
          >
            <FolderGit2 size={22} />
          </div>
          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
            No Projects Added
          </h4>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", maxWidth: "340px", margin: "0 auto var(--space-4) auto" }}>
            Add software projects, products, or portfolios to show practical problem-solving.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={handleAddItem}>
            <Plus size={15} />
            <span>Add First Project</span>
          </Button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {items.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const titleDisplay = item.title || `Project #${idx + 1}`;

            return (
              <Card
                key={item._id || idx}
                variant="default"
                padding="none"
                style={{
                  border: isExpanded ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                  style={{
                    padding: "var(--space-3) var(--space-4)",
                    backgroundColor: isExpanded ? "var(--bg-secondary)" : "var(--bg-surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", overflow: "hidden" }}>
                    <FolderGit2 size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {titleDisplay}
                    </span>
                    {item.subtitle && (
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                        — {item.subtitle}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Move Up"
                      aria-label="Move Up"
                      style={{ padding: "4px" }}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Move Down"
                      aria-label="Move Down"
                      style={{ padding: "4px" }}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Delete Entry"
                      aria-label="Delete Entry"
                      style={{ color: "var(--danger)", padding: "4px" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
                      <Input
                        label="Project Title"
                        placeholder="e.g. JobPortal 2.0"
                        value={item.title || ""}
                        onChange={(e) => handleUpdateItem(idx, "title", e.target.value)}
                        maxLength={120}
                        required
                      />

                      <Input
                        label="Subtitle / Role / Scope"
                        placeholder="e.g. Full Stack Recruitment Platform"
                        value={item.subtitle || ""}
                        onChange={(e) => handleUpdateItem(idx, "subtitle", e.target.value)}
                        maxLength={120}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-3)" }}>
                      <Input
                        label="Live Demo URL"
                        placeholder="https://myproject.com"
                        value={item.url || ""}
                        onChange={(e) => handleUpdateItem(idx, "url", e.target.value)}
                        maxLength={250}
                        startIcon={<Globe size={16} />}
                        error={!isSafeUrl(item.url) ? "Invalid URL protocol" : undefined}
                      />

                      <Input
                        label="Source Code / Repository URL"
                        placeholder="https://github.com/user/project"
                        value={item.repoUrl || ""}
                        onChange={(e) => handleUpdateItem(idx, "repoUrl", e.target.value)}
                        maxLength={250}
                        startIcon={<Code2 size={16} />}
                        error={!isSafeUrl(item.repoUrl) ? "Invalid URL protocol" : undefined}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)" }}>
                      <Input
                        label="Start Date"
                        placeholder="e.g. Jan 2023"
                        value={item.startDate || ""}
                        onChange={(e) => handleUpdateItem(idx, "startDate", e.target.value)}
                        maxLength={30}
                        startIcon={<Calendar size={16} />}
                      />

                      <Input
                        label="End Date / Status"
                        placeholder="e.g. May 2023 or Ongoing"
                        value={item.endDate || ""}
                        onChange={(e) => handleUpdateItem(idx, "endDate", e.target.value)}
                        maxLength={30}
                        startIcon={<Calendar size={16} />}
                      />
                    </div>

                    {/* Technologies Tags */}
                    <div>
                      <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--space-1)", display: "block" }}>
                        Tech Stack / Technologies Used
                      </label>
                      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                        <Input
                          placeholder="Add technology (e.g. Node.js, React, Docker)..."
                          value={newTechText}
                          onChange={(e) => setNewTechText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTech(idx);
                            }
                          }}
                          maxLength={40}
                          style={{ fontSize: "var(--text-xs)" }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTech(idx)}
                          disabled={!newTechText.trim()}
                        >
                          <Plus size={14} />
                          <span>Add</span>
                        </Button>
                      </div>

                      {Array.isArray(item.technologies) && item.technologies.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {item.technologies.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 8px",
                                borderRadius: "var(--radius-sm)",
                                backgroundColor: "var(--bg-secondary)",
                                border: "1px solid var(--border-subtle)",
                                fontSize: "11px",
                                color: "var(--text-primary)",
                              }}
                            >
                              <Tag size={10} style={{ color: "var(--primary)" }} />
                              {t}
                              <button
                                type="button"
                                onClick={() => handleDeleteTech(idx, tIdx)}
                                style={{ border: "none", background: "transparent", cursor: "pointer", padding: "1px", color: "var(--text-muted)" }}
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <Textarea
                      label="Project Description"
                      placeholder="High level overview of what problem this project solves and its architecture..."
                      value={item.description || ""}
                      onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                      rows={3}
                      maxLength={1500}
                    />

                    <BulletPointsManager
                      bulletPoints={item.bulletPoints || []}
                      onChange={(newBullets) => handleUpdateItem(idx, "bulletPoints", newBullets)}
                      maxBullets={10}
                      label="Key Features & Technical Achievements"
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ProjectsEditor;
