import React, { useState } from "react";
import { Card } from "../ui/Card";
import { MatchFactorCard } from "./MatchFactorCard";
import { SkillMatchBreakdown } from "./SkillMatchBreakdown";
import { MatchRecommendationList } from "./MatchRecommendationList";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  Layers,
  Sliders,
  Award,
} from "lucide-react";

export const JobMatchExplanation = ({ matchData }) => {
  const [activeTab, setActiveTab] = useState("FACTORS");

  if (!matchData) return null;

  const { summary, job, candidate, factors, requiredSkills, preferredSkills, recommendations } = matchData;

  const getStatusBadge = (status) => {
    switch (status) {
      case "STRONG_ALIGNMENT":
        return (
          <span className="badge badge-green" style={{ fontSize: "0.85rem", fontWeight: 700, padding: "0.4rem 0.8rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <CheckCircle2 size={16} />
            <span>Strong Alignment</span>
          </span>
        );
      case "PARTIAL_ALIGNMENT":
        return (
          <span className="badge badge-amber" style={{ fontSize: "0.85rem", fontWeight: 700, padding: "0.4rem 0.8rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <AlertTriangle size={16} />
            <span>Partial Alignment</span>
          </span>
        );
      case "LIMITED_ALIGNMENT":
        return (
          <span className="badge badge-red" style={{ fontSize: "0.85rem", fontWeight: 700, padding: "0.4rem 0.8rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <XCircle size={16} />
            <span>Limited Alignment</span>
          </span>
        );
      case "INSUFFICIENT_DATA":
      default:
        return (
          <span className="badge badge-neutral" style={{ fontSize: "0.85rem", fontWeight: 700, padding: "0.4rem 0.8rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <HelpCircle size={16} />
            <span>Insufficient Data</span>
          </span>
        );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 1. TOP SUMMARY CARD */}
      <Card
        style={{
          padding: "1.75rem",
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle) 100%)",
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Deterministic Alignment Analysis
              </span>
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
              {summary?.headline || "Alignment Summary"}
            </h2>
          </div>

          <div>{getStatusBadge(summary?.status)}</div>
        </div>

        {/* Explainability Key Highlights */}
        {Array.isArray(summary?.keyHighlights) && summary.keyHighlights.length > 0 && (
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem" }}>
              Why this job aligns:
            </div>
            <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {summary.keyHighlights.map((hl, idx) => (
                <li key={idx} style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  {hl}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* 2. SUB-NAVIGATION TABS */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.25rem" }}>
        <button
          type="button"
          onClick={() => setActiveTab("FACTORS")}
          style={{
            padding: "0.65rem 1.1rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "FACTORS" ? "2px solid var(--primary)" : "2px solid transparent",
            color: activeTab === "FACTORS" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: activeTab === "FACTORS" ? 700 : 500,
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <Sliders size={15} />
          <span>Match Factors (6)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SKILLS")}
          style={{
            padding: "0.65rem 1.1rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "SKILLS" ? "2px solid var(--primary)" : "2px solid transparent",
            color: activeTab === "SKILLS" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: activeTab === "SKILLS" ? 700 : 500,
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <Layers size={15} />
          <span>Skills Breakdown ({requiredSkills?.totalCount || 0} Req / {preferredSkills?.totalCount || 0} Pref)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("RECOMMENDATIONS")}
          style={{
            padding: "0.65rem 1.1rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "RECOMMENDATIONS" ? "2px solid var(--primary)" : "2px solid transparent",
            color: activeTab === "RECOMMENDATIONS" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: activeTab === "RECOMMENDATIONS" ? 700 : 500,
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <Sparkles size={15} />
          <span>Recommendations ({recommendations?.length || 0})</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === "FACTORS" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {factors && Object.keys(factors).map((key) => (
            <MatchFactorCard key={key} factor={factors[key]} />
          ))}
        </div>
      )}

      {activeTab === "SKILLS" && (
        <SkillMatchBreakdown requiredSkills={requiredSkills} preferredSkills={preferredSkills} />
      )}

      {activeTab === "RECOMMENDATIONS" && (
        <MatchRecommendationList recommendations={recommendations} />
      )}
    </div>
  );
};
