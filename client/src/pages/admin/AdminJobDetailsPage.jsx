import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Users, Building2, ShieldCheck } from "lucide-react";
import { JobModerationModal } from "../../components/admin/JobModerationModal";

export const AdminJobDetailsPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modModal, setModModal] = useState(false);
  const [modLoading, setModLoading] = useState(false);

  const loadJob = async () => {
    try {
      const res = await api.getAdminJobById(id, token);
      if (res?.job) setJob(res.job);
    } catch (err) {
      setError(err.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) loadJob();
  }, [id, token]);

  const handleModerationConfirm = async (jobId, newStatus, note) => {
    setModLoading(true);
    try {
      await api.moderateAdminJobStatus(jobId, newStatus, note, token);
      setJob((prev) => ({ ...prev, status: newStatus }));
      setModModal(false);
    } catch (err) {
      alert(err.message || "Failed to moderate status");
    } finally {
      setModLoading(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading job details...</div>;
  if (error || !job) return <div className="container" style={{ padding: "4rem", textAlign: "center" }}><div className="badge badge-red">{error || "Job not found"}</div></div>;

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      <Link
        to="/admin/jobs"
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
        <span>Back to Job Moderation</span>
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <span className={`badge ${job.status === "PUBLISHED" ? "badge-green" : "badge-gray"}`} style={{ marginBottom: "0.4rem" }}>
            Status: {job.status || "PUBLISHED"}
          </span>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>{job.title}</h1>
          <p style={{ fontSize: "0.95rem", color: "var(--primary)", fontWeight: 700 }}>{job.company}</p>
        </div>
        <button
          type="button"
          onClick={() => setModModal(true)}
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
        >
          <ShieldCheck size={15} />
          <span>Moderate Status</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Position Overview</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Location & Mode</div>
              <div>{job.location} ({job.workMode})</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Compensation</div>
              <div>{job.salary || "Competitive LPA"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Type & Exp</div>
              <div>{job.jobType} • {job.experience}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Category</div>
              <div>{job.category}</div>
            </div>
          </div>

          <div style={{ fontSize: "0.8rem", marginBottom: "1rem" }}>
            <strong>Required Skills:</strong> {(job.skills || []).join(", ") || "General"}
          </div>

          <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.4rem" }}>Description</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{job.description}</p>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Recruiter & Applications Context</h3>
          <div style={{ background: "var(--surface-subtle)", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{job.postedBy?.name || "Hiring Manager"}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{job.postedBy?.email}</div>
          </div>
          <div style={{ background: "var(--surface-subtle)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>{job.applicantCount || 0}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Candidate Applications</div>
          </div>
        </div>
      </div>

      {modModal && (
        <JobModerationModal
          job={job}
          onClose={() => setModModal(false)}
          onConfirm={handleModerationConfirm}
          loading={modLoading}
        />
      )}
    </div>
  );
};
