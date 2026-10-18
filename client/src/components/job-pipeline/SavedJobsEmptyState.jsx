import React from "react";
import { Link } from "react-router-dom";
import { Bookmark, Search, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";

export const SavedJobsEmptyState = ({ hasSearch = false, onReset }) => {
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
        <Bookmark size={28} />
      </div>

      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.4rem", color: "var(--text-main)" }}>
        {hasSearch ? "No Bookmarked Jobs Match Your Search" : "No Saved Jobs in Your Workstation"}
      </h3>

      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxWidth: "460px", margin: "0 auto 1.5rem auto", lineHeight: 1.5 }}>
        {hasSearch
          ? "Try clearing your search query to see all your bookmarked roles."
          : "Save roles while browsing active job listings to organize your applications and check deep profile alignment."}
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        {hasSearch ? (
          <Button variant="secondary" size="md" onClick={onReset}>
            Clear Search Filter
          </Button>
        ) : (
          <>
            <Link to="/candidate/jobs/recommended">
              <Button variant="primary" size="md" startIcon={<Sparkles size={16} />}>
                Explore Recommended Jobs
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="secondary" size="md" startIcon={<Search size={16} />}>
                Browse All Jobs
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
