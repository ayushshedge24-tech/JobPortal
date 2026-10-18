import React, { useState } from "react";
import { Input } from "../../ui/Input";
import { Textarea } from "../../ui/Textarea";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Switch } from "../../ui/Switch";
import { BulletPointsManager } from "./BulletPointsManager";
import { Plus, Trash2, ChevronUp, ChevronDown, Briefcase, Calendar, MapPin, Building } from "lucide-react";

export const ExperienceEditor = ({ items = [], onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const handleAddItem = () => {
    if (items.length >= 15) return;
    const newItem = {
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      bulletPoints: [],
    };
    const updated = [...items, newItem];
    onChange(updated);
    setExpandedIndex(updated.length - 1);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    if (field === "isCurrent" && value === true) {
      current.endDate = "Present";
    }
    updated[index] = current;
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

  return (
    <div className="experience-editor" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Header / Add Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0 }}>
          Add your work history starting from your most recent position ({items.length}/15 entries).
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          disabled={items.length >= 15}
        >
          <Plus size={15} />
          <span>Add Position</span>
        </Button>
      </div>

      {/* Items List */}
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
            <Briefcase size={22} />
          </div>
          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
            No Work Experience Added
          </h4>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", maxWidth: "340px", margin: "0 auto var(--space-4) auto" }}>
            Add internships, full-time, part-time, or freelance roles to showcase your career journey.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={handleAddItem}>
            <Plus size={15} />
            <span>Add First Experience</span>
          </Button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {items.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const titleDisplay = item.role || item.company ? `${item.role || "Role"} ${item.company ? `@ ${item.company}` : ""}` : `Position #${idx + 1}`;

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
                {/* Collapsible Header */}
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
                    <Briefcase size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {titleDisplay}
                    </span>
                    {item.startDate && (
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
                        ({item.startDate} - {item.isCurrent ? "Present" : item.endDate || "End"})
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

                {/* Form Body */}
                {isExpanded && (
                  <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
                      <Input
                        label="Job Role / Title"
                        placeholder="e.g. Senior Frontend Engineer"
                        value={item.role || ""}
                        onChange={(e) => handleUpdateItem(idx, "role", e.target.value)}
                        maxLength={120}
                        required
                      />

                      <Input
                        label="Company Name"
                        placeholder="e.g. Infosys / Swiggy"
                        value={item.company || ""}
                        onChange={(e) => handleUpdateItem(idx, "company", e.target.value)}
                        maxLength={120}
                        startIcon={<Building size={16} />}
                        required
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)" }}>
                      <Input
                        label="Location"
                        placeholder="e.g. Bengaluru, India (or Remote)"
                        value={item.location || ""}
                        onChange={(e) => handleUpdateItem(idx, "location", e.target.value)}
                        maxLength={100}
                        startIcon={<MapPin size={16} />}
                      />

                      <Input
                        label="Start Date"
                        placeholder="e.g. Jun 2021"
                        value={item.startDate || ""}
                        onChange={(e) => handleUpdateItem(idx, "startDate", e.target.value)}
                        maxLength={30}
                        startIcon={<Calendar size={16} />}
                      />

                      <Input
                        label="End Date"
                        placeholder="e.g. Present or Aug 2023"
                        value={item.isCurrent ? "Present" : item.endDate || ""}
                        onChange={(e) => handleUpdateItem(idx, "endDate", e.target.value)}
                        disabled={item.isCurrent}
                        maxLength={30}
                        startIcon={<Calendar size={16} />}
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", margin: "var(--space-1) 0" }}>
                      <Switch
                        id={`exp-iscurrent-${idx}`}
                        checked={Boolean(item.isCurrent)}
                        onChange={(checked) => handleUpdateItem(idx, "isCurrent", checked)}
                        label="I currently work here"
                      />
                    </div>

                    <Textarea
                      label="Overview / Responsibilities (Optional)"
                      placeholder="High-level summary of your core responsibilities and team scope..."
                      value={item.description || ""}
                      onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                      rows={3}
                      maxLength={2000}
                    />

                    <BulletPointsManager
                      bulletPoints={item.bulletPoints || []}
                      onChange={(newBullets) => handleUpdateItem(idx, "bulletPoints", newBullets)}
                      maxBullets={10}
                      label="Key Accomplishments / Quantifiable Impact"
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
export default ExperienceEditor;
