import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("jobseeker"); // 'jobseeker' or 'employer'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const newUser = await register(name, email, password, role);
      if (newUser?.role === "RECRUITER" || newUser?.role === "employer" || role === "employer") {
        navigate("/recruiter/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: "85vh", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "520px" }}>
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
            <h1 style={{ fontSize: "1.75rem", marginBottom: "0.4rem" }}>Create Account</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Join India's premier tech careers ecosystem
            </p>
          </div>

          {/* Role Selection Switcher */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" style={{ marginBottom: "0.5rem" }}>
              I want to:
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              <button
                type="button"
                onClick={() => setRole("jobseeker")}
                style={{
                  padding: "0.85rem",
                  borderRadius: "var(--radius-md)",
                  border: role === "jobseeker" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: role === "jobseeker" ? "var(--primary-light)" : "var(--surface)",
                  color: role === "jobseeker" ? "var(--primary)" : "var(--text-main)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  transition: "var(--transition)",
                }}
              >
                <User size={20} />
                <span>Find a Job</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("employer")}
                style={{
                  padding: "0.85rem",
                  borderRadius: "var(--radius-md)",
                  border: role === "employer" ? "2px solid var(--accent)" : "1px solid var(--border)",
                  background: role === "employer" ? "var(--accent-light)" : "var(--surface)",
                  color: role === "employer" ? "var(--accent)" : "var(--text-main)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  transition: "var(--transition)",
                }}
              >
                <Building size={20} />
                <span>Hire Talent</span>
              </button>
            </div>
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

          {/* Register Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                {role === "employer" ? "Company / Recruiter Name" : "Full Name"}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={role === "employer" ? "e.g. Razorpay Technologies" : "e.g. Rahul Sharma"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                  required
                />
                <User
                  size={18}
                  color="var(--text-light)"
                  style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder={role === "employer" ? "e.g. talent@company.in" : "e.g. rahul.sharma@gmail.com"}
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
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
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
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Sign In Link */}
          <div
            style={{
              textAlign: "center",
              marginTop: "1.75rem",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            Already registered?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
