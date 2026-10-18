import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { BarChart3, Users, Briefcase, FileText, PieChart } from "lucide-react";

export const AdminReportsPage = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAdminReports(token);
        if (res?.data) setReports(res.data);
      } catch (err) {
        console.error("Failed to load platform reports:", err);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  if (loading) return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Aggregating platform database analytics...</div>;

  const usersByRole = reports?.usersByRole || {};
  const jobsByStatus = reports?.jobsByStatus || {};
  const jobsByCategory = reports?.jobsByCategory || {};
  const jobsByWorkMode = reports?.jobsByWorkMode || {};
  const appsByStatus = reports?.applicationsByStatus || {};

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <span className="badge badge-purple" style={{ marginBottom: "0.4rem" }}>
          Factual Database Analytics
        </span>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>Platform Operations & Distribution Reports</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Direct MongoDB aggregations across all platform entities without synthetic estimation.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* Users by Role */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Users size={18} color="var(--primary)" />
            <span>User Accounts by Role</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {Object.entries(usersByRole).map(([role, count]) => (
              <div key={role} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "var(--surface-subtle)", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: 600 }}>{role}</span>
                <strong style={{ color: "var(--primary)" }}>{count}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs by Status */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Briefcase size={18} color="#d97706" />
            <span>Jobs by Publication Status</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {Object.entries(jobsByStatus).map(([status, count]) => (
              <div key={status} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "var(--surface-subtle)", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: 600 }}>{status}</span>
                <strong style={{ color: "#d97706" }}>{count}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs by Work Mode */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <PieChart size={18} color="#7c3aed" />
            <span>Jobs by Work Mode</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {Object.entries(jobsByWorkMode).map(([mode, count]) => (
              <div key={mode} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "var(--surface-subtle)", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: 600 }}>{mode}</span>
                <strong style={{ color: "#7c3aed" }}>{count}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Applications by Status */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <FileText size={18} color="#059669" />
            <span>Applications by ATS Status</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {Object.entries(appsByStatus).map(([status, count]) => (
              <div key={status} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "var(--surface-subtle)", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: 600 }}>{status}</span>
                <strong style={{ color: "#059669" }}>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
