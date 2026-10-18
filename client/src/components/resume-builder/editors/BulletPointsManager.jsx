import React, { useState } from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Plus, Trash2, GripVertical, Check } from "lucide-react";

export const BulletPointsManager = ({
  bulletPoints = [],
  onChange,
  maxBullets = 10,
  maxCharLength = 500,
  label = "Key Highlights & Bullet Points",
}) => {
  const [newBulletText, setNewBulletText] = useState("");

  const handleAddBullet = () => {
    const text = newBulletText.trim();
    if (!text) return;
    if (bulletPoints.length >= maxBullets) return;

    onChange([...bulletPoints, text]);
    setNewBulletText("");
  };

  const handleUpdateBullet = (index, value) => {
    const updated = [...bulletPoints];
    updated[index] = value;
    onChange(updated);
  };

  const handleDeleteBullet = (index) => {
    const updated = bulletPoints.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddBullet();
    }
  };

  return (
    <div className="bullet-points-manager" style={{ marginTop: "var(--space-3)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
        <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>
          {label} ({bulletPoints.length}/{maxBullets})
        </label>
      </div>

      {/* Existing Bullets List */}
      {bulletPoints.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
          {bulletPoints.map((bp, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-2) var(--space-3)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary)",
                  flexShrink: 0,
                }}
              />
              <input
                type="text"
                value={bp}
                onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                maxLength={maxCharLength}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "var(--text-xs)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={() => handleDeleteBullet(idx)}
                className="btn btn-ghost btn-icon btn-sm"
                style={{ color: "var(--text-muted)", padding: "2px" }}
                title="Remove bullet point"
                aria-label="Remove bullet point"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Bullet Input */}
      {bulletPoints.length < maxBullets && (
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          <Input
            placeholder="Add an achievement, metric, or responsibility (press Enter)..."
            value={newBulletText}
            onChange={(e) => setNewBulletText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={maxCharLength}
            style={{ fontSize: "var(--text-xs)" }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddBullet}
            disabled={!newBulletText.trim()}
            style={{ flexShrink: 0 }}
          >
            <Plus size={14} />
            <span>Add</span>
          </Button>
        </div>
      )}
    </div>
  );
};
export default BulletPointsManager;
