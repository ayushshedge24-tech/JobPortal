import React from "react";
import { Textarea } from "../../ui/Textarea";
import { Sparkles, Lightbulb } from "lucide-react";

const SUGGESTED_PROMPTS = [
  "Results-driven Full Stack Engineer with 4+ years of experience designing scalable microservices, REST APIs, and responsive web applications.",
  "Passionate Frontend Developer specializing in React, TypeScript, and modern UI/UX design systems with a focus on web performance and accessibility.",
  "Backend Developer with expertise in Node.js, distributed databases, caching architectures, and secure cloud deployments.",
  "Engineering Leader experienced in agile delivery, mentoring high-performing teams, and driving business growth through robust technology solutions.",
];

export const SummaryEditor = ({ value = "", onChange }) => {
  const currentLength = typeof value === "string" ? value.length : 0;
  const maxLength = 3000;

  const handleApplyPrompt = (promptText) => {
    if (!value || window.confirm("Replace current summary with this prompt suggestion?")) {
      onChange(promptText);
    }
  };

  return (
    <div className="summary-editor" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
          <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>
            Professional Summary
          </label>
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: currentLength > maxLength ? "var(--danger)" : "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            {currentLength} / {maxLength} characters
          </span>
        </div>

        <Textarea
          placeholder="Briefly highlight your years of experience, core technical expertise, key achievements, and what value you bring to prospective employers..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          maxLength={maxLength}
          style={{ resize: "vertical" }}
        />
      </div>

      {/* Suggested prompts / starter templates */}
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-4)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          <Lightbulb size={16} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-primary)" }}>
            Need inspiration? Click any starter template to apply:
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPrompt(prompt)}
              className="btn btn-ghost"
              style={{
                textAlign: "left",
                justifyContent: "flex-start",
                padding: "var(--space-2) var(--space-3)",
                fontSize: "var(--text-xs)",
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                lineHeight: 1.4,
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.color = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <Sparkles size={13} style={{ flexShrink: 0, marginRight: "6px", marginTop: "2px" }} />
              <span>"{prompt}"</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SummaryEditor;
