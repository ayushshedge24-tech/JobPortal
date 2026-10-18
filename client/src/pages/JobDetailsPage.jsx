import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Tabs } from "../components/ui/Tabs";
import { Alert } from "../components/ui/Alert";
import { SkeletonJobCard } from "../components/ui/Skeleton";
import {
  ArrowLeft,
  MapPin,
  IndianRupee,
  Briefcase,
  Clock,
  Share2,
  Bookmark,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Sparkles,
  Users,
  ChevronRight,
  Award,
  Compass,
  HeartHandshake,
  FileCheck,
  Check,
  Send,
  ExternalLink,
  Laptop,
  GraduationCap,
} from "lucide-react";

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, accessToken } = useAuth();
  const authToken = token || accessToken;
  const toast = useToast();

  const [job, setJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Saved / Bookmarked state
  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jobportal_saved_jobs") || "[]");
    } catch {
      return [];
    }
  });

  const [backendSaved, setBackendSaved] = useState(false);
  const isSaved = useMemo(() => backendSaved || savedJobs.includes(id), [backendSaved, savedJobs, id]);

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      setError("");
      try {
        const [jobData, jobsList] = await Promise.all([
          api.getJobById(id),
          api.getJobs(),
        ]);
        setJob(jobData);
        setAllJobs(Array.isArray(jobsList) ? jobsList : []);

        if (authToken && id) {
          try {
            const statusRes = await api.getSavedJobStatus(id, authToken);
            if (statusRes && typeof statusRes.isSaved === "boolean") {
              setBackendSaved(statusRes.isSaved);
            }
          } catch {}
        }
      } catch (err) {
        setError(err.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJobData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, authToken]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Job link copied to clipboard!", "Share Link");
    }
  };

  const handleToggleSave = async () => {
    const willSave = !isSaved;
    let updated;
    if (!willSave) {
      updated = savedJobs.filter((jobId) => jobId !== id);
      setBackendSaved(false);
      toast.info("Job removed from saved listings", "Saved Jobs");
      if (authToken) {
        try {
          await api.unsaveJob(id, authToken);
        } catch {}
      }
    } else {
      updated = [...savedJobs, id];
      setBackendSaved(true);
      toast.success("Job saved to your bookmarks!", "Saved Jobs");
      if (authToken) {
        try {
          await api.saveJob(id, authToken);
        } catch {}
      }
    }
    setSavedJobs(updated);
    try {
      localStorage.setItem("jobportal_saved_jobs", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Similar Jobs Recommendation
  const similarJobs = useMemo(() => {
    if (!job || !allJobs.length) return [];
    return allJobs
      .filter((j) => j._id !== job._id)
      .slice(0, 3);
  }, [job, allJobs]);

  if (loading) {
    return (
      <div className="section" style={{ paddingTop: "var(--space-8)" }}>
        <div className="container" style={{ maxWidth: "1100px" }}>
          <div style={{ display: "flex", gap: "var(--space-6)" }}>
            <div style={{ flex: 2 }}>
              <SkeletonJobCard />
              <div style={{ marginTop: "var(--space-4)" }}>
                <SkeletonJobCard />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <SkeletonJobCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="section" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)" }}>
        <div className="container" style={{ maxWidth: "600px", textAlign: "center" }}>
          <Card style={{ padding: "var(--space-8)" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "var(--radius-full)",
                background: "var(--bg-subtle)",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-4) auto",
              }}
            >
              <Briefcase size={30} />
            </div>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-2)" }}>
              Job Opportunity Not Found
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)" }}>
              The position you are looking for may have been filled, archived, or is currently inactive.
            </p>
            <Button variant="primary" onClick={() => navigate("/jobs")} startIcon={<ArrowLeft size={16} />}>
              Explore Open Tech Roles
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const {
    _id,
    title,
    company,
    location,
    salary,
    jobType,
    workMode = "Hybrid",
    experience = "2-5 years",
    description,
    skills = [],
    postedBy,
    createdAt,
  } = job;

  const formattedSalary = salary?.startsWith("₹") ? salary : salary ? `₹${salary}` : "Best in Industry";

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Posted";

  const tabsConfig = [
    { id: "overview", label: "Role Overview", icon: <Briefcase size={16} /> },
    { id: "skills", label: "Skills & Tech Stack", icon: <Award size={16} />, badge: skills.length || undefined },
    { id: "benefits", label: "Benefits & Perks", icon: <Sparkles size={16} /> },
    { id: "process", label: "Hiring Process", icon: <Compass size={16} /> },
    { id: "company", label: "About Company", icon: <Building2 size={16} /> },
  ];

  return (
    <div className="section" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-16)" }}>
      <div className="container" style={{ maxWidth: "1160px" }}>
        {/* Breadcrumb & Navigation Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-5)",
            flexWrap: "wrap",
            gap: "var(--space-3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            <Link to="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={12} />
            <Link to="/jobs" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Jobs</Link>
            <ChevronRight size={12} />
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{title}</span>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
              startIcon={<ArrowLeft size={14} />}
            >
              Back
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              startIcon={<Share2 size={14} />}
            >
              Share
            </Button>
            <Button
              variant={isSaved ? "primary" : "secondary"}
              size="sm"
              onClick={handleToggleSave}
              startIcon={<Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />}
            >
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {/* Top Hero Job Header Card */}
        <Card
          style={{
            padding: "var(--space-6)",
            marginBottom: "var(--space-6)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "var(--space-4)",
            }}
          >
            <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "var(--radius-lg)",
                  background: "linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)",
                  color: "#ffffff",
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--shadow-sm)",
                  flexShrink: 0,
                }}
              >
                {company ? company.charAt(0).toUpperCase() : "J"}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <span style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-primary)" }}>
                    {company}
                  </span>
                  <span className="badge badge-subtle-success" style={{ fontSize: "0.7rem" }}>
                    <ShieldCheck size={12} />
                    <span>Verified Employer</span>
                  </span>
                </div>

                <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)", color: "var(--text-primary)" }}>
                  {title}
                </h1>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", alignItems: "center" }}>
                  <Badge variant="primary">{jobType || "Full-time"}</Badge>
                  <Badge variant="neutral">{workMode}</Badge>
                  <span className="badge-rupee" style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <IndianRupee size={13} strokeWidth={2.5} />
                    <span>{formattedSalary.replace("₹", "")}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Top Quick Apply CTA */}
            <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
              {(!user || user.role === "JOB_SEEKER" || user.role === "ADMIN") && (
                <Link to={`/candidate/jobs/${_id}/match`} style={{ textDecoration: "none" }}>
                  <Button variant="secondary" size="lg" startIcon={<Sparkles size={18} />}>
                    Check Alignment
                  </Button>
                </Link>
              )}
              <Link to={`/jobs/${_id}/apply`}>
                <Button variant="primary" size="lg" startIcon={<Send size={18} />}>
                  Apply for this Position
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Meta Ribbon */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-6)",
              marginTop: "var(--space-5)",
              paddingTop: "var(--space-4)",
              borderTop: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              fontSize: "var(--text-xs)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <MapPin size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{location}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <GraduationCap size={16} color="var(--primary)" />
              <span>Experience: <strong>{experience}</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Clock size={16} color="var(--text-muted)" />
              <span>Posted on {formattedDate}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Users size={16} color="var(--success)" />
              <span style={{ color: "var(--success)", fontWeight: 600 }}>Actively accepting applications</span>
            </div>
          </div>
        </Card>

        {/* 2-COLUMN MAIN CONTENT + SIDEBAR LAYOUT */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "var(--space-6)",
            alignItems: "flex-start",
          }}
          className="job-details-grid"
        >
          {/* LEFT COLUMN: TABS & STRUCTURED CONTENT */}
          <div>
            <Card style={{ padding: "var(--space-6)" }}>
              {/* Tab Navigation */}
              <Tabs
                tabs={tabsConfig}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="underline"
                style={{ marginBottom: "var(--space-6)" }}
              />

              {/* TAB 1: ROLE OVERVIEW */}
              {activeTab === "overview" && (
                <div style={{ animation: "fadeIn 200ms ease-out" }}>
                  <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-3)" }}>
                    About The Opportunity
                  </h3>
                  <div
                    style={{
                      fontSize: "var(--text-sm)",
                      lineHeight: 1.8,
                      color: "var(--text-secondary)",
                      whiteSpace: "pre-line",
                      marginBottom: "var(--space-6)",
                    }}
                  >
                    {description}
                  </div>

                  <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-3)" }}>
                    Key Responsibilities
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
                    {[
                      `Design, develop, and maintain high-performance, scalable web services and user interfaces for ${company}.`,
                      "Collaborate with product managers, UI/UX designers, and peer engineers to build delightful end-to-end features.",
                      "Write clean, modular, test-driven code adhering to production industry standards and best practices.",
                      "Troubleshoot, debug, and optimize application latency, throughput, and Web Vitals metrics.",
                      "Participate in agile sprint ceremonies, code reviews, and architectural RFC discussions.",
                    ].map((resp, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "var(--radius-full)",
                            background: "var(--primary-subtle)",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          <Check size={13} strokeWidth={3} />
                        </div>
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                          {resp}
                        </span>
                      </div>
                    ))}
                  </div>

                  <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-3)" }}>
                    Qualifications & Candidate Profile
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
                    {[
                      `Bachelor's or Master's degree in Computer Science, IT, or equivalent practical industry experience.`,
                      `${experience} of hands-on software development experience in modern web stacks.`,
                      "Solid foundation in Data Structures, Algorithms, RESTful API design, and asynchronous programming.",
                      "Strong communication skills and enthusiasm for solving complex software challenges in high-growth environments.",
                    ].map((qual, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                        <div style={{ color: "var(--primary)", marginTop: "3px" }}>•</div>
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                          {qual}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: SKILLS & TECH STACK */}
              {activeTab === "skills" && (
                <div style={{ animation: "fadeIn 200ms ease-out" }}>
                  <div
                    style={{
                      background: "var(--primary-subtle)",
                      border: "1px solid var(--primary-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-4)",
                      marginBottom: "var(--space-5)",
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                    }}
                  >
                    <Sparkles size={22} color="var(--primary)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--primary)" }}>
                        Skill Alignment Overview
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                        Compare the listed tech requirements with your technical background before applying.
                      </div>
                    </div>
                    {(!user || user.role === "JOB_SEEKER" || user.role === "ADMIN") && (
                      <Link to={`/candidate/jobs/${_id}/match`} style={{ textDecoration: "none" }}>
                        <Button variant="outline" size="sm">
                          Detailed Alignment
                        </Button>
                      </Link>
                    )}
                  </div>

                  <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "var(--space-3)" }}>
                    Primary Required Tech Stack
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
                    {skills && skills.length > 0 ? (
                      skills.map((skill, index) => (
                        <div
                          key={index}
                          style={{
                            background: "var(--bg-subtle)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-md)",
                            padding: "var(--space-2) var(--space-4)",
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-2)",
                          }}
                        >
                          <Award size={15} color="var(--primary)" />
                          <span style={{ fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-primary)" }}>
                            {skill}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                        No specific tech stack tags specified.
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "var(--space-3)" }}>
                    Recommended Core Competencies
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-3)" }}>
                    {[
                      { title: "System Architecture", desc: "Microservices & Distributed Systems" },
                      { title: "API Integration", desc: "RESTful, GraphQL & WebSockets" },
                      { title: "Code Quality", desc: "Unit Testing, CI/CD & Linting" },
                      { title: "Database Optimization", desc: "Indexing, Query Plans & Caching" },
                    ].map((comp, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "var(--space-3)",
                          background: "var(--bg-subtle)",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: "var(--text-xs)", color: "var(--text-primary)", marginBottom: "2px" }}>
                          {comp.title}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{comp.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: BENEFITS & CULTURE */}
              {activeTab === "benefits" && (
                <div style={{ animation: "fadeIn 200ms ease-out" }}>
                  <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
                    Employee Benefits & Culture at {company}
                  </h3>

                  {job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
                      {job.benefits.map((benefit, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "var(--space-4)",
                            background: "var(--bg-subtle)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-lg)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "var(--space-3)",
                          }}
                        >
                          <div style={{ color: "var(--primary)", marginTop: "2px" }}>
                            <CheckCircle2 size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-primary)" }}>
                              {typeof benefit === "object" ? benefit.title || benefit.name : benefit}
                            </div>
                            {typeof benefit === "object" && benefit.description && (
                              <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                                {benefit.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "var(--space-8) var(--space-4)",
                        textAlign: "center",
                        background: "var(--bg-subtle)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        marginTop: "var(--space-4)",
                      }}
                    >
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontWeight: 600 }}>
                        Benefits not specified by employer.
                      </p>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
                        Perks and benefits packages can be discussed directly with the hiring team during interview stages.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: HIRING PROCESS */}
              {activeTab === "process" && (
                <div style={{ animation: "fadeIn 200ms ease-out" }}>
                  <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
                    4-Stage Fast-Track Hiring Timeline
                  </h3>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
                    Average turnaround time from application submission to offer letter is 7-10 business days.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    {[
                      {
                        step: "01",
                        title: "Profile & Resume Screening",
                        time: "Day 1-2",
                        desc: "Talent acquisition team reviews your skills, portfolio links, and background alignment.",
                      },
                      {
                        step: "02",
                        title: "Technical Problem Solving & Live Coding",
                        time: "Day 3-4",
                        desc: "45-minute live pair programming round focusing on Data Structures, JavaScript / backend fundamentals.",
                      },
                      {
                        step: "03",
                        title: "System Architecture & Design Deep-Dive",
                        time: "Day 5-6",
                        desc: "60-minute session with engineering leads to discuss scalable API design and database modeling.",
                      },
                      {
                        step: "04",
                        title: "Culture Fit & CTC Compensation Discussion",
                        time: "Day 7+",
                        desc: "Final leadership connect, role expectations alignment, LPA salary negotiation, and offer letter release.",
                      },
                    ].map((st, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "var(--space-4)",
                          padding: "var(--space-4)",
                          background: "var(--bg-subtle)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-md)",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "var(--radius-md)",
                            background: "var(--primary)",
                            color: "#ffffff",
                            fontWeight: 800,
                            fontSize: "var(--text-xs)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {st.step}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                            <div style={{ fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-primary)" }}>
                              {st.title}
                            </div>
                            <span className="badge badge-subtle-neutral" style={{ fontSize: "0.68rem" }}>
                              {st.time}
                            </span>
                          </div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                            {st.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: ABOUT COMPANY */}
              {activeTab === "company" && (
                <div style={{ animation: "fadeIn 200ms ease-out" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--primary-subtle)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "1.25rem",
                      }}
                    >
                      {company ? company.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: 0 }}>
                        {company}
                      </h3>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                        Enterprise Tech Organization • India Operations
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
                    {job.companyDescription || `${company} is currently hiring for the ${title} position located in ${location}.`}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--space-3)" }}>
                    <div style={{ padding: "var(--space-3)", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Primary Hub</div>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-xs)" }}>{location}</div>
                    </div>
                    <div style={{ padding: "var(--space-3)", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Category</div>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-xs)" }}>{job.category || "Software Development"}</div>
                    </div>
                    <div style={{ padding: "var(--space-3)", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Company Size</div>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-xs)" }}>{job.companySize || "Not specified"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Apply banner at bottom of card */}
              <div
                style={{
                  marginTop: "var(--space-8)",
                  padding: "var(--space-5)",
                  background: "var(--primary-subtle)",
                  border: "1px solid var(--primary-border)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "var(--space-4)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: "var(--text-sm)", marginBottom: "2px" }}>
                    Ready to take the next step in your career?
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                    Fast-track your application directly to the {company} talent acquisition team.
                  </div>
                </div>
                <Link to={`/jobs/${_id}/apply`}>
                  <Button variant="primary" startIcon={<Send size={15} />}>
                    Apply Now
                  </Button>
                </Link>
              </div>
            </Card>

            {/* SIMILAR RECOMMENDED JOBS */}
            {similarJobs.length > 0 && (
              <div style={{ marginTop: "var(--space-8)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                  <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>
                    Similar Opportunities in Tech
                  </h3>
                  <Link to="/jobs" style={{ fontSize: "var(--text-xs)", color: "var(--primary)", fontWeight: 600 }}>
                    Browse All Jobs
                  </Link>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
                  {similarJobs.map((simJob) => (
                    <Card
                      key={simJob._id}
                      interactive
                      onClick={() => navigate(`/jobs/${simJob._id}`)}
                      style={{ padding: "var(--space-4)" }}
                    >
                      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", marginBottom: "var(--space-2)" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "var(--radius-md)",
                            background: "var(--primary-subtle)",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "var(--text-sm)",
                          }}
                        >
                          {simJob.company ? simJob.company.charAt(0).toUpperCase() : "J"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-primary)" }}>
                            {simJob.title}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {simJob.company}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)", marginTop: "var(--space-2)" }}>
                        <Badge variant="neutral" style={{ fontSize: "0.68rem" }}>{simJob.location}</Badge>
                        {simJob.salary && <Badge variant="rupee" style={{ fontSize: "0.68rem" }}>{simJob.salary}</Badge>}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY POSITION SNAPSHOT & RECRUITER CONTACT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            {/* Quick Position Snapshot */}
            <Card
              style={{
                position: "sticky",
                top: "86px",
                padding: "var(--space-5)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, marginBottom: "var(--space-4)", paddingBottom: "var(--space-2)", borderBottom: "1px solid var(--border-subtle)" }}>
                Position Snapshot
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Job Type:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{jobType || "Full-time"}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Work Mode:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{workMode}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Experience:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{experience}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Compensation:</span>
                  <span style={{ fontWeight: 800, color: "var(--success)" }}>{formattedSalary}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Location:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)", textAlign: "right", maxWidth: "160px" }}>{location}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {(!user || user.role === "JOB_SEEKER" || user.role === "ADMIN") && (
                  <Link to={`/candidate/jobs/${_id}/match`} style={{ textDecoration: "none" }}>
                    <Button variant="secondary" className="btn-block" size="md" startIcon={<Sparkles size={15} />}>
                      Check Alignment
                    </Button>
                  </Link>
                )}
                <Link to={`/jobs/${_id}/apply`} style={{ textDecoration: "none" }}>
                  <Button variant="primary" className="btn-block" size="lg" startIcon={<Send size={16} />}>
                    Apply Now
                  </Button>
                </Link>
                <Button
                  variant={isSaved ? "primary" : "secondary"}
                  className="btn-block"
                  onClick={handleToggleSave}
                  startIcon={<Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />}
                >
                  {isSaved ? "Saved to Bookmarks" : "Save Job for Later"}
                </Button>
              </div>

              {/* Recruiter / Posted By Contact */}
              <div style={{ marginTop: "var(--space-5)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "var(--space-2)" }}>
                  Hiring Lead
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "var(--radius-full)",
                      background: "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    {typeof postedBy === "object" && postedBy?.name
                      ? postedBy.name.charAt(0).toUpperCase()
                      : "R"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-primary)" }}>
                      {typeof postedBy === "object" && postedBy?.name ? postedBy.name : "Talent Acquisition Team"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {typeof postedBy === "object" && postedBy?.email ? postedBy.email : `recruitment@${company?.toLowerCase().replace(/\s+/g, "") || "company"}.in`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scam prevention disclaimer */}
              <div style={{ marginTop: "var(--space-4)" }}>
                <Alert variant="info">
                  JobPortal guarantees 100% free candidate applications. Never transfer money to any employer.
                </Alert>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
