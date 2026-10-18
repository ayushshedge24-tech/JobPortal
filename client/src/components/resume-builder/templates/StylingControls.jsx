import React from "react";
import { Input } from "../../ui/Input";
import { Check, Palette, Type, AlignJustify } from "lucide-react";

const PRESET_COLORS = [
  { name: "Royal Blue", hex: "#2563eb" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Emerald", hex: "#059669" },
  { name: "Violet", hex: "#7c3aed" },
  { name: "Rose Pink", hex: "#db2777" },
  { name: "Amber", hex: "#d97706" },
  { name: "Slate", hex: "#475569" },
  { name: "Executive Dark", hex: "#0f172a" },
];

const FONT_SIZE_OPTIONS = [
  { id: "SM", label: "Small (9.5pt)" },
  { id: "MD", label: "Medium (10pt)" },
  { id: "LG", label: "Large (11pt)" },
];

const SPACING_OPTIONS = [
  { id: "COMPACT", label: "Compact (1.25)" },
  { id: "NORMAL", label: "Normal (1.35)" },
  { id: "RELAXED", label: "Relaxed (1.5)" },
];

export const StylingControls = ({
  styling = { fontSize: "MD", lineSpacing: "NORMAL", primaryColor: "#2563eb" },
  onChange,
}) => {
  const currentFontSize = styling.fontSize || "MD";
  const currentSpacing = styling.lineSpacing || "NORMAL";
  const currentColor = styling.primaryColor || "#2563eb";

  const handleUpdate = (field, value) => {
    onChange({
      ...styling,
      [field]: value,
    });
  };

  const handleCustomColorChange = (hex) => {
    let cleanHex = hex.trim();
    if (!cleanHex.startsWith("#")) {
      cleanHex = `#${cleanHex}`;
    }
    if (/^#([A-Fa-f0-9]{6})$/.test(cleanHex)) {
      handleUpdate("primaryColor", cleanHex);
    }
  };

  return (
    <div className="styling-controls" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Primary Color Palette */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          <Palette size={16} style={{ color: "var(--primary)" }} />
          <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>
            Accent Color Theme
          </label>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          {PRESET_COLORS.map((color) => {
            const isSelected = currentColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => handleUpdate("primaryColor", color.hex)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: color.hex,
                  border: isSelected ? "2.5px solid var(--text-primary)" : "1.5px solid rgba(0,0,0,0.15)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isSelected ? "0 0 0 2px var(--bg-surface)" : "none",
                  transition: "transform var(--transition-fast)",
                }}
                title={color.name}
                aria-label={`Select ${color.name}`}
              >
                {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Size Selection */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          <Type size={16} style={{ color: "var(--primary)" }} />
          <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>
            Typography Scale
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
          {FONT_SIZE_OPTIONS.map((opt) => {
            const isSelected = currentFontSize === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleUpdate("fontSize", opt.id)}
                style={{
                  padding: "var(--space-2) var(--space-2)",
                  fontSize: "11px",
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? "var(--primary)" : "var(--bg-secondary)",
                  color: isSelected ? "#ffffff" : "var(--text-secondary)",
                  border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Line Spacing Selection */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          <AlignJustify size={16} style={{ color: "var(--primary)" }} />
          <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>
            Line Spacing Density
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
          {SPACING_OPTIONS.map((opt) => {
            const isSelected = currentSpacing === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleUpdate("lineSpacing", opt.id)}
                style={{
                  padding: "var(--space-2) var(--space-2)",
                  fontSize: "11px",
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? "var(--primary)" : "var(--bg-secondary)",
                  color: isSelected ? "#ffffff" : "var(--text-secondary)",
                  border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default StylingControls;
