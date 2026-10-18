import React from "react";
import { FolderOpen } from "lucide-react";

export const EmptyState = ({
  icon = <FolderOpen size={44} />,
  title = "No data found",
  description = "There are no items matching your criteria at this moment.",
  action = null,
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`empty-state ${className}`}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px dashed var(--border-strong)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-12) var(--space-6)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "540px",
        margin: "0 auto",
        ...style,
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          backgroundColor: "var(--bg-subtle)",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-4)",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "var(--space-2)",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--text-secondary)",
          maxWidth: "380px",
          marginBottom: action ? "var(--space-6)" : "0",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
};
