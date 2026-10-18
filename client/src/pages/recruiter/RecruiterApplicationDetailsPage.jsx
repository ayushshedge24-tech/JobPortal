import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  ExternalLink,
  History,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { ApplicationStatusMenu } from "../../components/recruiter/ApplicationStatusMenu";

export const RecruiterApplicationDetailsPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplication = async () => {
    try {
      const res = await api.getRecruiterApplicationById(id, token);
      if (res?.application) {
        setApp(res.application);
      }
    } catch (err) {
      setError(err.message || "Failed to load candidate application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) loadApplication();
  }, [id, token]);

  const handleStatusChange = async (appId, newStatus, note) => {
    try {
      await api.updateRecruiterApplicationStatus(appId, newStatus, note, token);
      setApp((prev) => ({
        ...prev,
        status: newStatus,
        statusHistory: [
          ...(prev.statusHistory || []),
          { status: newStatus, changedAt: new Date(), note },
        ],
      }));
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading application details...</div>;
  }

  if (error || !app) {
    return (
      <div className="container" style={{ padding: "4rem", textAlign: "center" }}>
        <div className="badge badge-red">{error || "Application not found"}</div>
      </div>
    );
  }

  const applicantName = app.applicantName || app.applicant?.name || "Candidate";
  const applicantEmail = app.applicantEmail || app.applicant?.email || "";
  const phone = app.phone || app.applicant?.phone || "Not provided";
  const location = app.currentLocation || app.applicant?.location || "India";

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      <Link
        to="/recruiter/applications"
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
        <span>Back to Candidate Pipeline</span>
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: "0.3rem" }}>
            Candidate Application Review
          </span>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>{applicantName}</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Applied for <strong style={{ color: "var(--text-main)" }}>{app.job?.title || "Role"}</strong> at {app.job?.company || "Company"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await api.getOrCreateConversation({ applicationId: app._id }, token);
                if (res?.data?._id) {
                  navigate(`/recruiter/messages/${res.data._id}`);
                }
              } catch (err) {
                alert(err.message || "Failed to open conversation with candidate");
              }
            }}
            className="btn btn-primary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
          >
            <MessageSquare size={14} />
            <span>Message Candidate</span>
          </button>
          <ApplicationStatusMenu
            currentStatus={app.status}
            onStatusChange={(status, note) => handleStatusChange(app._id, status, note)}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Left Col: Details & Snapshot */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Candidate Contact & Profile</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)" }}>
                <Mail size={14} />
                <span>{applicantEmail}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)" }}>
                <Phone size={14} />
                <span>{phone}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)" }}>
                <MapPin size={14} />
                <span>{location}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)" }}>
                <Briefcase size={14} />
                <span>Exp: {app.experienceYears || "Not specified"} yrs</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Submitted Cover Note</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {app.coverLetter || "No cover letter submitted for this application."}
            </p>
          </div>

          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.5rem" }}>Submitted Resume Snapshot</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Title: {app.resumeTitle || "Technical Resume"} • Version: {app.resumeVersion || 1}
            </p>
            {app.resume ? (
              <a
                href={app.resume}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <FileText size={15} />
                <span>View Full Submitted PDF Resume</span>
                <ExternalLink size={12} />
              </a>
            ) : (
              <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>No PDF file snapshot attached</span>
            )}
          </div>
        </div>

        {/* Right Col: Timeline */}
        <div>
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <History size={16} />
              <span>Status History Audit Trail</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(app.statusHistory && app.statusHistory.length > 0
                ? app.statusHistory
                : [{ status: app.status || "APPLIED", changedAt: app.createdAt, note: "Application submitted" }]
              ).map((h, idx) => (
                <div key={idx} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", fontSize: "0.85rem" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "2px",
                    }}
                  >
                    <CheckCircle2 size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong style={{ color: "var(--text-main)" }}>{h.status}</strong>
                      <span style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>
                        {h.changedAt ? new Date(h.changedAt).toLocaleString("en-IN") : ""}
                      </span>
                    </div>
                    {h.note && (
                      <p style={{ color: "var(--text-muted)", marginTop: "0.2rem", fontSize: "0.8rem" }}>
                        {h.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
