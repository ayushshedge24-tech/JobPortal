import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export const Alert = ({
  variant = "info", // info | success | warning | danger
  title,
  children,
  icon,
  onClose,
  className = "",
}) => {
  const getIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case "success":
        return <CheckCircle2 size={18} />;
      case "warning":
        return <AlertTriangle size={18} />;
      case "danger":
        return <AlertCircle size={18} />;
      case "info":
      default:
        return <Info size={18} />;
    }
  };

  const getStyle = () => {
    switch (variant) {
      case "success":
        return {
          bg: "var(--success-subtle)",
          border: "var(--success-border)",
          color: "var(--success)",
        };
      case "warning":
        return {
          bg: "var(--warning-subtle)",
          border: "var(--warning-border)",
          color: "var(--warning)",
        };
      case "danger":
        return {
          bg: "var(--danger-subtle)",
          border: "var(--danger-border)",
          color: "var(--danger)",
        };
      case "info":
      default:
        return {
          bg: "var(--info-subtle)",
          border: "var(--info-border)",
          color: "var(--info)",
        };
    }
  };

  const current = getStyle();

  return (
    <div
      role="alert"
      className={`alert-box ${className}`}
      style={{
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        borderRadius: "var(--radius-md)",
        padding: "var(--space-3) var(--space-4)",
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-3)",
        color: current.color,
      }}
    >
      <div style={{ marginTop: "2px", flexShrink: 0 }}>{getIcon()}</div>
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", marginBottom: "2px" }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-primary)", lineHeight: 1.5 }}>
          {children}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "currentColor",
            cursor: "pointer",
            padding: "2px",
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
