import React, { useState } from "react";
import { Input } from "../../ui/Input";
import { Textarea } from "../../ui/Textarea";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Plus, Trash2, ChevronUp, ChevronDown, GraduationCap, Calendar, MapPin, Award } from "lucide-react";

export const EducationEditor = ({ items = [], onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const handleAddItem = () => {
    if (items.length >= 8) return;
    const newItem = {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      grade: "",
      description: "",
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
    <div className="education-editor" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0 }}>
          List your academic qualifications and degrees ({items.length}/8 entries).
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          disabled={items.length >= 8}
        >
          <Plus size={15} />
          <span>Add Education</span>
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
            <GraduationCap size={22} />
          </div>
          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
            No Education Added
          </h4>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", maxWidth: "340px", margin: "0 auto var(--space-4) auto" }}>
            Add your degrees, college, or school education details.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={handleAddItem}>
            <Plus size={15} />
            <span>Add First Education</span>
          </Button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {items.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const titleDisplay = item.degree || item.institution ? `${item.degree || "Degree"} ${item.institution ? `@ ${item.institution}` : ""}` : `Education #${idx + 1}`;

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
                    <GraduationCap size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {titleDisplay}
                    </span>
                    {item.endDate && (
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
                        ({item.startDate ? `${item.startDate} - ` : ""}{item.endDate})
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
                        label="Institution / University"
                        placeholder="e.g. IIT Bombay / Delhi University"
                        value={item.institution || ""}
                        onChange={(e) => handleUpdateItem(idx, "institution", e.target.value)}
                        maxLength={150}
                        required
                      />

                      <Input
                        label="Degree / Diploma"
                        placeholder="e.g. Bachelor of Technology (B.Tech)"
                        value={item.degree || ""}
                        onChange={(e) => handleUpdateItem(idx, "degree", e.target.value)}
                        maxLength={120}
                        required
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)" }}>
                      <Input
                        label="Field of Study / Major"
                        placeholder="e.g. Computer Science & Engineering"
                        value={item.fieldOfStudy || ""}
                        onChange={(e) => handleUpdateItem(idx, "fieldOfStudy", e.target.value)}
                        maxLength={120}
                      />

                      <Input
                        label="Location"
                        placeholder="e.g. Mumbai, India"
                        value={item.location || ""}
                        onChange={(e) => handleUpdateItem(idx, "location", e.target.value)}
                        maxLength={100}
                        startIcon={<MapPin size={16} />}
                      />

                      <Input
                        label="CGPA / Percentage / Grade"
                        placeholder="e.g. 8.8 / 10 or 85%"
                        value={item.grade || ""}
                        onChange={(e) => handleUpdateItem(idx, "grade", e.target.value)}
                        maxLength={30}
                        startIcon={<Award size={16} />}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)" }}>
                      <Input
                        label="Start Date / Year"
                        placeholder="e.g. 2018"
                        value={item.startDate || ""}
                        onChange={(e) => handleUpdateItem(idx, "startDate", e.target.value)}
                        maxLength={30}
                        startIcon={<Calendar size={16} />}
                      />

                      <Input
                        label="End Date / Passing Year"
                        placeholder="e.g. 2022"
                        value={item.endDate || ""}
                        onChange={(e) => handleUpdateItem(idx, "endDate", e.target.value)}
                        maxLength={30}
                        startIcon={<Calendar size={16} />}
                      />
                    </div>

                    <Textarea
                      label="Relevant Coursework or Highlights (Optional)"
                      placeholder="Data Structures, Algorithms, Distributed Systems, Dean's List..."
                      value={item.description || ""}
                      onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                      rows={2}
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
export default EducationEditor;
