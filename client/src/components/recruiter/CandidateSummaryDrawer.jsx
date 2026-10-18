import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Globe,
  FileText,
  ExternalLink,
  History,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { ApplicationStatusMenu } from "./ApplicationStatusMenu";

export const CandidateSummaryDrawer = ({
  application,
  onClose,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  if (!application) return null;

  const applicant = application.applicant || {};
  const applicantName = application.applicantName || applicant.name || "Candidate";
  const applicantEmail = application.applicantEmail || applicant.email || "";
  const phone = application.phone || applicant.phone || "Not provided";
  const location = application.currentLocation || applicant.location || "India";
  const experience = application.experienceYears || "Not specified";
  const currentCtc = application.currentCtc || "Confidential";
  const expectedCtc = application.expectedCtc || "Market standard";
  const noticePeriod = application.noticePeriod || "Immediate / 30 days";
  const portfolio = application.portfolio || "";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        maxWidth: "600px",
        background: "var(--surface)",
        boxShadow: "-10px 0 30px rgba(0,0,0,0.25)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          background: "var(--surface)",
          zIndex: 10,
        }}
      >
        <div>
          <span className="badge badge-purple" style={{ marginBottom: "0.25rem", fontSize: "0.7rem" }}>
            Candidate Profile & Application Review
          </span>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>{applicantName}</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await api.getOrCreateConversation({ applicationId: application._id }, token);
                if (res?.data?._id) {
                  onClose();
                  navigate(`/recruiter/messages/${res.data._id}`);
                }
              } catch (err) {
                alert(err.message || "Failed to open conversation");
              }
            }}
            className="btn btn-primary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.35rem 0.65rem" }}
            title="Message Candidate"
          >
            <MessageSquare size={14} />
            <span>Message</span>
          </button>
          <ApplicationStatusMenu
            currentStatus={application.status}
            onStatusChange={(status, note) => onStatusChange(application._id, status, note)}
          />
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: "0.4rem" }}
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div style={{ padding: "1.5rem", flex: 1 }}>
        {/* Contact Info Card */}
        <div className="card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-main)" }}>
            Applicant Details
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
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
              <span>Experience: {experience} yrs</span>
            </div>
          </div>
        </div>

        {/* Compensation & Notice */}
        <div className="card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Compensation & Availability
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", fontSize: "0.85rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current CTC</div>
              <div style={{ fontWeight: 700 }}>{currentCtc}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Expected CTC</div>
              <div style={{ fontWeight: 700 }}>{expectedCtc}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Notice Period</div>
              <div style={{ fontWeight: 700 }}>{noticePeriod}</div>
            </div>
          </div>
          {portfolio && (
            <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
              <a
                href={portfolio.startsWith("http") ? portfolio : `https://${portfolio}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  color: "var(--primary)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <Globe size={14} />
                <span>Portfolio / GitHub Profile</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        {/* Submitted Cover Note */}
        {application.coverLetter && (
          <div className="card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Cover Note
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {application.coverLetter}
            </p>
          </div>
        )}

        {/* Submitted Resume Snapshot */}
        <div className="card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              Submitted Resume Snapshot
            </h4>
            <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>
              Version {application.resumeVersion || 1}
            </span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
            Title: {application.resumeTitle || "Standard Technical Resume"}
          </p>
          {application.resume ? (
            <a
              href={application.resume}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <FileText size={14} />
              <span>Open Submitted Resume PDF</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <div style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>
              No PDF file attached at submission time.
            </div>
          )}
        </div>

        {/* Timeline & Status History */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <History size={16} />
            <span>Application Status Timeline</span>
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {(application.statusHistory && application.statusHistory.length > 0
              ? application.statusHistory
              : [{ status: application.status || "APPLIED", changedAt: application.createdAt, note: "Application received" }]
            ).map((h, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  fontSize: "0.8rem",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "2px",
                  }}
                >
                  <CheckCircle2 size={12} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong style={{ color: "var(--text-main)" }}>{h.status}</strong>
                    <span style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>
                      {h.changedAt ? new Date(h.changedAt).toLocaleString("en-IN") : ""}
                    </span>
                  </div>
                  {h.note && (
                    <p style={{ color: "var(--text-muted)", marginTop: "0.15rem", fontSize: "0.75rem" }}>
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
  );
};
