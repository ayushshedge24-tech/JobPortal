import React, { useState } from "react";
import { Input } from "../../ui/Input";
import { Textarea } from "../../ui/Textarea";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Plus, Trash2, ChevronUp, ChevronDown, Trophy, Calendar } from "lucide-react";

export const AchievementsEditor = ({ items = [], onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const handleAddItem = () => {
    if (items.length >= 10) return;
    const newItem = {
      title: "",
      description: "",
      date: "",
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

  return (
    <div className="achievements-editor" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0 }}>
          Highlight honors, awards, hackathons, and key milestones ({items.length}/10 entries).
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          disabled={items.length >= 10}
        >
          <Plus size={15} />
          <span>Add Achievement</span>
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
            <Trophy size={22} />
          </div>
          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
            No Achievements Added
          </h4>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", maxWidth: "340px", margin: "0 auto var(--space-4) auto" }}>
            Add hackathon wins, top performer awards, publications, or competitive ranks.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={handleAddItem}>
            <Plus size={15} />
            <span>Add First Achievement</span>
          </Button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {items.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const titleDisplay = item.title || `Achievement #${idx + 1}`;

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
                    <Trophy size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {titleDisplay}
                    </span>
                    {item.date && (
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
                        ({item.date})
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
                        label="Achievement Title"
                        placeholder="e.g. Winner - Smart India Hackathon 2023"
                        value={item.title || ""}
                        onChange={(e) => handleUpdateItem(idx, "title", e.target.value)}
                        maxLength={150}
                        required
                      />

                      <Input
                        label="Date / Year"
                        placeholder="e.g. Nov 2023"
                        value={item.date || ""}
                        onChange={(e) => handleUpdateItem(idx, "date", e.target.value)}
                        maxLength={30}
                        startIcon={<Calendar size={16} />}
                      />
                    </div>

                    <Textarea
                      label="Details / Impact"
                      placeholder="Describe what you built or achieved, competition scale, or rank (e.g., 1st place out of 500+ teams)..."
                      value={item.description || ""}
                      onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                      rows={3}
                      maxLength={1000}
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
export default AchievementsEditor;
