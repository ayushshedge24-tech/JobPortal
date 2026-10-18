import React from "react";

export const Progress = ({
  value = 0,
  max = 100,
  showValue = false,
  label = null,
  variant = "primary", // primary | success | warning | danger
  height = "8px",
  className = "",
}) => {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const getColor = () => {
    switch (variant) {
      case "success":
        return "var(--success)";
      case "warning":
        return "var(--warning)";
      case "danger":
        return "var(--danger)";
      case "primary":
      default:
        return "var(--primary)";
    }
  };

  return (
    <div className={`progress-container ${className}`} style={{ width: "100%" }}>
      {(label || showValue) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
          }}
        >
          {label && <span style={{ color: "var(--text-primary)" }}>{label}</span>}
          {showValue && <span style={{ color: "var(--text-muted)" }}>{percent}%</span>}
        </div>
      )}
      <div
        style={{
          width: "100%",
          height,
          backgroundColor: "var(--bg-muted)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            backgroundColor: getColor(),
            borderRadius: "var(--radius-full)",
            transition: "width var(--transition-slow)",
          }}
        />
      </div>
    </div>
  );
};

export const CircularProgress = ({
  value = 0,
  size = 64,
  strokeWidth = 6,
  variant = "primary",
  label = null,
}) => {
  const percent = Math.min(100, Math.max(0, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const getColor = () => {
    switch (variant) {
      case "success":
        return "var(--success)";
      case "warning":
        return "var(--warning)";
      case "danger":
        return "var(--danger)";
      case "primary":
      default:
        return "var(--primary)";
    }
  };

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <div style={{ position: "relative", width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--bg-muted)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset var(--transition-slow)" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: `${Math.round(size * 0.28)}px`,
            fontWeight: 800,
            fontFamily: "var(--font-heading)",
            color: "var(--text-primary)",
          }}
        >
          {percent}%
        </div>
      </div>
      {label && (
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 600 }}>
          {label}
        </span>
      )}
    </div>
  );
};
