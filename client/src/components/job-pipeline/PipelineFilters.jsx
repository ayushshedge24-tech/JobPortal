import React from "react";
import { Search, Filter, RotateCcw, Briefcase, MapPin } from "lucide-react";

export const PipelineFilters = ({ filters, onChange, onReset, metrics = {} }) => {
  const statusTabs = [
    { key: "ALL", label: "All Applications", count: metrics.total ?? 0 },
    { key: "APPLIED", label: "Submitted", count: metrics.applied ?? 0 },
    { key: "UNDER_REVIEW", label: "Under Review", count: metrics.underReview ?? 0 },
    { key: "SHORTLISTED", label: "Shortlisted", count: metrics.shortlisted ?? 0 },
    { key: "INTERVIEW", label: "Interview", count: metrics.interview ?? 0 },
    { key: "OFFER", label: "Offers", count: metrics.offer ?? 0 },
    { key: "REJECTED", label: "Closed", count: metrics.rejected ?? 0 },
    { key: "WITHDRAWN", label: "Withdrawn", count: metrics.withdrawn ?? 0 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
      {/* Status Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          scrollbarWidth: "thin",
        }}
      >
        {statusTabs.map((tab) => {
          const isActive = (filters.status || "ALL") === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange({ ...filters, status: tab.key, page: 1 })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.85rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.85rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "white" : "var(--text-secondary)",
                background: isActive ? "var(--primary)" : "var(--surface)",
                border: `1px solid ${isActive ? "var(--primary)" : "var(--border)"}`,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "var(--radius-full)",
                  background: isActive ? "rgba(255,255,255,0.25)" : "var(--surface-subtle)",
                  color: isActive ? "white" : "var(--text-muted)",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filter Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr auto",
          gap: "0.75rem",
          background: "var(--surface)",
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
        }}
        className="pipeline-filter-bar"
      >
        {/* Keyword Search */}
        <div style={{ position: "relative" }}>
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
            placeholder="Search role or company..."
            value={filters.keyword || ""}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value, page: 1 })}
            style={{ paddingLeft: "2.25rem", height: "38px", fontSize: "0.85rem" }}
          />
        </div>

        {/* Location Filter */}
        <div style={{ position: "relative" }}>
          <MapPin
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
            placeholder="City / Location..."
            value={filters.location || ""}
            onChange={(e) => onChange({ ...filters, location: e.target.value, page: 1 })}
            style={{ paddingLeft: "2.25rem", height: "38px", fontSize: "0.85rem" }}
          />
        </div>

        {/* Work Mode Filter */}
        <select
          className="select-field"
          value={filters.workMode || ""}
          onChange={(e) => onChange({ ...filters, workMode: e.target.value, page: 1 })}
          style={{ height: "38px", fontSize: "0.85rem" }}
        >
          <option value="">All Work Modes</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
        </select>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary btn-sm"
          title="Reset Filters"
          style={{ height: "38px", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
