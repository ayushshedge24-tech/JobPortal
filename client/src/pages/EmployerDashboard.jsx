import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import {
  Briefcase,
  PlusCircle,
  Users,
  MapPin,
  FileText,
  ExternalLink,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";

export const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("jobs"); // 'jobs' | 'applicants'

  // Modal State for Posting New Job
  const [showPostModal, setShowPostModal] = useState(false);
  const [postingLoading, setPostingLoading] = useState(false);
  const [postSuccess, setPostSuccess] = useState("");
  const [postError, setPostError] = useState("");

  // New Job Form State
  const [formData, setFormData] = useState({
    title: "",
    company: user?.name?.includes("HR") ? user.name.split(" ")[0] + " Tech" : "Razorpay Technologies",
    location: "Bangalore (Hybrid)",
    salary: "₹18 - ₹26 LPA",
    jobType: "Full-time",
    description: "",
    skills: "React, Node.js, Express, MongoDB, TypeScript",
  });

  const reloadData = async () => {
    try {
      const [allJobs, allApps] = await Promise.all([
        api.getJobs(),
        api.getApplications(),
      ]);
      setJobs(allJobs);
      setApplications(allApps);
    } catch (err) {
      console.error("Failed to reload employer data:", err);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialData() {
      try {
        const [allJobs, allApps] = await Promise.all([
          api.getJobs(),
          api.getApplications(),
        ]);
        if (!ignore) {
          setJobs(allJobs);
          setApplications(allApps);
        }
      } catch (err) {
        console.error("Failed to load employer data:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadInitialData();
    return () => {
      ignore = true;
    };
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPostError("");
    setPostSuccess("");

    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      setPostError("Please fill in all required fields.");
      return;
    }

    setPostingLoading(true);
    try {
      const skillsArray = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      // Format salary to ensure ₹ prefix
      let salaryFormatted = formData.salary || "₹12 - ₹18 LPA";
      if (!salaryFormatted.startsWith("₹")) {
        salaryFormatted = `₹${salaryFormatted}`;
      }

      const payload = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        salary: salaryFormatted,
        jobType: formData.jobType,
        description: formData.description,
        skills: skillsArray,
        postedBy: user?._id || "employer-demo-id",
      };

      await api.createJob(payload);
      setPostSuccess("Job opening published live across India!");

      // Reset form
      setFormData({
        title: "",
        company: user?.name?.includes("HR") ? user.name.split(" ")[0] + " Tech" : "Razorpay Technologies",
        location: "Bangalore (Hybrid)",
        salary: "₹18 - ₹26 LPA",
        jobType: "Full-time",
        description: "",
        skills: "",
      });

      // Refresh listings
      await reloadData();

      setTimeout(() => {
        setShowPostModal(false);
        setPostSuccess("");
      }, 1500);
    } catch (err) {
      setPostError(err.message || "Failed to post job.");
    } finally {
      setPostingLoading(false);
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="dashboard-header" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: "0.5rem" }}>
                Recruiter & Employer Console • India
              </span>
              <h1 style={{ color: "white", fontSize: "2.1rem", marginBottom: "0.3rem" }}>
                {user?.name || "Priya Deshmukh (Razorpay HR)"}
              </h1>
              <p style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>
                Manage candidate pipelines, publish LPA vacancies, and hire engineering talent.
              </p>
            </div>
            <button
              onClick={() => setShowPostModal(true)}
              className="btn btn-accent btn-lg"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <PlusCircle size={20} />
              <span>Post a New Job</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "4rem" }}>
        {/* Metric Cards Grid */}
        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
              <Briefcase size={24} />
            </div>
            <div>
              <div className="stat-value">{jobs.length}</div>
              <div className="stat-label">Active Job Openings</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-value">{applications.length}</div>
              <div className="stat-label">Candidate Applicants</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: "var(--success-light)", color: "var(--success)" }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="stat-value">
                {applications.filter((a) => a.status === "Shortlisted" || a.status === "Selected").length}
              </div>
              <div className="stat-label">Shortlisted for Rounds</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
          <button
            onClick={() => setActiveTab("jobs")}
            style={{
              background: "transparent",
              border: "none",
              padding: "0.6rem 1rem",
              fontSize: "1rem",
              fontWeight: 700,
              color: activeTab === "jobs" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: activeTab === "jobs" ? "3px solid var(--primary)" : "3px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Briefcase size={18} />
            <span>Active Job Posts ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("applicants")}
            style={{
              background: "transparent",
              border: "none",
              padding: "0.6rem 1rem",
              fontSize: "1rem",
              fontWeight: 700,
              color: activeTab === "applicants" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: activeTab === "applicants" ? "3px solid var(--primary)" : "3px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Users size={18} />
            <span>Inbound Applicants ({applications.length})</span>
          </button>
        </div>

        {/* TAB 1: POSTED JOBS */}
        {activeTab === "jobs" && (
          <div className="card" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem" }}>Published Opportunities</h2>
              <button onClick={() => setShowPostModal(true)} className="btn btn-primary btn-sm">
                <PlusCircle size={15} />
                <span>Add Position</span>
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                Loading jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <Briefcase size={40} color="var(--text-light)" style={{ margin: "0 auto 1rem auto" }} />
                <h3>No jobs posted yet</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
                  Create your first job listing to start receiving candidate applications in India.
                </p>
                <button onClick={() => setShowPostModal(true)} className="btn btn-primary">
                  Post a Job Now
                </button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Job Title & Location</th>
                      <th>Type</th>
                      <th>Compensation (LPA)</th>
                      <th>Date Posted</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((j) => (
                      <tr key={j._id}>
                        <td>
                          <div style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: "0.2rem" }}>
                            {j.title}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <MapPin size={13} />
                            <span>{j.location}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-blue">{j.jobType}</span>
                        </td>
                        <td>
                          <span className="badge-rupee">
                            {j.salary || "Competitive LPA"}
                          </span>
                        </td>
                        <td>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            {j.createdAt
                              ? new Date(j.createdAt).toLocaleDateString("en-IN")
                              : "Recent"}
                          </div>
                        </td>
                        <td>
                          <Link to={`/jobs/${j._id}`} className="btn btn-secondary btn-sm">
                            View Listing
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICANTS */}
        {activeTab === "applicants" && (
          <div className="card" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem" }}>Inbound Indian Applicants</h2>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Total: {applications.length} candidates
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                Loading applicants...
              </div>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <Users size={40} color="var(--text-light)" style={{ margin: "0 auto 1rem auto" }} />
                <h3>No applications received yet</h3>
                <p style={{ color: "var(--text-muted)" }}>
                  As candidates apply for your positions, their profiles and resumes will appear here.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Candidate Info</th>
                      <th>Applied Position</th>
                      <th>Cover Note / Summary</th>
                      <th>Resume</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const applicantName = typeof app.applicant === "object" ? app.applicant?.name : "Candidate";
                      const applicantEmail = typeof app.applicant === "object" ? app.applicant?.email : "applicant@mail.com";
                      const jobTitle = typeof app.job === "object" ? app.job?.title : "Open Role";

                      return (
                        <tr key={app._id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{applicantName}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                              {applicantEmail}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: "var(--primary)" }}>
                              {jobTitle}
                            </span>
                          </td>
                          <td style={{ maxWidth: "240px" }}>
                            <div style={{ fontSize: "0.85rem", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {app.coverLetter || "No cover note provided."}
                            </div>
                          </td>
                          <td>
                            {app.resume ? (
                              <a
                                href={app.resume.startsWith("http") ? app.resume : "#"}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: "var(--primary)",
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                }}
                              >
                                <FileText size={14} />
                                <span>Review Resume</span>
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>
                                Attached in Profile
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-green">
                              {app.status || "Applied"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* POST JOB MODAL DIALOG */}
      {showPostModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
              position: "relative",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPostModal(false)}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
              }}
            >
              <X size={22} />
            </button>

            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                Post a New Tech Vacancy
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Create a vacancy listing and publish it across India on JobPortal.
              </p>
            </div>

            {postSuccess && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "var(--success-light)",
                  color: "var(--success)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                <CheckCircle2 size={18} />
                <span>{postSuccess}</span>
              </div>
            )}

            {postError && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "var(--danger-light)",
                  color: "var(--danger)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                <AlertCircle size={18} />
                <span>{postError}</span>
              </div>
            )}

            <form onSubmit={handlePostJob}>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Senior Backend Engineer (Node.js)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Razorpay, Swiggy, Zepto"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location in India *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bangalore (Hybrid) or Pune (Hinjewadi)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Employment Type</label>
                  <select
                    className="form-control"
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship (Paid)</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Compensation / Package (LPA)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. ₹18 - ₹24 LPA or ₹40,000 / month"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Key Required Skills (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. React.js, Node.js, MongoDB, TypeScript, AWS"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description & Responsibilities *</label>
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="Outline the day-to-day responsibilities, tech architecture, minimum experience, and qualifications..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingLoading}
                  className="btn btn-primary"
                >
                  {postingLoading ? "Publishing..." : "Publish Job Opening (Live)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
