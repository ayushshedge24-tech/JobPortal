import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { AdminFilters } from "../../components/admin/AdminFilters";
import { FileText, Eye, MapPin, CheckCircle2 } from "lucide-react";

export const AdminApplicationsPage = () => {
  const { token } = useAuth();
  const [apps, setApps] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [filters, setFilters] = useState({ q: "", status: "ALL" });
  const [loading, setLoading] = useState(true);

  const loadApps = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getAdminApplications({ ...filters, page }, token);
      if (res?.data) {
        setApps(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadApps(1);
  }, [token, filters.status]);

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Platform Application Oversight</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Audit cross-platform candidate applications, statuses, and resume snapshots.
        </p>
      </div>

      <AdminFilters
        searchPlaceholder="Search candidate, email, job title..."
        searchValue={filters.q}
        onSearchChange={(q) => setFilters((f) => ({ ...f, q }))}
        onSearchSubmit={() => loadApps(1)}
        onReset={() => setFilters({ q: "", status: "ALL" })}
      >
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="input-field"
          style={{ fontSize: "0.85rem", minWidth: "150px" }}
        >
          <option value="ALL">All Application Statuses</option>
          <option value="APPLIED">Applied</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFER">Offer</option>
          <option value="REJECTED">Rejected</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>
      </AdminFilters>

      <div className="card" style={{ padding: "1.5rem", overflowX: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading applications...</div>
        ) : apps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <FileText size={36} color="var(--text-light)" style={{ margin: "0 auto 1rem auto" }} />
            <h3>No applications found</h3>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Applied Position</th>
                <th>Status</th>
                <th>Location & Exp</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a._id}>
                  <td>
                    <Link to={`/admin/applications/${a._id}`} style={{ fontWeight: 700, color: "var(--primary)" }}>
                      {a.applicantName || a.applicant?.name || "Candidate"}
                    </Link>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{a.applicantEmail || a.applicant?.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.job?.title || "Role"}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{a.job?.company}</div>
                  </td>
                  <td>
                    <span className={`badge ${a.status === "OFFER" ? "badge-green" : a.status === "SHORTLISTED" ? "badge-purple" : a.status === "INTERVIEW" ? "badge-indigo" : "badge-blue"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>{a.currentLocation || "India"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Exp: {a.experienceYears || "N/A"} yrs</div>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN") : "Recent"}
                  </td>
                  <td>
                    <Link
                      to={`/admin/applications/${a._id}`}
                      className="btn btn-secondary btn-sm"
                      title="Inspect Application"
                      style={{ padding: "0.35rem 0.55rem" }}
                    >
                      <Eye size={13} />
                    </Link>
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
