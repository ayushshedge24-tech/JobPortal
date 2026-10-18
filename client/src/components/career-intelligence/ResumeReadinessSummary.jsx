import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Sliders,
  ShieldCheck,
} from "lucide-react";

export const ResumeReadinessSummary = ({ resumeReadiness, primaryResume }) => {
  if (!resumeReadiness || !resumeReadiness.analyzerAvailable) {
    return (
      <Card style={{ padding: "1.75rem", textAlign: "center" }}>
        <FileCheck2 size={36} color="var(--text-muted)" style={{ margin: "0 auto 0.75rem auto" }} />
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
          Resume Quality & ATS Readiness
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxWidth: "500px", margin: "0 auto 1.25rem auto" }}>
          Create and complete your primary resume to unlock deterministic section completeness, contact validation, and ATS format auditing.
        </p>
        <Link to="/candidate/resumes">
          <Button variant="primary" size="md">
            Go to Resume Manager
          </Button>
        </Link>
      </Card>
    );
  }

  const { categoryStatuses, strengths = [], warnings = [], summary } = resumeReadiness;

  const formatCategoryName = (key) => {
    switch (key) {
      case "contact": return "Contact Details";
      case "summary": return "Professional Summary";
      case "experience": return "Work Experience";
      case "education": return "Education";
      case "skills": return "Skills";
      case "projects": return "Projects";
      case "certifications": return "Certifications";
      case "atsStructure": return "ATS Heading Structure";
      case "formatting": return "Formatting & Style";
      default: return key;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "GOOD":
        return <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>✓ Complete</span>;
      case "WARNING":
        return <span className="badge badge-amber" style={{ fontSize: "0.7rem" }}>⚠ Needs Review</span>;
      case "ERROR":
        return <span className="badge badge-red" style={{ fontSize: "0.7rem" }}>✕ Action Needed</span>;
      case "MISSING":
      default:
        return <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>Optional / Absent</span>;
    }
  };

  return (
    <Card style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <ShieldCheck size={18} color="var(--primary)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
              Primary Resume Audit ({resumeReadiness.resumeTitle})
            </h3>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
            Template: <strong>{resumeReadiness.template}</strong> • Deterministic ATS structural audit
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link to={`/candidate/resumes/${resumeReadiness.resumeId}/analyzer`}>
            <Button variant="outline" size="sm">
              <Sliders size={14} />
              <span>Full Analyzer</span>
            </Button>
          </Link>
          <Link to={`/candidate/resumes/${resumeReadiness.resumeId}/builder`}>
            <Button variant="primary" size="sm">
              <span>Edit in Builder</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Health Pills Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.6rem", marginBottom: "1.25rem" }}>
        {Object.keys(categoryStatuses).map((catKey) => (
          <div
            key={catKey}
            style={{
              padding: "0.5rem 0.75rem",
              background: "var(--surface-subtle)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-main)" }}>
              {formatCategoryName(catKey)}
            </span>
            {getStatusBadge(categoryStatuses[catKey])}
          </div>
        ))}
      </div>

      {/* Strengths & Warnings 2-column list */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {strengths.length > 0 && (
          <div style={{ padding: "0.85rem 1rem", background: "rgba(16, 185, 129, 0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10b981", margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={15} />
              <span>Verified Strengths</span>
            </h4>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {strengths.slice(0, 3).map((st, i) => (
                <li key={i}>{st}</li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div style={{ padding: "0.85rem 1rem", background: "rgba(245, 158, 11, 0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f59e0b", margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <AlertTriangle size={15} />
              <span>Recommended Improvements</span>
            </h4>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {warnings.slice(0, 3).map((wn, i) => (
                <li key={i}>{wn}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
