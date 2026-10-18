import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, FileText, ExternalLink, History, CheckCircle2 } from "lucide-react";

export const AdminApplicationDetailsPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAdminApplicationById(id, token);
        if (res?.application) setApp(res.application);
      } catch (err) {
        setError(err.message || "Failed to load application");
      } finally {
        setLoading(false);
      }
    }
    if (id && token) load();
  }, [id, token]);

  if (loading) return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading application details...</div>;
  if (error || !app) return <div className="container" style={{ padding: "4rem", textAlign: "center" }}><div className="badge badge-red">{error || "Application not found"}</div></div>;

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      <Link
        to="/admin/applications"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          fontSize: "0.85rem",
          color: "var(--primary)",
          fontWeight: 600,
          marginBottom: "1rem",
        }}
      >
        <ArrowLeft size={14} />
        <span>Back to Applications Oversight</span>
      </Link>

      <div style={{ marginBottom: "1.5rem" }}>
        <span className="badge badge-purple" style={{ marginBottom: "0.3rem" }}>
          Platform Application Audit
        </span>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>{app.applicantName || app.applicant?.name}</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Application for <strong style={{ color: "var(--text-main)" }}>{app.job?.title}</strong> at {app.job?.company}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem" }}>Candidate Info</h3>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <div>Email: <strong>{app.applicantEmail || app.applicant?.email}</strong></div>
              <div>Phone: <strong>{app.phone || "N/A"}</strong></div>
              <div>Location: <strong>{app.currentLocation || "India"}</strong></div>
              <div>Experience: <strong>{app.experienceYears || "N/A"} years</strong></div>
            </div>
          </div>

          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.5rem" }}>Submitted Resume Snapshot</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              Version {app.resumeVersion || 1} • {app.resumeTitle || "Standard Resume"}
            </p>
            {app.resume ? (
              <a
                href={app.resume}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              >
                <FileText size={14} />
                <span>Open Frozen PDF Snapshot</span>
                <ExternalLink size={12} />
              </a>
            ) : (
              <div style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>No file attached</div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Status History Audit Trail</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {(app.statusHistory || []).map((h, i) => (
              <div key={i} style={{ display: "flex", gap: "0.6rem", fontSize: "0.85rem" }}>
                <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontWeight: 700 }}>{h.status}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{h.note}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-light)" }}>
                    {h.changedAt ? new Date(h.changedAt).toLocaleString("en-IN") : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
