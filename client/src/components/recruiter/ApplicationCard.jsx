import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  FileText,
  ExternalLink,
  Briefcase,
  User,
  Clock,
} from "lucide-react";
import { ApplicationStatusMenu } from "./ApplicationStatusMenu";

export const ApplicationCard = ({
  application,
  onStatusChange,
  onOpenDrawer,
  isCompact = false,
}) => {
  const applicantName = application.applicantName || application.applicant?.name || "Candidate";
  const applicantEmail = application.applicantEmail || application.applicant?.email || "";
  const location = application.currentLocation || application.applicant?.location || "India";
  const experience = application.experienceYears || "Not specified";
  const jobTitle = application.job?.title || "Role";

  return (
    <div
      className="card"
      style={{
        padding: isCompact ? "1rem" : "1.25rem",
        marginBottom: "0.75rem",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        borderLeft: "3px solid var(--primary)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <div>
          <h4
            onClick={() => onOpenDrawer && onOpenDrawer(application)}
            style={{
              fontSize: isCompact ? "0.95rem" : "1.05rem",
              fontWeight: 700,
              color: "var(--text-main)",
              cursor: "pointer",
              marginBottom: "0.2rem",
            }}
          >
            {applicantName}
          </h4>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {applicantEmail}
          </div>
        </div>
        <ApplicationStatusMenu
          currentStatus={application.status}
          onStatusChange={(status, note) => onStatusChange(application._id, status, note)}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <MapPin size={12} />
          <span>{location}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Briefcase size={12} />
          <span>Exp: {experience} yrs</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Calendar size={12} />
          <span>{application.createdAt ? new Date(application.createdAt).toLocaleDateString("en-IN") : "Recent"}</span>
        </div>
      </div>

      {application.coverLetter && (
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            background: "var(--surface-subtle)",
            padding: "0.45rem 0.65rem",
            borderRadius: "var(--radius-sm)",
            marginBottom: "0.75rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          "{application.coverLetter}"
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid var(--border)", fontSize: "0.8rem" }}>
        <button
          type="button"
          onClick={() => onOpenDrawer && onOpenDrawer(application)}
          className="btn btn-secondary btn-sm"
          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
        >
          Review Application
        </button>

        {application.resume ? (
          <a
            href={application.resume}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              color: "var(--primary)",
              fontWeight: 700,
              fontSize: "0.75rem",
              textDecoration: "none",
            }}
          >
            <FileText size={13} />
            <span>Resume Snapshot</span>
            <ExternalLink size={11} />
          </a>
        ) : (
          <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>No file attached</span>
        )}
      </div>
    </div>
  );
};
