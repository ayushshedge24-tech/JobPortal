import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export const StatCard = ({
  value,
  label,
  icon,
  delta = null,
  deltaType = "positive", // positive | negative | neutral
  variant = "primary", // primary | success | warning | info
  className = "",
}) => {
  const getColors = () => {
    switch (variant) {
      case "success":
        return { bg: "var(--success-subtle)", color: "var(--success)" };
      case "warning":
        return { bg: "var(--warning-subtle)", color: "var(--warning)" };
      case "info":
        return { bg: "var(--info-subtle)", color: "var(--info)" };
      case "primary":
      default:
        return { bg: "var(--primary-subtle)", color: "var(--primary)" };
    }
  };

  const colors = getColors();

  return (
    <div className={`stat-card ${className}`}>
      {icon && (
        <div
          className="stat-icon-wrapper"
          style={{ backgroundColor: colors.bg, color: colors.color }}
        >
          {icon}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {delta && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              marginTop: "4px",
              color:
                deltaType === "positive"
                  ? "var(--success)"
                  : deltaType === "negative"
                  ? "var(--danger)"
                  : "var(--text-muted)",
            }}
          >
            {deltaType === "positive" ? (
              <TrendingUp size={13} />
            ) : deltaType === "negative" ? (
              <TrendingDown size={13} />
            ) : null}
            <span>{delta}</span>
          </div>
        )}
      </div>
    </div>
  );
};
