import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Briefcase,
  FileText,
  BarChart3,
  ShieldAlert,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Operations Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "User Directory", icon: Users },
  { to: "/admin/candidates", label: "Candidates", icon: UserCheck },
  { to: "/admin/recruiters", label: "Recruiters & Companies", icon: Building2 },
  { to: "/admin/jobs", label: "Job Moderation", icon: Briefcase },
  { to: "/admin/applications", label: "Application Oversight", icon: FileText },
  { to: "/admin/reports", label: "Platform Analytics", icon: BarChart3 },
  { to: "/admin/audit-logs", label: "Audit Trails", icon: ShieldAlert },
];

export const AdminSidebar = () => {
  return (
    <aside
      style={{
        width: "240px",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        padding: "1.5rem 0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        minHeight: "calc(100vh - 70px)",
      }}
    >
      <div style={{ padding: "0 0.75rem 1rem 0.75rem", borderBottom: "1px solid var(--border)", marginBottom: "0.5rem" }}>
        <span className="badge badge-purple" style={{ fontSize: "0.7rem", fontWeight: 800 }}>
          SaaS Admin Control
        </span>
        <div style={{ fontSize: "0.95rem", fontWeight: 800, marginTop: "0.25rem", color: "var(--text-main)" }}>
          Platform Management
        </div>
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.55rem 0.75rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              fontWeight: isActive ? 700 : 600,
              background: isActive ? "var(--surface-subtle)" : "transparent",
              color: isActive ? "var(--primary)" : "var(--text-muted)",
              textDecoration: "none",
            })}
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};
