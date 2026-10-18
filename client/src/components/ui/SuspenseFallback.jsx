import React from "react";

export const SuspenseFallback = () => {
  return (
    <div
      style={{
        minHeight: "350px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        color: "var(--text-muted)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "3px solid var(--surface-subtle)",
          borderTopColor: "var(--primary)",
          animation: "spin 0.8s linear infinite",
          marginBottom: "1rem",
        }}
      />
      <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Loading module...</span>
      <style>{
        `@keyframes spin {
          to { transform: rotate(360deg); }
        }`
      }</style>
    </div>
  );
};
