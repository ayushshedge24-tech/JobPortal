import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { DiscoveryReason } from "./DiscoveryReason";
import { BookmarkButton } from "../job-pipeline/BookmarkButton";
import {
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export const RecommendedJobCard = ({ item }) => {
  if (!item || !item.job) return null;

  const { job, alignment } = item;
  const matchedSkills = alignment?.matchedSkills || [];
  const missingSkills = alignment?.missingSkills || [];

  const getAlignmentBadge = (status) => {
    switch (status) {
      case "HIGH_ALIGNMENT":
        return <span className="badge badge-green" style={{ fontSize: "0.75rem", fontWeight: 700 }}>✓ High Alignment</span>;
      case "GOOD_ALIGNMENT":
        return <span className="badge badge-blue" style={{ fontSize: "0.75rem", fontWeight: 700 }}>✓ Good Alignment</span>;
      case "PARTIAL_ALIGNMENT":
        return <span className="badge badge-amber" style={{ fontSize: "0.75rem", fontWeight: 700 }}>⚠ Partial Alignment</span>;
      case "DISCOVERY_ONLY":
      default:
        return <span className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>● Discovery Listing</span>;
    }
  };

  const formattedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })
    : "Recently";

  return (
    <Card style={{ padding: "1.4rem", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "0.85rem" }}>
      <div>
        {/* Top Meta Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.4rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)",
                color: "#ffffff",
                fontSize: "1.15rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {job.company ? job.company.charAt(0).toUpperCase() : "J"}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
                  {job.company}
                </span>
                <span className="badge badge-subtle-success" style={{ fontSize: "0.65rem", padding: "0.1rem 0.3rem" }}>
                  Verified
                </span>
              </div>

              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)", margin: "0.15rem 0 0 0" }}>
                <Link to={`/jobs/${job._id}`} style={{ color: "inherit", textDecoration: "none" }}>
                  {job.title}
                </Link>
              </h3>
            </div>
          </div>

          <div>{getAlignmentBadge(alignment?.status)}</div>
        </div>

        {/* Quick Details Ribbon */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.5rem 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <MapPin size={14} color="var(--primary)" />
            <span>{job.location}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Briefcase size={14} />
            <span>{job.workMode || "Hybrid"}</span>
          </div>
          {job.experience && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <span>Exp: {job.experience}</span>
            </div>
          )}
          {job.salary && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--success)", fontWeight: 700 }}>
              <IndianRupee size={13} />
              <span>{job.salary.replace(/₹/g, "")}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginLeft: "auto" }}>
            <Clock size={13} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Matched vs Missing Skills */}
        {matchedSkills.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center", marginTop: "0.4rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", marginRight: "0.2rem" }}>
              Matched:
            </span>
            {matchedSkills.map((sk) => (
              <span key={sk.key} className="badge badge-green" style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem" }}>
                ✓ {sk.canonicalName}
              </span>
            ))}
            {missingSkills.slice(0, 3).map((sk) => (
              <span key={sk.key} className="badge badge-neutral" style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem" }}>
                {sk.canonicalName}
              </span>
            ))}
          </div>
        )}

        {/* Factual Discovery Reasons */}
        <DiscoveryReason reasons={alignment?.reasons} />
      </div>

      {/* Action CTA buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", paddingTop: "0.6rem", borderTop: "1px solid var(--border)", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <BookmarkButton jobId={job._id} size="sm" />
          <Link to={`/candidate/jobs/${job._id}/match`}>
            <button type="button" className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <Sparkles size={14} color="var(--primary)" />
              <span>Check Alignment</span>
            </button>
          </Link>
        </div>

        <Link to={`/jobs/${job._id}`}>
          <button type="button" className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <span>View Job Details</span>
            <ChevronRight size={14} />
          </button>
        </Link>
      </div>
    </Card>
  );
};
