import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const JobAlignmentSummary = ({ jobAlignment }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "STRONG_ALIGNMENT":
        return <span className="badge badge-green">✓ Strong Alignment</span>;
      case "PARTIAL_ALIGNMENT":
        return <span className="badge badge-amber">⚠ Partial Alignment</span>;
      case "LIMITED_ALIGNMENT":
        return <span className="badge badge-red">✕ Limited Alignment</span>;
      case "INSUFFICIENT_DATA":
      default:
        return <span className="badge badge-neutral">Insufficient Data</span>;
    }
  };

  if (!jobAlignment || !jobAlignment.hasEvaluatedJobs || jobAlignment.recent.length === 0) {
    return (
      <Card style={{ padding: "1.75rem", textAlign: "center" }}>
        <Compass size={36} color="var(--text-muted)" style={{ margin: "0 auto 0.75rem auto" }} />
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
          Target Job Alignment
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxWidth: "520px", margin: "0 auto 1.25rem auto", lineHeight: 1.5 }}>
          No job alignment history yet. Browse active tech positions and check deterministic alignment against your profile.
        </p>
        <Link to="/jobs">
          <button type="button" className="btn btn-primary btn-md">
            Explore Open Tech Jobs
          </button>
        </Link>
      </Card>
    );
  }

  return (
    <Card style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Compass size={18} color="var(--primary)" />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
            Recent Job Alignment
          </h3>
        </div>

        <Link to="/jobs" style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
          <span>Browse More Roles</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {jobAlignment.recent.map((job) => (
          <div
            key={job.jobId}
            style={{
              padding: "1.25rem",
              background: "var(--surface-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", margin: "0 0 0.2rem 0" }}>
                  {job.title}
                </h4>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {job.company} • {job.location} • {job.workMode}
                </div>
              </div>

              <div>{getStatusBadge(job.status)}</div>
            </div>

            {/* Matched vs Missing preview */}
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.8rem" }}>
              {Array.isArray(job.matchedRequiredSkills) && job.matchedRequiredSkills.length > 0 && (
                <div>
                  <strong style={{ color: "#10b981" }}>Matched Skills: </strong>
                  <span style={{ color: "var(--text-muted)" }}>{job.matchedRequiredSkills.join(", ")}</span>
                </div>
              )}

              {Array.isArray(job.missingRequiredSkills) && job.missingRequiredSkills.length > 0 && (
                <div>
                  <strong style={{ color: "#ef4444" }}>Missing Skills: </strong>
                  <span style={{ color: "var(--text-muted)" }}>{job.missingRequiredSkills.join(", ")}</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.25rem" }}>
              <Link to={`/candidate/jobs/${job.jobId}/match`}>
                <button type="button" className="btn btn-outline btn-sm">
                  <span>View Full Explanation</span>
                  <ChevronRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
