import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { AdminFilters } from "../../components/admin/AdminFilters";
import { JobModerationModal } from "../../components/admin/JobModerationModal";
import { Briefcase, Eye, ShieldCheck, MapPin, Users } from "lucide-react";

export const AdminJobsPage = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [filters, setFilters] = useState({ q: "", status: "ALL", workMode: "ALL" });
  const [loading, setLoading] = useState(true);
  const [modJob, setModJob] = useState(null);
  const [modLoading, setModLoading] = useState(false);

  const loadJobs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getAdminJobs({ ...filters, page }, token);
      if (res?.data) {
        setJobs(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load platform jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadJobs(1);
  }, [token, filters.status, filters.workMode]);

  const handleModerationConfirm = async (jobId, newStatus, note) => {
    setModLoading(true);
    try {
      await api.moderateAdminJobStatus(jobId, newStatus, note, token);
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
      );
      setModJob(null);
    } catch (err) {
      alert(err.message || "Failed to moderate job status");
    } finally {
      setModLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Platform Job Moderation</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Oversee, review, and moderate job postings across all hiring companies.
        </p>
      </div>

      <AdminFilters
        searchPlaceholder="Search job title, company, skills..."
        searchValue={filters.q}
        onSearchChange={(q) => setFilters((f) => ({ ...f, q }))}
        onSearchSubmit={() => loadJobs(1)}
        onReset={() => setFilters({ q: "", status: "ALL", workMode: "ALL" })}
      >
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="input-field"
          style={{ fontSize: "0.85rem", minWidth: "140px" }}
        >
          <option value="ALL">All Publication States</option>
          <option value="PUBLISHED">Published (Live)</option>
          <option value="DRAFT">Draft</option>
          <option value="CLOSED">Closed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select
          value={filters.workMode}
          onChange={(e) => setFilters((f) => ({ ...f, workMode: e.target.value }))}
          className="input-field"
          style={{ fontSize: "0.85rem", minWidth: "140px" }}
        >
          <option value="ALL">All Work Modes</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Remote">Remote</option>
          <option value="On-site">On-site</option>
        </select>
      </AdminFilters>

      <div className="card" style={{ padding: "1.5rem", overflowX: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <Briefcase size={36} color="var(--text-light)" style={{ margin: "0 auto 1rem auto" }} />
            <h3>No jobs found</h3>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Job Title & Company</th>
                <th>Recruiter</th>
                <th>Status</th>
                <th>Location & Mode</th>
                <th>Applicants</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j._id}>
                  <td>
                    <Link to={`/admin/jobs/${j._id}`} style={{ fontWeight: 700, color: "var(--primary)" }}>
                      {j.title}
                    </Link>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{j.company}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>{j.postedBy?.name || "Hiring Manager"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{j.postedBy?.email || ""}</div>
                  </td>
                  <td>
                    <span className={`badge ${j.status === "PUBLISHED" ? "badge-green" : j.status === "DRAFT" ? "badge-gray" : "badge-red"}`}>
                      {j.status || "PUBLISHED"}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>{j.location}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{j.workMode} • {j.jobType}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{j.applicantCount || 0} Candidates</span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {j.createdAt ? new Date(j.createdAt).toLocaleDateString("en-IN") : "Recent"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <Link
                        to={`/admin/jobs/${j._id}`}
                        className="btn btn-secondary btn-sm"
                        title="View Full Details"
                        style={{ padding: "0.35rem 0.55rem" }}
                      >
                        <Eye size={13} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setModJob(j)}
                        className="btn btn-secondary btn-sm"
                        title="Moderate Publication Status"
                        style={{ padding: "0.35rem 0.55rem" }}
                      >
                        <ShieldCheck size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modJob && (
        <JobModerationModal
          job={modJob}
          onClose={() => setModJob(null)}
          onConfirm={handleModerationConfirm}
          loading={modLoading}
        />
      )}
    </div>
  );
};
