import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import {
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  UserCheck,
  FileCheck2,
  Award,
  Compass,
} from "lucide-react";

export const CareerActionPlan = ({ actions = [] }) => {
  if (!Array.isArray(actions) || actions.length === 0) {
    return (
      <Card style={{ padding: "1.75rem", textAlign: "center" }}>
        <CheckCircle2 size={36} color="#10b981" style={{ margin: "0 auto 0.75rem auto" }} />
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
          All Action Items Completed!
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxWidth: "500px", margin: "0 auto" }}>
          Your profile, primary resume, and declared skill coverage satisfy all evaluable quality criteria.
        </p>
      </Card>
    );
  }

  const getSourceIcon = (source) => {
    switch (source) {
      case "PROFILE":
        return <UserCheck size={14} color="var(--primary)" />;
      case "RESUME_ANALYZER":
        return <FileCheck2 size={14} color="#10b981" />;
      case "SKILL_INTELLIGENCE":
        return <Award size={14} color="#8b5cf6" />;
      case "JOB_MATCHING":
        return <Compass size={14} color="#f59e0b" />;
      default:
        return <Lightbulb size={14} color="var(--primary)" />;
    }
  };

  const formatSourceLabel = (source) => {
    switch (source) {
      case "PROFILE": return "Candidate Profile";
      case "RESUME_ANALYZER": return "Resume Analyzer";
      case "SKILL_INTELLIGENCE": return "Skill Intelligence";
      case "JOB_MATCHING": return "Job Alignment";
      default: return source;
    }
  };

  return (
    <Card style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
            Prioritized Action Plan ({actions.length})
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.2rem 0 0 0" }}>
            Deterministic next steps aggregated across profile completion, resume analysis, and skill gaps.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {actions.map((act) => {
          const isHigh = act.priority === "HIGH";
          const isMedium = act.priority === "MEDIUM";

          return (
            <div
              key={act.id}
              style={{
                padding: "1.1rem",
                background: "var(--surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                borderLeft: `4px solid ${isHigh ? "#ef4444" : isMedium ? "#f59e0b" : "var(--primary)"}`,
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {getSourceIcon(act.source)}
                    <span>{formatSourceLabel(act.source)}</span>
                  </div>
                </div>

                <span
                  className={`badge ${isHigh ? "badge-red" : isMedium ? "badge-amber" : "badge-blue"}`}
                  style={{ fontSize: "0.7rem", fontWeight: 700 }}
                >
                  {act.priority} Priority
                </span>
              </div>

              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                {act.action}
              </h4>

              <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
                {act.reason}
              </p>

              {act.guidance && (
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-secondary)",
                    background: "var(--surface-subtle)",
                    padding: "0.4rem 0.65rem",
                    borderRadius: "var(--radius-sm)",
                    marginTop: "0.2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <span>{act.guidance}</span>
                  {act.link && (
                    <Link
                      to={act.link}
                      style={{
                        color: "var(--primary)",
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.2rem",
                      }}
                    >
                      <span>Take Action</span>
                      <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
