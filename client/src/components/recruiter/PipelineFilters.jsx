import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";

export const PipelineFilters = ({
  filters,
  onChange,
  onReset,
  jobs = [],
}) => {
  return (
    <div
      className="card"
      style={{
        padding: "1rem 1.25rem",
        marginBottom: "1.25rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", flex: 1, minWidth: "280px" }}>
        {/* Keyword Search */}
        <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search candidate name, email, skills..."
            value={filters.q || ""}
            onChange={(e) => onChange("q", e.target.value)}
            className="input-field"
            style={{ paddingLeft: "2rem", width: "100%", fontSize: "0.85rem" }}
          />
        </div>

        {/* Job selector */}
        {jobs.length > 0 && (
          <select
            value={filters.jobId || "ALL"}
            onChange={(e) => onChange("jobId", e.target.value)}
            className="input-field"
            style={{ fontSize: "0.85rem", minWidth: "180px" }}
          >
            <option value="ALL">All Jobs ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title}
              </option>
            ))}
          </select>
        )}

        {/* Location selector */}
        <select
          value={filters.location || "ALL"}
          onChange={(e) => onChange("location", e.target.value)}
          className="input-field"
          style={{ fontSize: "0.85rem", minWidth: "140px" }}
        >
          <option value="ALL">All Locations</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Pune">Pune</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Delhi NCR">Delhi NCR</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="btn btn-secondary btn-sm"
        style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
        title="Reset filters"
      >
        <RotateCcw size={14} />
        <span>Reset</span>
      </button>
    </div>
  );
};
