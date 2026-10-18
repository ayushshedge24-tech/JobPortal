import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import {
  Briefcase,
  PlusCircle,
  Search,
  Users,
  Edit2,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  MapPin,
  ExternalLink,
} from "lucide-react";

export const RecruiterJobsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [filters, setFilters] = useState({ q: "", status: "ALL" });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadJobs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getRecruiterJobs({ ...filters, page }, token);
      if (res?.data) {
        setJobs(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load recruiter jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadJobs(1);
  }, [token, filters.status]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs(1);
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setActionLoading(jobId);
    try {
      await api.updateRecruiterJobStatus(jobId, nextStatus, token);
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: nextStatus } : j))
      );
    } catch (err) {
      console.error("Status toggle error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job listing?")) return;
    setActionLoading(jobId);
    try {
      await api.deleteRecruiterJob(jobId, token);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      console.error("Delete job error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Manage Job Openings</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Review, publish, and track candidate applications across your postings.
          </p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <PlusCircle size={18} />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", flex: 1, minWidth: "240px", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Search by title, company, skills..."
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            className="input-field"
            style={{ width: "100%", fontSize: "0.85rem" }}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            <Search size={15} />
          </button>
        </form>

        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="input-field"
          style={{ minWidth: "150px", fontSize: "0.85rem" }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PUBLISHED">Published (Active)</option>
          <option value="DRAFT">Draft</option>
          <option value="CLOSED">Closed / Archived</option>
        </select>
      </div>

      {/* Jobs Table */}
      <div className="card" style={{ padding: "1.5rem", overflowX: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            Loading job postings...
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <Briefcase size={36} color="var(--text-light)" style={{ margin: "0 auto 1rem auto" }} />
            <h3>No jobs found</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              Get started by creating your first job opening.
            </p>
            <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm">
              Post a Position
            </Link>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Job Title & Location</th>
                <th>Work Mode & Type</th>
                <th>Applicants</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                      {job.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <MapPin size={12} />
                      <span>{job.location}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-blue" style={{ fontSize: "0.75rem" }}>
                      {job.workMode} • {job.jobType}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/recruiter/jobs/${job._id}/applications`}
                      style={{
                        fontWeight: 700,
                        color: "var(--primary)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <Users size={14} />
                      <span>{job.applicantCount || 0} Candidates</span>
                    </Link>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(job._id, job.status)}
                      disabled={actionLoading === job._id}
                      className={`badge ${job.status === "PUBLISHED" ? "badge-green" : "badge-gray"}`}
                      style={{ border: "none", cursor: "pointer", fontSize: "0.75rem" }}
                      title="Click to toggle DRAFT / PUBLISHED"
                    >
                      {job.status || "PUBLISHED"}
                    </button>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString("en-IN") : "Recent"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <Link
                        to={`/recruiter/jobs/${job._id}/applications`}
                        className="btn btn-secondary btn-sm"
                        title="View ATS Pipeline"
                        style={{ padding: "0.35rem 0.55rem" }}
                      >
                        <Users size={14} />
                      </Link>
                      <Link
                        to={`/recruiter/jobs/${job._id}/edit`}
                        className="btn btn-secondary btn-sm"
                        title="Edit Job"
                        style={{ padding: "0.35rem 0.55rem" }}
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(job._id)}
                        className="btn btn-secondary btn-sm"
                        title="Delete Job"
                        style={{ padding: "0.35rem 0.55rem", color: "var(--danger)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
