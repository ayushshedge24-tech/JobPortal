import React from "react";
import { Link } from "react-router-dom";
import { Building, MapPin, Briefcase, Calendar, Sparkles, Send } from "lucide-react";
import { Card } from "../ui/Card";
import { BookmarkButton } from "./BookmarkButton";

export const SavedJobCard = ({ item, onUnsave }) => {
  const job = item.job;
  if (!job) return null;

  const formattedSalary = job.salary?.startsWith("₹") ? job.salary : job.salary ? `₹${job.salary}` : null;

  return (
    <Card style={{ padding: "1.25rem", transition: "all 0.15s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
            <span className="badge badge-purple" style={{ fontSize: "0.7rem" }}>
              {job.category || "Software"}
            </span>
            {job.workMode && (
              <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>
                {job.workMode}
              </span>
            )}
            {job.experience && (
              <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>
                {job.experience}
              </span>
            )}
          </div>

          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.4rem 0", color: "var(--text-main)" }}>
            <Link to={`/jobs/${job._id}`} style={{ color: "inherit", textDecoration: "none" }}>
              {job.title}
            </Link>
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Building size={14} />
              <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{job.company}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <MapPin size={14} />
              <span>{job.location}</span>
            </div>
            {formattedSalary && (
              <span className="badge-rupee" style={{ fontSize: "0.8rem", padding: "0.15rem 0.5rem" }}>
                {formattedSalary}
              </span>
            )}
          </div>

          {/* Saved Date info */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
            <Calendar size={12} />
            <span>
              Bookmarked on {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
            </span>
          </div>
        </div>

        {/* Top Right Bookmark Action */}
        <BookmarkButton
          jobId={job._id}
          initialSaved={true}
          onToggle={(saved) => {
            if (!saved && onUnsave) onUnsave(job._id);
          }}
          size="md"
        />
      </div>

      {/* Action Footer */}
      <div
        style={{
          marginTop: "1rem",
          paddingTop: "0.85rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link to={`/candidate/jobs/${job._id}/match`} className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem" }}>
            <Sparkles size={13} color="var(--primary)" />
            <span>Check Alignment</span>
          </Link>
          <Link to={`/jobs/${job._id}`} className="btn btn-secondary btn-sm" style={{ fontSize: "0.8rem" }}>
            View Details
          </Link>
        </div>

        <Link to={`/jobs/${job._id}/apply`} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem" }}>
          <Send size={13} />
          <span>Apply Now</span>
        </Link>
      </div>
    </Card>
  );
};
