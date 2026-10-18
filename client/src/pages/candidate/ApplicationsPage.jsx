import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { Briefcase, Clock, CheckCircle2, Award, XCircle, RefreshCw, Sparkles, Filter } from "lucide-react";
import { PipelineFilters } from "../../components/job-pipeline/PipelineFilters";
import { ApplicationCard } from "../../components/job-pipeline/ApplicationCard";
import { ApplicationEmptyState } from "../../components/job-pipeline/ApplicationEmptyState";
import { DiscoverySkeleton } from "../../components/job-discovery/DiscoverySkeleton";
import { DiscoveryPagination } from "../../components/job-discovery/DiscoveryPagination";
import { Alert } from "../../components/ui/Alert";
import { Card } from "../../components/ui/Card";

export const ApplicationsPage = () => {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    metrics: { total: 0, applied: 0, underReview: 0, shortlisted: 0, interview: 0, offer: 0, rejected: 0, withdrawn: 0 },
    applications: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  });

  const currentFilters = {
    status: searchParams.get("status") || "ALL",
    keyword: searchParams.get("keyword") || "",
    location: searchParams.get("location") || "",
    workMode: searchParams.get("workMode") || "",
    page: parseInt(searchParams.get("page") || "1", 10),
  };

  const fetchApplications = async (filterObj) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCandidateApplications(filterObj, token);
      setData(res?.data || res);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setError(err.message || "Failed to load job applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(currentFilters);
  }, [searchParams, token]);

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "ALL") {
        params.set(k, String(v));
      }
    });
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    handleFilterChange({ ...currentFilters, page: newPage });
  };

  const metrics = data.metrics || {};
  const applications = data.applications || [];
  const pagination = data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const hasActiveFilters = Boolean(
    (currentFilters.status && currentFilters.status !== "ALL") ||
    currentFilters.keyword ||
    currentFilters.location ||
    currentFilters.workMode
  );

  return (
    <div className="applications-pipeline-page" style={{ paddingBottom: "5rem" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "2.5rem 0 2rem 0",
        }}
      >
        <div className="container" style={{ maxWidth: "1060px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span className="badge badge-blue" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <Briefcase size={12} />
                  <span>Application Pipeline Intelligence v1.0.0</span>
                </span>
                <span className="badge badge-purple" style={{ fontSize: "0.75rem" }}>
                  {metrics.total || 0} Total Submissions
                </span>
              </div>

              <h1 style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                My Applications
              </h1>

              <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", maxWidth: "660px", lineHeight: 1.5, margin: 0 }}>
                Track your active job submissions, review resume snapshots used for each application, and monitor verified recruiter status transitions.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Link to="/candidate/jobs/recommended" className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <Sparkles size={14} color="var(--primary)" />
                <span>Find More Jobs</span>
              </Link>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fetchApplications(currentFilters)}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ maxWidth: "1060px", marginTop: "2rem" }}>
        {error && (
          <Alert variant="danger" style={{ marginBottom: "1.5rem" }}>
            <span>{error}</span>
          </Alert>
        )}

        {/* Pipeline Filters */}
        <PipelineFilters
          filters={currentFilters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          metrics={metrics}
        />

        {/* Applications List */}
        {loading ? (
          <DiscoverySkeleton />
        ) : applications.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              <span>Showing <strong>{applications.length}</strong> of <strong>{pagination.total}</strong> applications</span>
            </div>

            {applications.map((app) => (
              <ApplicationCard key={app._id} application={app} />
            ))}

            <DiscoveryPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <ApplicationEmptyState hasFilters={hasActiveFilters} onReset={handleResetFilters} />
        )}
      </div>
    </div>
  );
};
