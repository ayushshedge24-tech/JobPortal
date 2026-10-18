import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { AdminFilters } from "../../components/admin/AdminFilters";
import { AuditLogDrawer } from "../../components/admin/AuditLogDrawer";
import { ShieldAlert, Eye } from "lucide-react";

export const AdminAuditLogsPage = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [filters, setFilters] = useState({ q: "", action: "ALL", entityType: "ALL" });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getAdminAuditLogs({ ...filters, page }, token);
      if (res?.data) {
        setLogs(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadLogs(1);
  }, [token, filters.action, filters.entityType]);

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Administrative Audit Trails</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Immutable log of privileged actions, role changes, and platform moderation events.
        </p>
      </div>

      <AdminFilters
        searchPlaceholder="Search audit summary, actor name, action..."
        searchValue={filters.q}
        onSearchChange={(q) => setFilters((f) => ({ ...f, q }))}
        onSearchSubmit={() => loadLogs(1)}
        onReset={() => setFilters({ q: "", action: "ALL", entityType: "ALL" })}
      >
        <select
          value={filters.action}
          onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
          className="input-field"
          style={{ fontSize: "0.85rem", minWidth: "160px" }}
        >
          <option value="ALL">All Actions</option>
          <option value="USER_ROLE_CHANGED">User Role Changed</option>
          <option value="USER_STATUS_CHANGED">User Status Changed</option>
          <option value="JOB_MODERATED">Job Moderated</option>
          <option value="APPLICATION_MODERATED">Application Moderated</option>
        </select>
        <select
          value={filters.entityType}
          onChange={(e) => setFilters((f) => ({ ...f, entityType: e.target.value }))}
          className="input-field"
          style={{ fontSize: "0.85rem", minWidth: "140px" }}
        >
          <option value="ALL">All Entity Types</option>
          <option value="USER">User</option>
          <option value="JOB">Job</option>
          <option value="APPLICATION">Application</option>
          <option value="COMPANY">Company</option>
          <option value="SYSTEM">System</option>
        </select>
      </AdminFilters>

      <div className="card" style={{ padding: "1.5rem", overflowX: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <ShieldAlert size={36} color="var(--text-light)" style={{ margin: "0 auto 1rem auto" }} />
            <h3>No audit records match filters</h3>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Entity Type</th>
                <th>Summary</th>
                <th>Inspection</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {l.createdAt ? new Date(l.createdAt).toLocaleString("en-IN") : "Recent"}
                  </td>
                  <td>
                    <span className="badge badge-blue" style={{ fontSize: "0.75rem" }}>
                      {l.action}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{l.actorName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{l.actorEmail || l.actorRole}</div>
                  </td>
                  <td>
                    <span className="badge badge-purple" style={{ fontSize: "0.75rem" }}>
                      {l.entityType}
                    </span>
                  </td>
                  <td style={{ maxWidth: "300px" }}>
                    <div style={{ fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.summary}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setSelectedLog(l)}
                      className="btn btn-secondary btn-sm"
                      title="Inspect Metadata"
                      style={{ padding: "0.35rem 0.55rem" }}
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedLog && (
        <AuditLogDrawer
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};
