import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { AdminStatCard } from "../../components/admin/AdminStatCard";
import {
  Users,
  Briefcase,
  FileText,
  UserCheck,
  Building2,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export const AdminDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAdminDashboard(token);
        if (res?.data) setData(res.data);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  if (loading) {
    return <div className="container" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>Loading SaaS Admin Operations Console...</div>;
  }

  const overview = data?.overview || {};
  const users = overview.users || { total: 0, candidates: 0, recruiters: 0, admins: 0, active: 0, newToday: 0 };
  const jobs = overview.jobs || { total: 0, active: 0, draft: 0, closed: 0, newToday: 0 };
  const apps = overview.applications || { total: 0, applied: 0, underReview: 0, shortlisted: 0, interview: 0, offer: 0, rejected: 0, newToday: 0 };
  const activity = data?.recentActivity || {};

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <span className="badge badge-purple" style={{ marginBottom: "0.4rem" }}>
          Platform Operations & SaaS Administration
        </span>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>System Governance Console</h1>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
          Factual real-time platform metrics, user directory moderation, and audit trails.
        </p>
      </div>

      {/* Core KPI Grid */}
      <div className="dashboard-stats-grid" style={{ marginBottom: "2rem" }}>
        <AdminStatCard
          title="Total Registered Users"
          value={users.total}
          subtitle={`${users.candidates} Candidates • ${users.recruiters} Recruiters • ${users.admins} Admins`}
          icon={Users}
          color="var(--primary)"
          bg="var(--primary-light)"
        />
        <AdminStatCard
          title="Platform Job Listings"
          value={jobs.total}
          subtitle={`${jobs.active} Published (Active) • ${jobs.draft} Drafts`}
          icon={Briefcase}
          color="#d97706"
          bg="var(--warning-light)"
        />
        <AdminStatCard
          title="Total Applications"
          value={apps.total}
          subtitle={`${apps.interview + apps.offer} Active Interviews & Offers`}
          icon={FileText}
          color="#059669"
          bg="var(--success-light)"
        />
        <AdminStatCard
          title="New Growth Today"
          value={`+${users.newToday + jobs.newToday + apps.newToday}`}
          subtitle={`+${users.newToday} Users • +${jobs.newToday} Jobs • +${apps.newToday} Apps`}
          icon={CheckCircle2}
          color="#7c3aed"
          bg="var(--accent-light)"
        />
      </div>

      {/* Two Column Layout: Quick Actions & Recent Platform Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        {/* Recent Registrations & Users */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Recent Platform Users</h3>
            <Link to="/admin/users" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>
              View All Directory
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {(activity.recentUsers || []).map((u) => (
              <div
                key={u._id}
                style={{
                  padding: "0.75rem",
                  background: "var(--surface-subtle)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{u.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.email}</div>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <span className={`badge ${u.role === "ADMIN" ? "badge-purple" : u.role === "RECRUITER" ? "badge-blue" : "badge-gray"}`} style={{ fontSize: "0.7rem" }}>
                    {u.role}
                  </span>
                  <span className={`badge ${u.isActive ? "badge-green" : "badge-red"}`} style={{ fontSize: "0.7rem" }}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Events */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <ShieldAlert size={18} color="var(--primary)" />
              <span>Administrative Audit Trail</span>
            </h3>
            <Link to="/admin/audit-logs" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>
              View Full Logs
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {(!activity.recentAudits || activity.recentAudits.length === 0) ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No recent administrative audit events recorded.
              </div>
            ) : (
              activity.recentAudits.map((a) => (
                <div
                  key={a._id}
                  style={{
                    padding: "0.75rem",
                    background: "var(--surface-subtle)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.8rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                    <span className="badge badge-blue" style={{ fontSize: "0.65rem" }}>{a.action}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                      {a.createdAt ? new Date(a.createdAt).toLocaleTimeString("en-IN") : ""}
                    </span>
                  </div>
                  <div style={{ color: "var(--text-main)", fontWeight: 600 }}>{a.summary}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    By: {a.actorName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
