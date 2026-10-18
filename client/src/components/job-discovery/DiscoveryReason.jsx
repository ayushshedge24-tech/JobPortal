import React from "react";
import { Check, Sparkles } from "lucide-react";

export const DiscoveryReason = ({ reasons = [] }) => {
  if (!Array.isArray(reasons) || reasons.length === 0) return null;

  return (
    <div style={{ marginTop: "0.6rem", paddingTop: "0.6rem", borderTop: "1px solid var(--border)" }}>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
        Why this matches your profile:
      </div>
      <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {reasons.map((r, i) => (
          <li key={i} style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
};
