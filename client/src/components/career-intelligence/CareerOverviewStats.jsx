import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Progress } from "../ui/Progress";
import {
  UserCheck,
  FileCheck2,
  Award,
  FileText,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export const CareerOverviewStats = ({ profile, resumes, resumeReadiness, skills }) => {
  const completion = profile?.completionPercentage || 0;
  const isComplete = completion === 100;
  const primaryResume = resumes?.primary;

  const getReadinessBadge = () => {
    switch (resumeReadiness?.status) {
      case "EXCELLENT":
        return <span className="badge badge-green">✓ Ready for Applications</span>;
      case "GOOD":
        return <span className="badge badge-blue">✓ Solid Quality</span>;
      case "NEEDS_ATTENTION":
        return <span className="badge badge-amber">⚠ Needs Optimization</span>;
      case "NO_RESUME":
      default:
        return <span className="badge badge-neutral">No Active Resume</span>;
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
      {/* 1. Profile Completion Card */}
      <Card style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(59, 130, 246, 0.1)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserCheck size={18} />
              </div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", margin: 0 }}>
                Profile Completion
              </h4>
            </div>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: isComplete ? "var(--success)" : "var(--primary)" }}>
              {completion}%
            </span>
          </div>

          <div style={{ margin: "0.5rem 0" }}>
            <Progress value={completion} max={100} variant={isComplete ? "success" : "primary"} />
          </div>

          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.4rem 0 0 0" }}>
            {isComplete ? "Your candidate profile is 100% complete." : "Complete all profile fields to maximize match precision."}
          </p>
        </div>

        <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
          <Link
            to="/profile"
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--primary)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <span>{isComplete ? "View Profile" : "Complete Profile"}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </Card>

      {/* 2. Resume Quality Card */}
      <Card style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileCheck2 size={18} />
              </div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", margin: 0 }}>
                Resume Readiness
              </h4>
            </div>
            <div>{getReadinessBadge()}</div>
          </div>

          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", marginTop: "0.5rem" }}>
            {primaryResume ? primaryResume.title : "No Primary Resume"}
          </div>

          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>
            {resumeReadiness?.summary
              ? `${resumeReadiness.summary.completedSectionsCount} of ${resumeReadiness.summary.totalSectionsCount} sections verified`
              : "Create a resume to enable ATS readiness analysis."}
          </p>
        </div>

        <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
          {primaryResume ? (
            <Link
              to={`/candidate/resumes/${primaryResume.id}/analyzer`}
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--primary)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span>View Analyzer Report</span>
              <ChevronRight size={14} />
            </Link>
          ) : (
            <Link
              to="/candidate/resumes"
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--primary)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span>Manage Resumes</span>
              <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </Card>

      {/* 3. Skill Profile Card */}
      <Card style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(139, 92, 246, 0.1)",
                  color: "#8b5cf6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Award size={18} />
              </div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", margin: 0 }}>
                Verified Skills
              </h4>
            </div>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-main)" }}>
              {skills?.total || 0}
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
            <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>
              {skills?.categoriesRepresented || 0} Categories
            </span>
            <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>
              {skills?.explicitCount || 0} Explicit
            </span>
          </div>

          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.4rem 0 0 0" }}>
            Normalized against canonical industry standard skill mappings.
          </p>
        </div>

        <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
          <Link
            to="/candidate/skills"
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--primary)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <span>Skill Intelligence</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </Card>

      {/* 4. Active Resumes Card */}
      <Card style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(245, 158, 11, 0.1)",
                  color: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={18} />
              </div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", margin: 0 }}>
                Resume Portfolio
              </h4>
            </div>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-main)" }}>
              {resumes?.total || 0}
            </span>
          </div>

          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginTop: "0.5rem" }}>
            Template: {primaryResume?.template ? primaryResume.template.replace(/_/g, " ") : "N/A"}
          </div>

          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>
            Up to 5 specialized resumes can be maintained in your workspace.
          </p>
        </div>

        <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
          <Link
            to="/candidate/resumes"
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--primary)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <span>Manage Resumes</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </Card>
    </div>
  );
};
