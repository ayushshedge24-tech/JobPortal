import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, FileText, Building2, Shield, Calendar } from "lucide-react";

export const AdminUserDetailsPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAdminUserById(id, token);
        if (res?.data) setData(res.data);
      } catch (err) {
        setError(err.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    }
    if (id && token) load();
  }, [id, token]);

  if (loading) return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading user details...</div>;
  if (error || !data) return <div className="container" style={{ padding: "4rem", textAlign: "center" }}><div className="badge badge-red">{error || "User not found"}</div></div>;

  const { user, candidateData, recruiterData } = data;

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      <Link
        to="/admin/users"
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
        <span>Back to User Directory</span>
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem" }}>
            <span className={`badge ${user.role === "ADMIN" ? "badge-purple" : user.role === "RECRUITER" ? "badge-blue" : "badge-gray"}`}>
              {user.role}
            </span>
            <span className={`badge ${user.isActive ? "badge-green" : "badge-red"}`}>
              {user.isActive ? "Account Active" : "Account Deactivated"}
            </span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>{user.name}</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{user.email}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Account Info */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Account Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>User ID</div>
              <code>{user._id}</code>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Phone</div>
              <div>{user.phone || "Not provided"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Location</div>
              <div>{user.location || "India"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Created At</div>
              <div>{user.createdAt ? new Date(user.createdAt).toLocaleString("en-IN") : "N/A"}</div>
            </div>
          </div>
        </div>

        {/* Candidate Context (if candidate) */}
        {candidateData && (
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Candidate Workstation Activity</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
              <div style={{ background: "var(--surface-subtle)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>{candidateData.applicationsCount}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Applications Submitted</div>
              </div>
              <div style={{ background: "var(--surface-subtle)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>{candidateData.resumesCount}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Resumes Created</div>
              </div>
            </div>
          </div>
        )}

        {/* Recruiter Context (if recruiter) */}
        {recruiterData && (
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Recruiter Workstation Activity</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
              <div style={{ background: "var(--surface-subtle)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>{recruiterData.jobsCount}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Jobs Posted</div>
              </div>
              <div style={{ background: "var(--surface-subtle)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>{recruiterData.applicationsReceived}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Inbound Applications</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
