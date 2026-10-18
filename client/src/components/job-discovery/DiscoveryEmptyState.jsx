import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Compass, Search, RotateCcw, UserCheck } from "lucide-react";

export const DiscoveryEmptyState = ({ hasActiveFilters, onReset }) => {
  return (
    <Card style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-full)",
          background: "var(--surface-subtle)",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1rem auto",
        }}
      >
        <Compass size={28} />
      </div>

      <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem" }}>
        {hasActiveFilters ? "No Jobs Found for These Filters" : "No Matching Jobs Discovered"}
      </h3>

      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "480px", margin: "0 auto 1.5rem auto", lineHeight: 1.5 }}>
        {hasActiveFilters
          ? "Try loosening your location or keyword constraints to surface more active industry opportunities."
          : "Update your candidate profile with technical skills and preferred work locations to receive tailored discovery results."}
      </p>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
        {hasActiveFilters && (
          <button type="button" className="btn btn-secondary btn-md" onClick={onReset}>
            <RotateCcw size={15} />
            <span>Reset Filters</span>
          </button>
        )}

        <Link to="/profile">
          <button type="button" className="btn btn-primary btn-md">
            <UserCheck size={15} />
            <span>Update Profile Skills</span>
          </button>
        </Link>
      </div>
    </Card>
  );
};
