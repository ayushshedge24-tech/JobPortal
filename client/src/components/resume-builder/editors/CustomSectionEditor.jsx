import React, { useState } from "react";
import { Input } from "../../ui/Input";
import { Textarea } from "../../ui/Textarea";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { BulletPointsManager } from "./BulletPointsManager";
import { Plus, Trash2, ChevronUp, ChevronDown, Layers, Calendar } from "lucide-react";

export const CustomSectionEditor = ({ sections = [], onChange }) => {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const handleAddSection = () => {
    if (sections.length >= 3) return;
    const count = sections.length + 1;
    const safeId = `custom_sec_${Date.now().toString(36)}`.slice(0, 32);
    const newSection = {
      id: safeId,
      title: `Custom Section ${count}`,
      items: [],
    };
    const updated = [...sections, newSection];
    onChange(updated);
    setActiveSectionIndex(updated.length - 1);
  };

  const handleDeleteSection = (secIndex) => {
    const updated = sections.filter((_, i) => i !== secIndex);
    onChange(updated);
    if (activeSectionIndex >= updated.length) {
      setActiveSectionIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleUpdateSectionTitle = (secIndex, newTitle) => {
    const updated = [...sections];
    updated[secIndex] = { ...updated[secIndex], title: newTitle };
    onChange(updated);
  };

  const handleAddItemToSection = (secIndex) => {
    const currentSection = sections[secIndex];
    if (!currentSection || (currentSection.items && currentSection.items.length >= 6)) return;

    const newItem = {
      title: "",
      subtitle: "",
      date: "",
      description: "",
      bulletPoints: [],
    };

    const updatedItems = [...(currentSection.items || []), newItem];
    const updated = [...sections];
    updated[secIndex] = { ...currentSection, items: updatedItems };
    onChange(updated);
  };

  const handleUpdateItem = (secIndex, itemIndex, field, value) => {
    const currentSection = sections[secIndex];
    const updatedItems = [...(currentSection.items || [])];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], [field]: value };
    const updated = [...sections];
    updated[secIndex] = { ...currentSection, items: updatedItems };
    onChange(updated);
  };

  const handleDeleteItem = (secIndex, itemIndex) => {
    const currentSection = sections[secIndex];
    const updatedItems = currentSection.items.filter((_, i) => i !== itemIndex);
    const updated = [...sections];
    updated[secIndex] = { ...currentSection, items: updatedItems };
    onChange(updated);
  };

  return (
    <div className="custom-section-editor" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0 }}>
          Create up to 3 custom sections (e.g. Volunteer Work, Publications, Patents) ({sections.length}/3 sections).
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSection}
          disabled={sections.length >= 3}
        >
          <Plus size={15} />
          <span>Add Custom Section</span>
        </Button>
      </div>

      {sections.length === 0 ? (
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
            <Layers size={22} />
          </div>
          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
            No Custom Sections
          </h4>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", maxWidth: "340px", margin: "0 auto var(--space-4) auto" }}>
            Add tailored sections like Publications, Volunteer Experience, Patents, or Speaking Engagements.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={handleAddSection}>
            <Plus size={15} />
            <span>Create Custom Section</span>
          </Button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {sections.map((section, secIdx) => {
            const itemsList = Array.isArray(section.items) ? section.items : [];

            return (
              <Card
                key={section.id || secIdx}
                variant="default"
                padding="md"
                style={{
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-surface)",
                }}
              >
                {/* Section Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    paddingBottom: "var(--space-3)",
                    borderBottom: "1px solid var(--border-subtle)",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Input
                      label="Section Title"
                      value={section.title || ""}
                      onChange={(e) => handleUpdateSectionTitle(secIdx, e.target.value)}
                      maxLength={80}
                      placeholder="e.g. Volunteer Experience or Publications"
                      required
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginTop: "20px" }}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddItemToSection(secIdx)}
                      disabled={itemsList.length >= 6}
                    >
                      <Plus size={14} />
                      <span>Add Item ({itemsList.length}/6)</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSection(secIdx)}
                      style={{ color: "var(--danger)" }}
                      title="Delete entire custom section"
                      aria-label="Delete section"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {/* Section Items */}
                {itemsList.length === 0 ? (
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "center", padding: "var(--space-4) 0" }}>
                    No items in this section yet. Click "Add Item" above.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {itemsList.map((item, itemIdx) => (
                      <div
                        key={item._id || itemIdx}
                        style={{
                          backgroundColor: "var(--bg-secondary)",
                          borderRadius: "var(--radius-md)",
                          padding: "var(--space-3)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>
                            Item #{itemIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(secIdx, itemIdx)}
                            className="btn btn-ghost btn-icon btn-sm"
                            style={{ color: "var(--danger)", padding: "2px" }}
                            title="Delete Item"
                            aria-label="Delete item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                          <Input
                            placeholder="Title / Heading (e.g. Lead Volunteer)"
                            value={item.title || ""}
                            onChange={(e) => handleUpdateItem(secIdx, itemIdx, "title", e.target.value)}
                            maxLength={120}
                            style={{ fontSize: "var(--text-xs)" }}
                          />

                          <Input
                            placeholder="Subtitle / Organization (e.g. Red Cross)"
                            value={item.subtitle || ""}
                            onChange={(e) => handleUpdateItem(secIdx, itemIdx, "subtitle", e.target.value)}
                            maxLength={120}
                            style={{ fontSize: "var(--text-xs)" }}
                          />

                          <Input
                            placeholder="Date / Duration (e.g. 2021 - Present)"
                            value={item.date || ""}
                            onChange={(e) => handleUpdateItem(secIdx, itemIdx, "date", e.target.value)}
                            maxLength={30}
                            startIcon={<Calendar size={14} />}
                            style={{ fontSize: "var(--text-xs)" }}
                          />
                        </div>

                        <Textarea
                          placeholder="Description / Context..."
                          value={item.description || ""}
                          onChange={(e) => handleUpdateItem(secIdx, itemIdx, "description", e.target.value)}
                          rows={2}
                          maxLength={1000}
                          style={{ fontSize: "var(--text-xs)", marginBottom: "var(--space-2)" }}
                        />

                        <BulletPointsManager
                          bulletPoints={item.bulletPoints || []}
                          onChange={(newBullets) => handleUpdateItem(secIdx, itemIdx, "bulletPoints", newBullets)}
                          maxBullets={10}
                          label="Key Contributions"
                        />
                      </div>
                    ))}
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
export default CustomSectionEditor;
