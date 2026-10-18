import React from "react";
import { Card } from "../ui/Card";
import { MatchEvidence } from "./MatchEvidence";
import { CheckCircle2, AlertTriangle, Layers, Sparkles } from "lucide-react";

export const SkillMatchBreakdown = ({ requiredSkills, preferredSkills }) => {
  const reqMatched = requiredSkills?.matched || [];
  const reqMissing = requiredSkills?.missing || [];
  const reqUnresolved = requiredSkills?.unresolved || [];

  const prefMatched = preferredSkills?.matched || [];
  const prefMissing = preferredSkills?.missing || [];
  const prefUnresolved = preferredSkills?.unresolved || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 1. REQUIRED SKILLS BREAKDOWN */}
      <Card style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Layers size={18} color="var(--primary)" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
              Declared Required Skills ({requiredSkills?.totalCount || 0})
            </h3>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span className="badge badge-green" style={{ fontSize: "0.75rem" }}>
              ✓ {reqMatched.length} Matched
            </span>
            {reqMissing.length > 0 && (
              <span className="badge badge-amber" style={{ fontSize: "0.75rem" }}>
                ✕ {reqMissing.length} Missing
              </span>
            )}
          </div>
        </div>

        {requiredSkills?.totalCount === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
            No explicit required skills were specified for this listing.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {reqMatched.map((skill) => (
              <MatchEvidence key={`req-m-${skill.skillKey}`} skill={skill} />
            ))}
            {reqMissing.map((skill) => (
              <MatchEvidence key={`req-miss-${skill.skillKey}`} skill={skill} />
            ))}
            {reqUnresolved.map((skill) => (
              <MatchEvidence key={`req-unres-${skill.skillKey}`} skill={skill} />
            ))}
          </div>
        )}
      </Card>

      {/* 2. PREFERRED / MENTIONED SKILLS BREAKDOWN */}
      <Card style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={18} color="var(--secondary)" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
              Preferred & Secondary Skills ({preferredSkills?.totalCount || 0})
            </h3>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span className="badge badge-green" style={{ fontSize: "0.75rem" }}>
              ✓ {prefMatched.length} Matched
            </span>
            {prefMissing.length > 0 && (
              <span className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>
                {prefMissing.length} Missing
              </span>
            )}
          </div>
        </div>

        {preferredSkills?.totalCount === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
            No secondary or preferred skills mentioned in job description.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {prefMatched.map((skill) => (
              <MatchEvidence key={`pref-m-${skill.skillKey}`} skill={skill} />
            ))}
            {prefMissing.map((skill) => (
              <MatchEvidence key={`pref-miss-${skill.skillKey}`} skill={skill} />
            ))}
            {prefUnresolved.map((skill) => (
              <MatchEvidence key={`pref-unres-${skill.skillKey}`} skill={skill} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
