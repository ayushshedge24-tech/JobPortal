import React, { useState } from "react";
import { LayoutGrid, List, Users } from "lucide-react";
import { ApplicationCard } from "./ApplicationCard";

const COLUMNS = [
  { key: "APPLIED", label: "Applied", badgeClass: "badge-blue" },
  { key: "UNDER_REVIEW", label: "Under Review", badgeClass: "badge-amber" },
  { key: "SHORTLISTED", label: "Shortlisted", badgeClass: "badge-purple" },
  { key: "INTERVIEW", label: "Interview", badgeClass: "badge-indigo" },
  { key: "OFFER", label: "Offer Extended", badgeClass: "badge-green" },
  { key: "REJECTED", label: "Not Selected", badgeClass: "badge-red" },
];

export const RecruiterApplicationBoard = ({
  applications = [],
  onStatusChange,
  onOpenDrawer,
}) => {
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' | 'list'
  const [showWithdrawn, setShowWithdrawn] = useState(false);

  // Group applications by status
  const grouped = {
    APPLIED: [],
    UNDER_REVIEW: [],
    SHORTLISTED: [],
    INTERVIEW: [],
    OFFER: [],
    REJECTED: [],
    WITHDRAWN: [],
  };

  applications.forEach((app) => {
    const s = app.status || "APPLIED";
    if (grouped[s]) {
      grouped[s].push(app);
    } else {
      grouped.APPLIED.push(app);
    }
  });

  return (
    <div>
      {/* View Switcher Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
            Total Pipeline: {applications.length} Candidates
          </span>
          {grouped.WITHDRAWN.length > 0 && (
            <button
              type="button"
              onClick={() => setShowWithdrawn(!showWithdrawn)}
              className="badge badge-gray"
              style={{ border: "none", cursor: "pointer", fontSize: "0.75rem" }}
            >
              {showWithdrawn ? "Hide Withdrawn" : `Show Withdrawn (${grouped.WITHDRAWN.length})`}
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.35rem" }}>
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={`btn btn-sm ${viewMode === "kanban" ? "btn-primary" : "btn-secondary"}`}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.35rem 0.65rem" }}
          >
            <LayoutGrid size={14} />
            <span>Kanban Board</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-secondary"}`}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.35rem 0.65rem" }}
          >
            <List size={14} />
            <span>List Table</span>
          </button>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === "kanban" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${showWithdrawn ? 7 : 6}, minmax(280px, 1fr))`,
            gap: "1rem",
            overflowX: "auto",
            paddingBottom: "1.5rem",
          }}
        >
          {COLUMNS.map((col) => {
            const list = grouped[col.key] || [];
            return (
              <div
                key={col.key}
                style={{
                  background: "var(--surface-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "450px",
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: "0.85rem" }}>{col.label}</span>
                  <span className={`badge ${col.badgeClass}`} style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem" }}>
                    {list.length}
                  </span>
                </div>

                {/* Column Content */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {list.length === 0 ? (
                    <div
                      style={{
                        padding: "2rem 1rem",
                        textAlign: "center",
                        color: "var(--text-light)",
                        fontSize: "0.8rem",
                      }}
                    >
                      No candidates
                    </div>
                  ) : (
                    list.map((app) => (
                      <ApplicationCard
                        key={app._id}
                        application={app}
                        onStatusChange={onStatusChange}
                        onOpenDrawer={onOpenDrawer}
                        isCompact
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {/* Optional Withdrawn Column */}
          {showWithdrawn && (
            <div
              style={{
                background: "var(--surface-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "0.85rem",
                display: "flex",
                flexDirection: "column",
                minHeight: "450px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ fontWeight: 800, fontSize: "0.85rem" }}>Withdrawn</span>
                <span className="badge badge-gray" style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem" }}>
                  {grouped.WITHDRAWN.length}
                </span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {grouped.WITHDRAWN.map((app) => (
                  <ApplicationCard
                    key={app._id}
                    application={app}
                    onStatusChange={onStatusChange}
                    onOpenDrawer={onOpenDrawer}
                    isCompact
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* LIST TABLE VIEW */
        <div className="card" style={{ padding: "1.25rem", overflowX: "auto" }}>
          {applications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <Users size={36} color="var(--text-light)" style={{ margin: "0 auto 1rem auto" }} />
              <h4>No applications match criteria</h4>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Location & Exp</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div
                        onClick={() => onOpenDrawer && onOpenDrawer(app)}
                        style={{ fontWeight: 700, cursor: "pointer", color: "var(--primary)" }}
                      >
                        {app.applicantName || app.applicant?.name || "Candidate"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {app.applicantEmail || app.applicant?.email || ""}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{app.job?.title || "Role"}</span>
                    </td>
                    <td>
                      <div>{app.currentLocation || "India"}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Exp: {app.experienceYears || "N/A"} yrs
                      </div>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-IN") : "Recent"}
                    </td>
                    <td>
                      <ApplicationStatusMenu
                        currentStatus={app.status}
                        onStatusChange={(status, note) => onStatusChange(app._id, status, note)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onOpenDrawer && onOpenDrawer(app)}
                        className="btn btn-secondary btn-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
