import React, { useState } from "react";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { Card } from "../../ui/Card";
import { Plus, Trash2, X, Sparkles, Code2 } from "lucide-react";

const VALID_CATEGORIES = [
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Cloud",
  "Data/AI",
  "Testing",
  "Tools",
  "Soft Skills",
  "Other",
];

const VALID_LEVELS = [
  { value: "", label: "No level displayed" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "EXPERT", label: "Expert" },
];

const POPULAR_SUGGESTIONS = [
  { name: "JavaScript", category: "Frontend" },
  { name: "React", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "Node.js", category: "Backend" },
  { name: "Express.js", category: "Backend" },
  { name: "Python", category: "Backend" },
  { name: "MongoDB", category: "Database" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Redis", category: "Database" },
  { name: "Docker", category: "DevOps" },
  { name: "AWS", category: "Cloud" },
  { name: "Git", category: "Tools" },
  { name: "REST APIs", category: "Backend" },
  { name: "System Design", category: "Backend" },
  { name: "Problem Solving", category: "Soft Skills" },
];

export const SkillsEditor = ({ items = [], onChange }) => {
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState("Frontend");
  const [level, setLevel] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("ALL");

  const handleAddSkill = (customName, customCategory) => {
    const name = (customName || skillName).trim();
    if (!name) return;
    if (items.length >= 40) return;

    // Check duplicate
    if (items.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      return;
    }

    const newSkill = {
      name,
      category: customCategory || category,
      level,
    };

    onChange([...items, newSkill]);
    setSkillName("");
  };

  const handleDeleteSkill = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleLevelChange = (index, newLevel) => {
    const updated = [...items];
    updated[index] = { ...updated[index], level: newLevel };
    onChange(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const filteredItems = selectedFilterCategory === "ALL"
    ? items
    : items.filter((s) => s.category === selectedFilterCategory);

  return (
    <div className="skills-editor" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Add New Skill Bar */}
      <Card
        variant="default"
        padding="md"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr auto", gap: "var(--space-2)", alignItems: "flex-end" }}>
          <Input
            label="Skill Name"
            placeholder="e.g. React, Docker, Python..."
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={60}
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={VALID_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />

          <Select
            label="Level (Optional)"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            options={VALID_LEVELS}
          />

          <Button
            type="button"
            variant="primary"
            onClick={() => handleAddSkill()}
            disabled={!skillName.trim() || items.length >= 40}
            style={{ height: "38px" }}
          >
            <Plus size={16} />
            <span>Add</span>
          </Button>
        </div>
      </Card>

      {/* Suggested Skills Chips */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          <Sparkles size={14} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>
            Quick suggestions (click to add):
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {POPULAR_SUGGESTIONS.filter((s) => !items.some((i) => i.name.toLowerCase() === s.name.toLowerCase())).map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddSkill(s.name, s.category)}
              className="btn btn-ghost"
              style={{
                fontSize: "var(--text-xs)",
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--bg-surface)",
                border: "1px dashed var(--border-medium)",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              + {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs by Category */}
      {items.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "var(--space-2)" }}>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>
            Added Skills ({items.length}/40)
          </span>

          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setSelectedFilterCategory("ALL")}
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                cursor: "pointer",
                backgroundColor: selectedFilterCategory === "ALL" ? "var(--primary)" : "transparent",
                color: selectedFilterCategory === "ALL" ? "#ffffff" : "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              All ({items.length})
            </button>
            {VALID_CATEGORIES.map((cat) => {
              const count = items.filter((s) => s.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFilterCategory(cat)}
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: selectedFilterCategory === cat ? "var(--primary)" : "transparent",
                    color: selectedFilterCategory === cat ? "#ffffff" : "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills Badges Grid */}
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
            <Code2 size={22} />
          </div>
          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
            No Skills Added
          </h4>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", maxWidth: "340px", margin: "0 auto var(--space-4) auto" }}>
            Add relevant technical competencies, tools, and domain knowledge.
          </p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {filteredItems.map((skill, idx) => {
            const actualIndex = items.findIndex((i) => i.name === skill.name);
            return (
              <div
                key={skill._id || idx}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
              >
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-primary)" }}>
                  {skill.name}
                </span>

                <span style={{ fontSize: "10px", color: "var(--text-muted)", backgroundColor: "var(--bg-secondary)", padding: "1px 4px", borderRadius: "3px" }}>
                  {skill.category}
                </span>

                {skill.level && (
                  <Badge variant="primary" styleVariant="subtle" size="sm" style={{ fontSize: "9px", padding: "1px 4px" }}>
                    {skill.level}
                  </Badge>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteSkill(actualIndex)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: "2px",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Remove skill"
                  aria-label={`Remove ${skill.name}`}
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default SkillsEditor;
