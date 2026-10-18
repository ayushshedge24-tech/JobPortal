import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import {
  FileText,
  Clock,
  CheckCircle2,
  Briefcase,
  ExternalLink,
  Search,
  Calendar,
  Sparkles,
  UserCheck,
  ArrowRight,
  PlusCircle,
  FileCheck,
  Compass,
  Award,
  AlertTriangle,
  FolderGit2,
  Zap,
  Bookmark,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Progress } from "../components/ui/Progress";
import { Skeleton } from "../components/ui/Skeleton";

export const CandidateDashboard = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch applications, profile, and resumes concurrently
        const [allApps, profileData, resumesData] = await Promise.all([
          api.getApplications(token),
          api.getCandidateProfile(token),
          api.getCandidateResumes(token),
        ]);

        if (user && user._id) {
          const userApps = (allApps || []).filter((app) => {
            const appUserId = typeof app.applicant === "object" ? app.applicant?._id : app.applicant;
            return appUserId === user._id || !appUserId;
          });
          setApplications(userApps);
        } else {
          setApplications(allApps || []);
        }

        setProfile(profileData);
        setResumes(resumesData || []);
      } catch (err) {
        console.error("Failed to load candidate dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);

  // Greeting based on Indian Standard Time hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const candidateDisplayName =
    profile?.firstName ||
    (user?.name ? user.name.split(" ")[0] : "Candidate");

  // Application counts
  const totalCount = applications.length;
  const appliedCount = applications.filter((a) => a.status === "Applied" || !a.status).length;
  const shortlistedCount = applications.filter((a) => a.status === "Shortlisted").length;
  const selectedCount = applications.filter((a) => a.status === "Selected" || a.status === "Offer").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Shortlisted":
        return <span className="badge badge-amber">★ Shortlisted for Interview</span>;
      case "Selected":
      case "Offer":
        return <span className="badge badge-green">✓ Offer Extended</span>;
      case "Rejected":
        return <span className="badge badge-red">✕ Application Closed</span>;
      case "Applied":
      default:
        return <span className="badge badge-blue">● Under Recruiter Review</span>;
    }
  };

  const completionPct = profile?.completionPercentage ?? 0;
  const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0];

  // Profile checklist items derived from profile data
  const checklistItems = [
    {
      label: "Basic info & contact number",
      isComplete: !!(profile?.firstName && profile?.phone && profile?.city),
    },
    {
      label: "Professional headline & elevator bio",
      isComplete: !!(profile?.headline && (profile?.professionalSummary?.length >= 50)),
    },
    {
      label: "Work experience (1+ past roles)",
      isComplete: Array.isArray(profile?.experience) && profile.experience.length >= 1,
    },
    {
      label: "Academics & degree qualification",
      isComplete: Array.isArray(profile?.education) && profile.education.length >= 1,
    },
    {
      label: "Technical skills (5+ core skills)",
      isComplete: Array.isArray(profile?.skills) && profile.skills.length >= 5,
    },
    {
      label: "Projects or portfolio showcase",
      isComplete: Array.isArray(profile?.projects) && profile.projects.length >= 1,
    },
  ];

  return (
    <div className="candidate-workstation-dashboard" style={{ paddingBottom: "5rem" }}>
      {/* Header Banner */}
      <div className="dashboard-header">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span className="badge" style={{ background: "rgba(255, 255, 255, 0.2)", color: "white" }}>
                  Candidate Workstation • India
                </span>
                <span className="badge" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#6ee7b7" }}>
                  Verified Job Seeker
                </span>
              </div>
              <h1 style={{ color: "white", fontSize: "2.1rem", marginBottom: "0.3rem", fontWeight: 800 }}>
                {getGreeting()}, {candidateDisplayName}!
              </h1>
              <p style={{ color: "#c7d2fe", fontSize: "0.95rem" }}>
                Manage your verified career profile, track job submissions, and discover high-LPA Indian tech roles.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link to="/candidate/profile" className="btn btn-secondary" style={{ background: "rgba(255,255,255,0.15)", color: "white", borderColor: "rgba(255,255,255,0.3)" }}>
                <UserCheck size={16} />
                <span>Edit Profile</span>
              </Link>
              <Link to="/jobs" className="btn btn-primary" style={{ background: "white", color: "var(--primary)" }}>
                <Search size={16} />
                <span>Browse Jobs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: "-1.5rem" }}>
        {/* Top Grid: Profile Strength Banner + Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
          {/* Profile Strength Card */}
          <Card style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Profile Strength & Recruiter Visibility</h3>
                </div>
                <Badge variant={completionPct >= 80 ? "success" : "warning"}>
                  {completionPct}% Complete
                </Badge>
              </div>

              <Progress value={completionPct} max={100} size="md" variant={completionPct >= 80 ? "success" : "primary"} />

              {/* Checklist */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginTop: "1.25rem" }}>
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "0.85rem",
                      color: item.isComplete ? "var(--text-main)" : "var(--text-light)",
                    }}
                  >
                    {item.isComplete ? (
                      <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                    ) : (
                      <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
                    )}
                    <span style={{ textDecoration: item.isComplete ? "none" : "none" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {completionPct >= 85
                  ? "Your profile has maximum visibility in recruiter candidate searches."
                  : "Profiles with 80%+ strength receive 3.5x more interview call invitations."}
              </span>
              <Link to="/candidate/profile" className="btn btn-primary btn-sm">
                <span>{completionPct === 100 ? "Review Profile" : "Complete Profile"}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </Card>

          {/* Quick Workstation Actions */}
          <Card style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Compass size={18} color="var(--primary)" />
                <span>Workstation Shortcuts</span>
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                Quick navigation for your job search workflow and profile tools.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <Link
                  to="/candidate/profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1rem",
                    background: "var(--surface-subtle)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <UserCheck size={16} color="var(--primary)" />
                    <span>Edit Career Profile</span>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </Link>

                <Link
                  to="/jobs"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1rem",
                    background: "var(--surface-subtle)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Briefcase size={16} color="var(--primary)" />
                    <span>Discover Active Jobs</span>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </Link>

                <Link
                  to="/candidate/resumes"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1rem",
                    background: "var(--surface-subtle)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <FileText size={16} color="var(--primary)" />
                    <span>Manage Resumes</span>
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: "0.75rem" }}>
                    {resumes.length} / 5
                  </span>
                </Link>

                {/* Resume Builder Quick Link */}
                <Link
                  to={primaryResume ? `/candidate/resumes/${primaryResume._id}/builder` : "/candidate/resumes"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1rem",
                    background: "var(--surface-subtle)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <FileCheck size={16} color="var(--primary)" />
                    <span>Live ATS Resume Builder</span>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </Link>

                {/* Resume Analyzer Quick Link */}
                <Link
                  to={primaryResume ? `/candidate/resumes/${primaryResume._id}/analyze` : "/candidate/resumes"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1rem",
                    background: "var(--surface-subtle)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Award size={16} color="var(--primary)" />
                    <span>Resume Quality Analyzer</span>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: "0.7rem" }}>Instant Audit</span>
                </Link>

                {/* Skill Intelligence Quick Link */}
                <Link
                  to={primaryResume ? `/candidate/resumes/${primaryResume._id}/skills` : "/candidate/skills"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1rem",
                    background: "var(--surface-subtle)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Zap size={16} color="var(--secondary)" />
                    <span>Skill Intelligence Hub</span>
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>Deterministic</span>
                </Link>

                {/* Career Intelligence Workspace Quick Link */}
                <Link
                  to="/candidate/career-intelligence"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1rem",
                    background: "rgba(59, 130, 246, 0.08)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    textDecoration: "none",
                    color: "var(--primary)",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Sparkles size={16} color="var(--primary)" />
                    <span>Career Intelligence Workspace</span>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: "0.7rem" }}>Hub</span>
                </Link>

                {/* Recommended Jobs Quick Link */}
                <Link
                  to="/candidate/jobs/recommended"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1rem",
                    background: "rgba(16, 185, 129, 0.08)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    textDecoration: "none",
                    color: "var(--success)",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Compass size={16} color="var(--success)" />
                    <span>Recommended Jobs</span>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>Matches</span>
                </Link>

                {/* Saved Jobs Quick Link */}
                <Link
                  to="/candidate/jobs/saved"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1rem",
                    background: "var(--surface-subtle)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Bookmark size={16} color="var(--primary)" />
                    <span>Saved Job Bookmarks</span>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </Link>

                {/* Applications Pipeline Quick Link */}
                <Link
                  to="/candidate/applications"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1rem",
                    background: "rgba(59, 130, 246, 0.08)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    textDecoration: "none",
                    color: "var(--primary)",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Briefcase size={16} color="var(--primary)" />
                    <span>Applications Pipeline</span>
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>
                    {totalCount} Total
                  </span>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Metric Cards Grid */}
        <div className="dashboard-stats-grid" style={{ marginBottom: "2rem" }}>
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
              <FileText size={24} />
            </div>
            <div>
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">Total Applications</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: "var(--secondary-light)", color: "var(--secondary)" }}>
              <Clock size={24} />
            </div>
            <div>
              <div className="stat-value">{appliedCount}</div>
              <div className="stat-label">Under HR Review</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div className="stat-value">{shortlistedCount}</div>
              <div className="stat-label">Shortlisted Calls</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: "var(--success-light)", color: "var(--success)" }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="stat-value">{selectedCount}</div>
              <div className="stat-label">Offer Letters</div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>My Job Applications</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Track the status and interview progress of your submitted applications.
              </p>
            </div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
              Showing {applications.length} submitted applications
            </span>
          </div>

          {loading ? (
            <div style={{ padding: "2rem 0" }}>
              <Skeleton height="45px" count={4} style={{ marginBottom: "0.75rem" }} />
            </div>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3.5rem 1rem" }}>
              <Briefcase size={44} color="var(--text-light)" style={{ margin: "0 auto 1rem auto" }} />
              <h3 style={{ marginBottom: "0.5rem", fontSize: "1.15rem" }}>No Applications Submitted Yet</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", maxWidth: "420px", margin: "0 auto 1.5rem auto", fontSize: "0.9rem" }}>
                You haven't applied to any Indian tech roles yet. Explore top openings in Bangalore, Pune, Mumbai, and remote!
              </p>
              <Link to="/jobs" className="btn btn-primary">
                Browse Open Jobs
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Role & Company</th>
                    <th>Compensation / CTC</th>
                    <th>Date Applied</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const jobTitle = typeof app.job === "object" ? app.job?.title : "Software Developer";
                    const company = typeof app.job === "object" ? app.job?.company : "Tech Enterprise India";
                    const salary = typeof app.job === "object" ? app.job?.salary : "Competitive LPA";
                    const jobId = typeof app.job === "object" ? app.job?._id : app.job;

                    return (
                      <tr key={app._id}>
                        <td>
                          <div style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: "0.2rem" }}>
                            {jobTitle}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            {company}
                          </div>
                        </td>
                        <td>
                          <span className="badge-rupee">
                            {salary?.startsWith("₹") ? salary : `₹${salary}`}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            <Calendar size={14} />
                            <span>
                              {app.createdAt
                                ? new Date(app.createdAt).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </span>
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
                              <span>View Resume</span>
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>
                              Profile Resume
                            </span>
                          )}
                        </td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td>
                          {jobId ? (
                            <Link to={`/jobs/${jobId}`} className="btn btn-secondary btn-sm">
                              View Role
                            </Link>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CandidateDashboard;
