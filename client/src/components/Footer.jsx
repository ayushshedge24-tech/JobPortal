import React from "react";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                marginBottom: "1.2rem",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  background: "linear-gradient(135deg, #4338ca 0%, #0284c7 100%)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(67, 56, 202, 0.3)",
                }}
              >
                <Briefcase size={20} />
              </div>
              <span
                style={{
                  color: "white",
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                Job<span style={{ color: "#818cf8" }}>Portal</span>{" "}
                <span style={{ fontSize: "0.8rem", color: "#38bdf8", fontWeight: 700 }}>INDIA</span>
              </span>
            </div>
            <p
              style={{
                fontSize: "0.92rem",
                lineHeight: "1.65",
                marginBottom: "1.5rem",
                color: "#94a3b8",
                maxWidth: "320px",
              }}
            >
              India's modern hiring ecosystem connecting talented engineers, designers, and managers with unicorn startups and global tech giants.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <span className="badge badge-green" style={{ background: "rgba(5, 150, 105, 0.18)", color: "#34d399" }}>
                ● 15,000+ Active Indian Roles
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-title">For Job Seekers</h4>
            <ul className="footer-links">
              <li>
                <Link to="/jobs">Explore All Jobs</Link>
              </li>
              <li>
                <Link to="/candidate-dashboard">My Applications</Link>
              </li>
              <li>
                <Link to="/register">Create Candidate Profile</Link>
              </li>
              <li>
                <Link to="/jobs?location=Remote">Work From Home / Remote</Link>
              </li>
              <li>
                <Link to="/jobs?type=Internship">Paid Tech Internships</Link>
              </li>
            </ul>
          </div>

          {/* Top Indian Tech Hubs */}
          <div>
            <h4 className="footer-title">Top Tech Hubs</h4>
            <ul className="footer-links">
              <li>
                <Link to="/jobs?location=Bangalore">Bangalore (Silicon Valley)</Link>
              </li>
              <li>
                <Link to="/jobs?location=Pune">Pune (Hinjewadi / Magarpatta)</Link>
              </li>
              <li>
                <Link to="/jobs?location=Mumbai">Mumbai / Navi Mumbai</Link>
              </li>
              <li>
                <Link to="/jobs?location=Hyderabad">Hyderabad (HITEC City)</Link>
              </li>
              <li>
                <Link to="/jobs?location=Delhi">Gurugram & Delhi NCR</Link>
              </li>
              <li>
                <Link to="/jobs?location=Nashik">Nashik & Tier-2 Hubs</Link>
              </li>
            </ul>
          </div>

          {/* Popular Tech Roles */}
          <div>
            <h4 className="footer-title">In-Demand Stacks</h4>
            <ul className="footer-links">
              <li>
                <Link to="/jobs?q=MERN">Full Stack MERN Developer</Link>
              </li>
              <li>
                <Link to="/jobs?q=React">Frontend React.js Specialist</Link>
              </li>
              <li>
                <Link to="/jobs?q=Java">Java & Spring Boot APIs</Link>
              </li>
              <li>
                <Link to="/jobs?q=DevOps">AWS Cloud & DevOps</Link>
              </li>
              <li>
                <Link to="/jobs?q=Designer">Product UI / UX Designer</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} JobPortal India. Built with modern MERN technology.</p>
          <div style={{ display: "flex", gap: "1.5rem", color: "#64748b" }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Trust & Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
