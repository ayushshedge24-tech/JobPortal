import React from "react";
import { Link } from "react-router-dom";
import { Building, MapPin, Calendar, FileText, ArrowRight, ExternalLink } from "lucide-react";
import { Card } from "../ui/Card";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";

export const ApplicationCard = ({ application }) => {
  const job = application.job || { title: "Position", company: "Company" };
  const jobId = typeof job === "object" ? job._id : job;

  return (
    <Card style={{ padding: "1.25rem", transition: "all 0.15s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.3rem 0", color: "var(--text-main)" }}>
            <Link to={`/candidate/applications/${application._id}`} style={{ color: "inherit", textDecoration: "none" }}>
              {job.title}
            </Link>
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--text-muted)", fontSize: "0.85rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 600, color: "var(--text-main)" }}>
              <Building size={14} />
              <span>{job.company}</span>
            </div>
            {job.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <MapPin size={14} />
                <span>{job.location}</span>
              </div>
            )}
            {job.workMode && (
              <span className="badge badge-neutral" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}>
                {job.workMode}
              </span>
            )}
          </div>
        </div>

        <ApplicationStatusBadge status={application.status} size="md" />
      </div>

      {/* Meta Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.75rem 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <Calendar size={13} />
          <span>
            Applied: {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
          </span>
        </div>

        {application.resume?.title && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <FileText size={13} color="var(--primary)" />
            <span>Resume: <strong>{application.resume.title}</strong> (v{application.resume.version})</span>
          </div>
        )}
      </div>

      {/* Footer CTAs */}
      <div
        style={{
          marginTop: "0.85rem",
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
          {jobId && (
            <Link to={`/candidate/jobs/${jobId}/match`} className="btn btn-secondary btn-sm" style={{ fontSize: "0.8rem" }}>
              Check Alignment
            </Link>
          )}
          {jobId && (
            <Link to={`/jobs/${jobId}`} className="btn btn-secondary btn-sm" style={{ fontSize: "0.8rem" }}>
              View Job
            </Link>
          )}
        </div>

        <Link
          to={`/candidate/applications/${application._id}`}
          className="btn btn-primary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem" }}
        >
          <span>Track Application</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </Card>
  );
};
