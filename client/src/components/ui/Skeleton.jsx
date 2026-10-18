import React from "react";

export const Skeleton = ({
  width = "100%",
  height = "20px",
  borderRadius = "var(--radius-sm)",
  circle = false,
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? "50%" : borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export const SkeletonText = ({ lines = 3, gap = "8px", className = "" }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }} className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="14px"
          width={i === lines - 1 && lines > 1 ? "65%" : "100%"}
        />
      ))}
    </div>
  );
};

export const SkeletonJobCard = () => {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
        <Skeleton width="46px" height="46px" borderRadius="var(--radius-md)" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <Skeleton width="60%" height="18px" />
          <Skeleton width="35%" height="14px" />
        </div>
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <Skeleton width="90px" height="14px" />
        <Skeleton width="80px" height="14px" />
      </div>
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <Skeleton width="60px" height="22px" borderRadius="var(--radius-xs)" />
        <Skeleton width="70px" height="22px" borderRadius="var(--radius-xs)" />
        <Skeleton width="50px" height="22px" borderRadius="var(--radius-xs)" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "var(--space-3)", borderTop: "1px solid var(--border-subtle)" }}>
        <Skeleton width="80px" height="28px" />
        <Skeleton width="90px" height="28px" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "var(--space-4)",
            padding: "var(--space-3) var(--space-4)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height="16px" width={c === 0 ? "80%" : "60%"} />
          ))}
        </div>
      ))}
    </div>
  );
};
