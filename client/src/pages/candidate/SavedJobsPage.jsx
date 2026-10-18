import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { Bookmark, Search, RefreshCw, Sparkles, Briefcase } from "lucide-react";
import { SavedJobCard } from "../../components/job-pipeline/SavedJobCard";
import { SavedJobsEmptyState } from "../../components/job-pipeline/SavedJobsEmptyState";
import { DiscoverySkeleton } from "../../components/job-discovery/DiscoverySkeleton";
import { DiscoveryPagination } from "../../components/job-discovery/DiscoveryPagination";
import { Alert } from "../../components/ui/Alert";
import { Card } from "../../components/ui/Card";

export const SavedJobsPage = () => {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ savedJobs: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get("keyword") || "");

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentKeyword = searchParams.get("keyword") || "";

  const fetchSavedJobs = async (page = 1, keyword = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSavedJobs({ page, keyword }, token);
      setData(res?.data || res || { savedJobs: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
    } catch (err) {
      console.error("Failed to load saved jobs:", err);
      setError(err.message || "Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs(currentPage, currentKeyword);
  }, [currentPage, currentKeyword, token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) {
      params.set("keyword", searchKeyword.trim());
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleResetSearch = () => {
    setSearchKeyword("");
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const handleUnsave = (jobId) => {
    setData((prev) => ({
      ...prev,
      savedJobs: prev.savedJobs.filter((s) => s.job?._id !== jobId),
      pagination: {
        ...prev.pagination,
        total: Math.max(0, prev.pagination.total - 1),
      },
    }));
  };

  const savedJobs = data.savedJobs || [];
  const pagination = data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="saved-jobs-page" style={{ paddingBottom: "5rem" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "2.5rem 0 2rem 0",
        }}
      >
        <div className="container" style={{ maxWidth: "1000px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span className="badge badge-purple" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <Bookmark size={12} />
                  <span>Candidate Job Bookmarks</span>
                </span>
                <span className="badge badge-blue" style={{ fontSize: "0.75rem" }}>
                  {pagination.total} Saved Roles
                </span>
              </div>

              <h1 style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                Saved Jobs
              </h1>

              <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", maxWidth: "600px", lineHeight: 1.5, margin: 0 }}>
                Manage your shortlisted openings, evaluate deep skill alignment, and track your application plans.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Link to="/candidate/jobs/recommended" className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <Sparkles size={14} color="var(--primary)" />
                <span>Recommended Jobs</span>
              </Link>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fetchSavedJobs(currentPage, currentKeyword)}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ maxWidth: "1000px", marginTop: "2rem" }}>
        {error && (
          <Alert variant="danger" style={{ marginBottom: "1.5rem" }}>
            <span>{error}</span>
          </Alert>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: "1.5rem" }}>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.5rem", maxWidth: "480px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Search saved job title, company, or skills..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ paddingLeft: "2.25rem", height: "38px", fontSize: "0.85rem" }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ height: "38px" }}>
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <DiscoverySkeleton />
        ) : savedJobs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              <span>Showing <strong>{savedJobs.length}</strong> of <strong>{pagination.total}</strong> bookmarked roles</span>
            </div>

            {savedJobs.map((item) => (
              <SavedJobCard key={item._id} item={item} onUnsave={handleUnsave} />
            ))}

            <DiscoveryPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <SavedJobsEmptyState hasSearch={Boolean(currentKeyword)} onReset={handleResetSearch} />
        )}
      </div>
    </div>
  );
};
