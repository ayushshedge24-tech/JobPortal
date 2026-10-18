import React from "react";
import { Card } from "../ui/Card";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";

export const MatchRecommendationList = ({ recommendations = [] }) => {
  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    return (
      <Card style={{ padding: "1.5rem", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
          ✓ No declared skill or profile gaps detected for this role. Your profile satisfies all evaluable criteria.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {recommendations.map((rec) => {
        const isHigh = rec.priority === "HIGH";
        const isMedium = rec.priority === "MEDIUM";

        return (
          <Card
            key={rec.id}
            style={{
              padding: "1.25rem",
              borderLeft: `4px solid ${isHigh ? "#ef4444" : isMedium ? "#f59e0b" : "var(--primary)"}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                {rec.action}
              </h4>

              <span
                className={`badge ${isHigh ? "badge-red" : isMedium ? "badge-amber" : "badge-blue"}`}
                style={{ fontSize: "0.7rem", fontWeight: 700 }}
              >
                {rec.priority} Priority
              </span>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 0.5rem 0" }}>
              {rec.reason}
            </p>

            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                background: "var(--surface-subtle)",
                padding: "0.4rem 0.65rem",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Lightbulb size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>{rec.guidance}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
