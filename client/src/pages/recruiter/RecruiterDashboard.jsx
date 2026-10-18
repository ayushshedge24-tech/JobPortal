import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import {
  Briefcase,
  Users,
  PlusCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowRight,
  TrendingUp,
  FileText,
} from "lucide-react";

export const RecruiterDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const res = await api.getRecruiterDashboard(token);
      if (res?.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load recruiter dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Loading your Recruiter ATS Workspace...
        </div>
      </div>
    );
  }

  const jobsData = metrics?.jobs || { total: 0, active: 0, draft: 0, closed: 0 };
  const appsData = metrics?.applications || {
    total: 0,
    requiringAttention: 0,
    applied: 0,
    underReview: 0,
    shortlisted: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  };

  return (
    <div>
      {/* Header Banner */}
      <div
        className="dashboard-header"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", color: "white" }}
      >
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: "0.5rem" }}>
                Enterprise ATS Workspace • Recruiter Console
              </span>
              <h1 style={{ color: "white", fontSize: "2rem", marginBottom: "0.3rem" }}>
                {user?.name ? `Welcome, ${user.name}` : "Recruiter Workspace"}
              </h1>
              <p style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>
                Track live applicant pipelines, evaluate technical candidates, and manage job vacancies.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link to="/recruiter/company" className="btn btn-secondary" style={{ color: "white" }}>
                <Building2 size={16} />
                <span>Company Profile</span>
              </Link>
              <Link
                to="/recruiter/jobs/new"
                className="btn btn-accent"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <PlusCircle size={18} />
                <span>Post a New Job</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "4rem" }}>
        {/* KPI Metrics Grid */}
        <div className="dashboard-stats-grid" style={{ marginBottom: "2rem" }}>
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
              <Briefcase size={24} />
            </div>
            <div>
              <div className="stat-value">{jobsData.total}</div>
              <div className="stat-label">Total Postings ({jobsData.active} Live)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-value">{appsData.total}</div>
              <div className="stat-label">Total Inbound Applicants</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
              <Clock size={24} />
            </div>
            <div>
              <div className="stat-value">{appsData.requiringAttention}</div>
              <div className="stat-label">Awaiting Initial Screening</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: "var(--success-light)", color: "var(--success)" }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="stat-value">{appsData.interview + appsData.offer}</div>
              <div className="stat-label">Interviews & Offers</div>
            </div>
          </div>
        </div>

        {/* ATS Pipeline Stage Breakdown Banner */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>ATS Recruitment Funnel</h3>
            <Link to="/recruiter/applications" className="btn btn-secondary btn-sm">
              <span>View Full ATS Board</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem" }}>
            <div style={{ background: "var(--surface-subtle)", padding: "0.85rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>{appsData.applied}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Applied</div>
            </div>
            <div style={{ background: "var(--surface-subtle)", padding: "0.85rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#d97706" }}>{appsData.underReview}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Under Review</div>
            </div>
            <div style={{ background: "var(--surface-subtle)", padding: "0.85rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#7c3aed" }}>{appsData.shortlisted}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Shortlisted</div>
            </div>
            <div style={{ background: "var(--surface-subtle)", padding: "0.85rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#4f46e5" }}>{appsData.interview}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Interviewing</div>
            </div>
            <div style={{ background: "var(--surface-subtle)", padding: "0.85rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#059669" }}>{appsData.offer}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Offer Extended</div>
            </div>
            <div style={{ background: "var(--surface-subtle)", padding: "0.85rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#e11d48" }}>{appsData.rejected}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Not Selected</div>
            </div>
          </div>
        </div>

        {/* Two-Column Workspace: Recent Applicants & Active Openings */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
          {/* Column 1: Recent Inbound Candidates */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Recent Candidate Applicants</h3>
              <Link to="/recruiter/applications" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>
                View All
              </Link>
            </div>

            {(!metrics?.recentApplications || metrics.recentApplications.length === 0) ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
                <Users size={32} style={{ margin: "0 auto 0.75rem auto", opacity: 0.5 }} />
                <p style={{ fontSize: "0.9rem" }}>No applicants yet. Post active roles to start receiving applications.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {metrics.recentApplications.map((app) => (
                  <div
                    key={app._id}
                    onClick={() => navigate(`/recruiter/applications/${app._id}`)}
                    style={{
                      padding: "0.85rem",
                      background: "var(--surface-subtle)",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}>
                        {app.candidateName}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {app.jobTitle} • {app.candidateLocation || "India"}
                      </div>
                    </div>
                    <span className={`badge ${app.status === "OFFER" ? "badge-green" : app.status === "SHORTLISTED" ? "badge-purple" : "badge-blue"}`} style={{ fontSize: "0.7rem" }}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Managed Job Openings */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>My Job Listings</h3>
              <Link to="/recruiter/jobs" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>
                Manage Jobs
              </Link>
            </div>

            {(!metrics?.recentJobs || metrics.recentJobs.length === 0) ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
                <Briefcase size={32} style={{ margin: "0 auto 0.75rem auto", opacity: 0.5 }} />
                <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>No job postings created yet.</p>
                <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm">
                  Create First Job Listing
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {metrics.recentJobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => navigate(`/recruiter/jobs/${job._id}/applications`)}
                    style={{
                      padding: "0.85rem",
                      background: "var(--surface-subtle)",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}>
                        {job.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {job.location} • {job.applicantCount} Applicants
                      </div>
                    </div>
                    <span className={`badge ${job.status === "PUBLISHED" ? "badge-green" : "badge-gray"}`} style={{ fontSize: "0.7rem" }}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
