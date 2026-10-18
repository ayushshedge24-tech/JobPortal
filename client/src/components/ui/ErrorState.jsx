import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./Button";

export const ErrorState = ({
  code = null,
  title = "Something went wrong",
  description = "An unexpected error occurred while loading this content. Please try again.",
  onRetry = null,
  action = null,
  className = "",
}) => {
  return (
    <div
      className={`error-state ${className}`}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--danger-border)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-12) var(--space-6)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: "68px",
          height: "68px",
          borderRadius: "50%",
          backgroundColor: "var(--danger-subtle)",
          color: "var(--danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-4)",
        }}
      >
        <AlertCircle size={36} />
      </div>

      {code && (
        <span
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "var(--danger)",
            textTransform: "uppercase",
            marginBottom: "var(--space-1)",
          }}
        >
          Error {code}
        </span>
      )}

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
          marginBottom: onRetry || action ? "var(--space-6)" : "0",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {onRetry && (
        <Button variant="primary" startIcon={<RotateCcw size={16} />} onClick={onRetry}>
          Try Again
        </Button>
      )}

      {!onRetry && action && <div>{action}</div>}
    </div>
  );
};
