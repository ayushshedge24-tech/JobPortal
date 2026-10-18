import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";
import { NotificationBell } from "./notifications/NotificationBell";

export const Navbar = () => {
  const { user, logout, isEmployer, isJobseeker, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore
    }
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Briefcase size={22} strokeWidth={2.5} />
          </div>
          <span>
            Job<span style={{ color: "var(--primary)" }}>Portal</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Find Jobs
            </NavLink>
          </li>

          {/* Role specific links */}
          {user && isJobseeker && (
            <>
              <li>
                <NavLink
                  to="/candidate/dashboard"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/candidate/applications"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  My Applications
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/candidate/jobs/saved"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Saved Jobs
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/candidate/resumes"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Resumes
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/candidate/career-intelligence"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Career Intelligence
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/candidate/messages"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Messages
                </NavLink>
              </li>
            </>
          )}

          {user && isEmployer && (
            <>
              <li>
                <NavLink
                  to="/recruiter/dashboard"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/recruiter/jobs"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Manage Jobs
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/recruiter/jobs/new"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Post a Job
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/recruiter/applications"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Applicants
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/recruiter/messages"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Messages
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/recruiter/company"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Company Profile
                </NavLink>
              </li>
            </>
          )}

          {user && isAdmin && (
            <>
              <li>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Admin Console
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Users
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/jobs"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Moderation
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/applications"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Applications
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/reports"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Reports
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/audit-logs"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Audit Logs
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* User / Auth Actions */}
        <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <ThemeToggle size="sm" />
          {user && isJobseeker && <NotificationBell />}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Link
                to={isAdmin ? "/admin/dashboard" : isEmployer ? "/recruiter/company" : "/candidate/profile"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.3rem 0.65rem",
                  background: "var(--surface-subtle)",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border)",
                  textDecoration: "none",
                  color: "inherit",
                }}
                title="View your profile"
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: isAdmin ? "var(--danger, #ef4444)" : isEmployer ? "var(--accent)" : "var(--primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name}
                </span>
                <span
                  className={`badge ${isAdmin ? "badge-danger" : isEmployer ? "badge-purple" : "badge-blue"}`}
                  style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}
                >
                  {isAdmin ? "Admin" : isEmployer ? "Employer" : "Candidate"}
                </span>
              </Link>

              {/* Prominent, Clearly Visible Logout Button */}
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm logout-btn"
                title="Sign out of your account"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.45rem 0.85rem",
                  color: "var(--danger, #ef4444)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ padding: "0.45rem 0.85rem", fontWeight: 600 }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ padding: "0.45rem 0.85rem", fontWeight: 600 }}>
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="btn btn-secondary btn-sm mobile-toggle-btn"
            id="mobile-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 0 0.75rem 0",
                borderBottom: "1px solid var(--border)",
                marginBottom: "0.25rem",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: isAdmin ? "var(--danger, #ef4444)" : isEmployer ? "var(--accent)" : "var(--primary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {user.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {isAdmin ? "Administrator" : isEmployer ? "Recruiter" : "Job Seeker"}
                </div>
              </div>
              <span
                className={`badge ${isAdmin ? "badge-danger" : isEmployer ? "badge-purple" : "badge-blue"}`}
                style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}
              >
                {isAdmin ? "Admin" : isEmployer ? "Employer" : "Candidate"}
              </span>
            </div>
          )}

          <Link
            to="/"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/jobs"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Find Jobs
          </Link>
          {user && isJobseeker && (
            <>
              <Link
                to="/candidate/dashboard"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Candidate Dashboard
              </Link>
              <Link
                to="/candidate/profile"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Profile
              </Link>
              <Link
                to="/candidate/applications"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Applications
              </Link>
              <Link
                to="/candidate/jobs/saved"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Saved Jobs
              </Link>
              <Link
                to="/candidate/resumes"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resumes
              </Link>
              <Link
                to="/candidate/career-intelligence"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Career Intelligence
              </Link>
              <Link
                to="/candidate/messages"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Messages
              </Link>
            </>
          )}
          {user && isEmployer && (
            <>
              <Link
                to="/recruiter/dashboard"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recruiter Dashboard
              </Link>
              <Link
                to="/recruiter/jobs"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Manage Jobs
              </Link>
              <Link
                to="/recruiter/jobs/new"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Post a Job
              </Link>
              <Link
                to="/recruiter/applications"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Applicants
              </Link>
              <Link
                to="/recruiter/messages"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Messages
              </Link>
              <Link
                to="/recruiter/company"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Company Profile
              </Link>
            </>
          )}
          {user && isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/users"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                User Directory
              </Link>
              <Link
                to="/admin/jobs"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Job Moderation
              </Link>
              <Link
                to="/admin/applications"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Application Oversight
              </Link>
              <Link
                to="/admin/reports"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Platform Reports
              </Link>
              <Link
                to="/admin/audit-logs"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Audit Trail
              </Link>
            </>
          )}

          {/* Drawer Logout / Auth Actions */}
          {user ? (
            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  color: "var(--danger, #ef4444)",
                  fontWeight: 700,
                  padding: "0.6rem",
                }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
              <Link
                to="/login"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, textAlign: "center", padding: "0.5rem" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                style={{ flex: 1, textAlign: "center", padding: "0.5rem" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
