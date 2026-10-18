import React from "react";

export const Divider = ({
  orientation = "horizontal", // horizontal | vertical
  label = null,
  className = "",
  style = {},
}) => {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={className}
        style={{
          width: "1px",
          height: "100%",
          minHeight: "1rem",
          backgroundColor: "var(--border-subtle)",
          ...style,
        }}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          margin: "var(--space-6) 0",
          color: "var(--text-muted)",
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          ...style,
        }}
      >
        <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
        <span>{label}</span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
      </div>
    );
  }

  return (
    <hr
      role="separator"
      className={className}
      style={{
        border: "none",
        height: "1px",
        backgroundColor: "var(--border-subtle)",
        margin: "var(--space-4) 0",
        ...style,
      }}
    />
  );
};
