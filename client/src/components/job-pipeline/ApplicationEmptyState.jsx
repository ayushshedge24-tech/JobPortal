import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Search, Sparkles, Filter } from "lucide-react";
import { Button } from "../ui/Button";

export const ApplicationEmptyState = ({ hasFilters = false, onReset }) => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "3.5rem 1.5rem",
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--border)",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--surface-subtle)",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1rem auto",
        }}
      >
        <Briefcase size={28} />
      </div>

      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.4rem", color: "var(--text-main)" }}>
        {hasFilters ? "No Applications Match These Filters" : "No Job Applications Submitted Yet"}
      </h3>

      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxWidth: "480px", margin: "0 auto 1.5rem auto", lineHeight: 1.5 }}>
        {hasFilters
          ? "Try adjusting or clearing your active filters to see all your application records."
          : "When you apply to tech roles across India, your application progress, resume versions, and real recruiter updates will appear right here."}
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        {hasFilters ? (
          <Button variant="secondary" size="md" onClick={onReset} startIcon={<Filter size={16} />}>
            Reset Filters
          </Button>
        ) : (
          <>
            <Link to="/candidate/jobs/recommended">
              <Button variant="primary" size="md" startIcon={<Sparkles size={16} />}>
                Recommended Jobs for You
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="secondary" size="md" startIcon={<Search size={16} />}>
                Search Active Tech Roles
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
