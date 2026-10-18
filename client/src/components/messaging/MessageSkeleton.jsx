import React from "react";

export const MessageSkeleton = () => {
  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--surface-subtle)" }} />
        <div style={{ width: "60%", height: "48px", borderRadius: "12px", background: "var(--surface-subtle)" }} />
      </div>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", justifyContent: "flex-end" }}>
        <div style={{ width: "50%", height: "40px", borderRadius: "12px", background: "var(--surface-subtle)" }} />
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--surface-subtle)" }} />
      </div>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--surface-subtle)" }} />
        <div style={{ width: "70%", height: "56px", borderRadius: "12px", background: "var(--surface-subtle)" }} />
      </div>
    </div>
  );
};
