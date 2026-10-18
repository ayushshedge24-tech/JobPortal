import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { RecommendedJobCard } from "../../components/job-discovery/RecommendedJobCard";
import { DiscoveryFilters } from "../../components/job-discovery/DiscoveryFilters";
import { DiscoveryEmptyState } from "../../components/job-discovery/DiscoveryEmptyState";
import { DiscoverySkeleton } from "../../components/job-discovery/DiscoverySkeleton";
import { DiscoveryPagination } from "../../components/job-discovery/DiscoveryPagination";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import {
  Compass,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Filter,
} from "lucide-react";

export const RecommendedJobsPage = () => {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Parse filters from URL search params
  const currentFilters = {
    keyword: searchParams.get("keyword") || "",
    location: searchParams.get("location") || "",
    workMode: searchParams.get("workMode") || "",
    experience: searchParams.get("experience") || "",
    category: searchParams.get("category") || "",
    employmentType: searchParams.get("employmentType") || "",
    sort: searchParams.get("sort") || "RELEVANCE",
    page: parseInt(searchParams.get("page") || "1", 10),
  };

  const fetchJobs = async (filterObj) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRecommendedJobs(filterObj, token);
      setData(res?.data || res);
    } catch (err) {
      console.error("Failed to fetch recommended jobs:", err);
      setError(err.message || "Failed to load job recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(currentFilters);
  }, [searchParams, token]);

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
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

  const results = data?.results || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const hasActiveFilters = Boolean(
    currentFilters.keyword ||
    currentFilters.location ||
    currentFilters.workMode ||
    currentFilters.experience ||
    currentFilters.category
  );

  return (
    <div className="recommended-jobs-page" style={{ paddingBottom: "5rem" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "2.5rem 0 2rem 0",
        }}
      >
        <div className="container" style={{ maxWidth: "1180px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span className="badge badge-purple" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <Sparkles size={12} />
                  <span>Deterministic Job Discovery v1.0.0</span>
                </span>
                <span className="badge badge-blue" style={{ fontSize: "0.75rem" }}>
                  Real Database Openings Only
                </span>
              </div>

              <h1 style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                Recommended Tech Jobs
              </h1>

              <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", maxWidth: "700px", lineHeight: 1.5, margin: 0 }}>
                Discovered actual openings deterministically ranked by your declared skills, canonical mappings, and working preferences.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fetchJobs(currentFilters)}
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
      <div className="container" style={{ maxWidth: "1180px", marginTop: "2rem" }}>
        {error && (
          <Alert variant="danger" style={{ marginBottom: "1.5rem" }}>
            <span>{error}</span>
          </Alert>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.75rem", alignItems: "flex-start" }} className="discovery-layout">
          {/* Left Filter Sidebar */}
          <div>
            <DiscoveryFilters
              filters={currentFilters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Right Results Stream */}
          <div>
            {loading ? (
              <DiscoverySkeleton />
            ) : results.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                  <span>Showing <strong>{results.length}</strong> of <strong>{pagination.total}</strong> discovered openings</span>
                  <span>Sorted by: <strong>{currentFilters.sort === "NEWEST" ? "Newest" : currentFilters.sort === "SALARY_HIGH" ? "Highest Salary" : "Skill & Profile Relevance"}</strong></span>
                </div>

                {results.map((item) => (
                  <RecommendedJobCard key={item.job._id} item={item} />
                ))}

                <DiscoveryPagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  onPageChange={handlePageChange}
                />
              </div>
            ) : (
              <DiscoveryEmptyState
                hasActiveFilters={hasActiveFilters}
                onReset={handleResetFilters}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
