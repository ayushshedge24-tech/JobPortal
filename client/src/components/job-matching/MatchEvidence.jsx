import React, { useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck, FileText, CheckCircle2, AlertTriangle } from "lucide-react";

export const MatchEvidence = ({ skill }) => {
  const [expanded, setExpanded] = useState(false);

  if (!skill) return null;

  const isMatched = skill.matchType === "MATCHED";
  const isMissing = skill.matchType === "MISSING";

  return (
    <div
      style={{
        padding: "0.85rem 1rem",
        background: "var(--surface)",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${isMatched ? "rgba(16, 185, 129, 0.3)" : isMissing ? "rgba(245, 158, 11, 0.3)" : "var(--border)"}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isMatched ? (
            <CheckCircle2 size={16} color="#10b981" />
          ) : isMissing ? (
            <AlertTriangle size={16} color="#f59e0b" />
          ) : (
            <FileText size={16} color="var(--text-muted)" />
          )}

          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}>
            {skill.canonicalName}
          </span>

          <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>
            {skill.category}
          </span>

          {skill.candidateLevel && skill.candidateLevel !== "NOT_SPECIFIED" && (
            <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>
              {skill.candidateLevel}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          <span>{expanded ? "Hide Evidence" : "View Evidence"}</span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Expandable Traceable Evidence */}
      {expanded && (
        <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
            {skill.reason}
          </p>

          {/* Candidate Evidence */}
          {Array.isArray(skill.candidateEvidence) && skill.candidateEvidence.length > 0 && (
            <div style={{ fontSize: "0.75rem" }}>
              <strong style={{ color: "var(--text-main)" }}>Candidate Source Evidence:</strong>
              {skill.candidateEvidence.map((ev, i) => (
                <div
                  key={i}
                  style={{
                    margin: "0.25rem 0",
                    padding: "0.35rem 0.6rem",
                    background: "var(--surface-subtle)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--text-muted)",
                    borderLeft: "2px solid var(--primary)",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--primary)" }}>[{ev.source}]</span> {ev.context}
                </div>
              ))}
            </div>
          )}

          {/* Job Evidence */}
          {Array.isArray(skill.jobEvidence) && skill.jobEvidence.length > 0 && (
            <div style={{ fontSize: "0.75rem" }}>
              <strong style={{ color: "var(--text-main)" }}>Job Requirement Evidence:</strong>
              {skill.jobEvidence.map((ev, i) => (
                <div
                  key={i}
                  style={{
                    margin: "0.25rem 0",
                    padding: "0.35rem 0.6rem",
                    background: "var(--surface-subtle)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--text-muted)",
                    borderLeft: "2px solid var(--secondary)",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--secondary)" }}>[{ev.source}]</span> {ev.context}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
