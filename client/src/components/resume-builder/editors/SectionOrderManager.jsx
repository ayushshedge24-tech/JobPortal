import React from "react";
import { CANONICAL_SECTIONS } from "../SectionNavigator";
import { Card } from "../../ui/Card";
import { Switch } from "../../ui/Switch";
import { ChevronUp, ChevronDown, Eye, EyeOff, GripVertical } from "lucide-react";

export const SectionOrderManager = ({
  sectionOrder = [],
  sectionVisibility = {},
  onOrderChange,
  onVisibilityChange,
}) => {
  const currentOrder = Array.isArray(sectionOrder) && sectionOrder.length > 0
    ? sectionOrder
    : CANONICAL_SECTIONS.map((s) => s.id);

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
    const updated = [...currentOrder];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onOrderChange(updated);
  };

  const handleToggleVisibility = (sectionId, isVisible) => {
    onVisibilityChange({
      ...sectionVisibility,
      [sectionId]: isVisible,
    });
  };

  return (
    <div className="section-order-manager" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: "0 0 var(--space-2) 0" }}>
        Rearrange how sections appear on your resume or toggle off sections you wish to hide from the live view and PDF export.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {currentOrder.map((sectionId, idx) => {
          const meta = CANONICAL_SECTIONS.find((s) => s.id === sectionId) || {
            id: sectionId,
            label: sectionId,
            desc: "",
          };
          const Icon = meta.icon;
          const isVisible = sectionVisibility[sectionId] !== false;

          return (
            <div
              key={sectionId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-3) var(--space-4)",
                backgroundColor: isVisible ? "var(--bg-surface)" : "var(--bg-secondary)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                opacity: isVisible ? 1 : 0.65,
                transition: "all var(--transition-fast)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    width: "20px",
                  }}
                >
                  #{idx + 1}
                </span>

                {Icon && (
                  <div
                    style={{
                      color: isVisible ? "var(--primary)" : "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Icon size={18} />
                  </div>
                )}

                <div>
                  <strong style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", display: "block" }}>
                    {meta.label}
                  </strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {meta.desc}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                {/* Visibility Switch */}
                <Switch
                  id={`vis-switch-${sectionId}`}
                  checked={isVisible}
                  onChange={(checked) => handleToggleVisibility(sectionId, checked)}
                />

                {/* Move Up/Down */}
                <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    className="btn btn-ghost btn-icon btn-sm"
                    title="Move Up"
                    aria-label={`Move ${meta.label} up`}
                    style={{ padding: "4px" }}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === currentOrder.length - 1}
                    className="btn btn-ghost btn-icon btn-sm"
                    title="Move Down"
                    aria-label={`Move ${meta.label} down`}
                    style={{ padding: "4px" }}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default SectionOrderManager;
