import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  Mail,
  Lock,
  ArrowRight,
  UserCheck,
  Building,
  AlertCircle,
} from "lucide-react";

export const LoginPage = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser?.role === "RECRUITER" || loggedUser?.role === "employer") {
        navigate("/recruiter/dashboard");
      } else if (loggedUser?.role === "ADMIN" || loggedUser?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError("");
    setLoading(true);
    try {
      const loggedUser = await loginAsDemo(role);
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser?.role === "RECRUITER" || loggedUser?.role === "employer" || role === "employer") {
        navigate("/recruiter/dashboard");
      } else if (loggedUser?.role === "ADMIN" || loggedUser?.role === "admin" || role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to sign in with demo account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: "80vh", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "480px" }}>
        <div className="card" style={{ padding: "2.5rem 2rem", boxShadow: "var(--shadow-xl)" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, #4338ca 0%, #0284c7 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem auto",
                boxShadow: "0 4px 12px rgba(67, 56, 202, 0.25)",
              }}
            >
              <Briefcase size={26} />
            </div>
            <h1 style={{ fontSize: "1.75rem", marginBottom: "0.4rem" }}>Sign In to JobPortal</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Access your job applications and recruiter console in India
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "var(--danger-light)",
                color: "var(--danger)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. rahul.sharma@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                  required
                />
                <Mail
                  size={18}
                  color="var(--text-light)"
                  style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label">Password</label>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                  required
                />
                <Lock
                  size={18}
                  color="var(--text-light)"
                  style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: "1.5rem" }}
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts */}
          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
            <div
              style={{
                textAlign: "center",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginBottom: "1rem",
                fontWeight: 700,
              }}
            >
              ⚡ Instant 1-Click Demo Profiles:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => handleDemoLogin("jobseeker")}
                className="btn btn-secondary btn-sm"
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center" }}
              >
                <UserCheck size={15} color="var(--primary)" />
                <span>Demo Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("employer")}
                className="btn btn-secondary btn-sm"
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center" }}
              >
                <Building size={15} color="var(--accent)" />
                <span>Demo Recruiter</span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div
            style={{
              textAlign: "center",
              marginTop: "1.75rem",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            New to JobPortal?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
