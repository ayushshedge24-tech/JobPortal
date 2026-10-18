import React from "react";

export const Switch = ({
  checked = false,
  onChange,
  label = null,
  disabled = false,
  id = null,
  className = "",
}) => {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <label
      htmlFor={switchId}
      className={`switch-wrapper ${className}`}
      style={{ opacity: disabled ? 0.55 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <input
        type="checkbox"
        id={switchId}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
      <div className={`switch-track ${checked ? "active" : ""}`}>
        <div className="switch-thumb" />
      </div>
      {label && (
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-primary)" }}>
          {label}
        </span>
      )}
    </label>
  );
};
