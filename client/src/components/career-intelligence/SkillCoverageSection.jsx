import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Award, Layers, ChevronRight, CheckCircle2, FileText, Sparkles } from "lucide-react";

export const SkillCoverageSection = ({ skills }) => {
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  if (!skills || skills.total === 0) {
    return (
      <Card style={{ padding: "1.75rem", textAlign: "center" }}>
        <Award size={36} color="var(--text-muted)" style={{ margin: "0 auto 0.75rem auto" }} />
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
          Skill Coverage Profile
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxWidth: "500px", margin: "0 auto 1.25rem auto" }}>
          No skills detected yet. Add technical skills to your primary resume or profile to see normalized category mapping.
        </p>
        <Link to="/profile">
          <button type="button" className="btn btn-primary btn-md">
            Add Skills to Profile
          </button>
        </Link>
      </Card>
    );
  }

  const categoryEntries = Object.entries(skills.categories || {}).filter(
    ([, items]) => Array.isArray(items) && items.length > 0
  );

  const displayedEntries = selectedCategory === "ALL"
    ? categoryEntries
    : categoryEntries.filter(([cat]) => cat === selectedCategory);

  return (
    <Card style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Award size={18} color="var(--primary)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
              Skill Coverage & Categorization ({skills.total})
            </h3>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
            {skills.categoriesRepresented} categories represented across explicit profile items and verified work experiences.
          </p>
        </div>

        <Link to="/candidate/skills">
          <button type="button" className="btn btn-outline btn-sm">
            <span>Skill Intelligence</span>
            <ChevronRight size={14} />
          </button>
        </Link>
      </div>

      {/* Category Pills Filter */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem" }}>
        <button
          type="button"
          onClick={() => setSelectedCategory("ALL")}
          className={`badge ${selectedCategory === "ALL" ? "badge-blue" : "badge-neutral"}`}
          style={{ cursor: "pointer", border: "none", padding: "0.35rem 0.65rem" }}
        >
          All Categories ({skills.total})
        </button>
        {categoryEntries.map(([cat, items]) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`badge ${selectedCategory === cat ? "badge-blue" : "badge-neutral"}`}
            style={{ cursor: "pointer", border: "none", padding: "0.35rem 0.65rem" }}
          >
            {cat.replace(/_/g, " ")} ({items.length})
          </button>
        ))}
      </div>

      {/* Category Skills Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {displayedEntries.map(([cat, items]) => (
          <div
            key={cat}
            style={{
              padding: "1rem",
              background: "var(--surface-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.6rem" }}>
              {cat.replace(/_/g, " ")}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {items.map((skill, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "0.35rem 0.65rem",
                    background: "var(--surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.8rem",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                    {skill.name}
                  </span>
                  {skill.level && skill.level !== "NOT_SPECIFIED" && (
                    <span className="badge badge-green" style={{ fontSize: "0.65rem", padding: "0.15rem 0.35rem" }}>
                      {skill.level}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
