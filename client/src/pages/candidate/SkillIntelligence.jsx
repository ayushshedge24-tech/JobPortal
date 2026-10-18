import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Briefcase,
  ExternalLink,
  Edit3,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Tag,
  BookOpen,
  Info,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { api } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { Alert } from "../../components/ui/Alert";

const CATEGORY_LABELS = {
  PROGRAMMING: "Programming Languages",
  FRONTEND: "Frontend Engineering",
  BACKEND: "Backend & Systems",
  DATABASE: "Databases & Storage",
  DATA_ANALYTICS: "Data Analytics & BI",
  DATA_SCIENCE: "Data Science",
  AI_ML: "AI & Machine Learning",
  CLOUD: "Cloud Infrastructure",
  DEVOPS: "DevOps & CI/CD",
  CYBERSECURITY: "Cybersecurity",
  MOBILE: "Mobile Development",
  TESTING: "QA & Testing",
  UI_UX: "UI/UX Design",
  BUSINESS: "Business & Management",
  TOOLS: "Developer Tools",
  SOFT_SKILLS: "Soft Skills & Leadership",
  OTHER: "General & Other",
};

export const SkillIntelligence = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allResumes, setAllResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(id || null);
  const [skillProfile, setSkillProfile] = useState(null);

  // Active UI Tab: "CATEGORIES" | "ALIASES" | "GAP"
  const [activeTab, setActiveTab] = useState("CATEGORIES");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [expandedSkillKey, setExpandedSkillKey] = useState(null);

  // Job Gap State
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [gapLoading, setGapLoading] = useState(false);
  const [gapResult, setGapResult] = useState(null);

  // 1. Initial Load: Resumes & Active Skill Profile
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resumesRes, jobsRes] = await Promise.all([
          api.getCandidateResumes(token),
          api.getJobs(),
        ]);

        const resumes = resumesRes || [];
        setAllResumes(resumes);
        setAvailableJobs(jobsRes?.jobs || jobsRes || []);

        let resumeToLoad = id;
        if (!resumeToLoad && resumes.length > 0) {
          const primary = resumes.find((r) => r.isPrimary) || resumes[0];
          resumeToLoad = primary._id;
        }

        if (resumeToLoad) {
          setSelectedResumeId(resumeToLoad);
          const skillsRes = await api.getResumeSkills(resumeToLoad, token);
          setSkillProfile(skillsRes?.data || skillsRes);
        } else {
          // Fallback to candidate profile skills
          const candidateSkillsRes = await api.getCandidateSkills(token);
          setSkillProfile(candidateSkillsRes?.data || candidateSkillsRes);
        }
      } catch (err) {
        console.error("Skill Intelligence load error:", err);
        setError("Unable to load skill intelligence. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [id, token]);

  // 2. Switch Resume
  const handleSelectResume = async (resumeId) => {
    if (!resumeId || resumeId === selectedResumeId) return;
    setSelectedResumeId(resumeId);
    setLoading(true);
    setGapResult(null);
    try {
      const skillsRes = await api.getResumeSkills(resumeId, token);
      setSkillProfile(skillsRes?.data || skillsRes);
      navigate(`/candidate/resumes/${resumeId}/skills`, { replace: true });
    } catch (err) {
      console.error("Failed to load skills for resume:", err);
      addToast("Failed to load skills for selected resume.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 3. Trigger Job Skill Gap Analysis
  const handleAnalyzeJobGap = async (jobId) => {
    if (!jobId || !selectedResumeId) return;
    setSelectedJobId(jobId);
    setGapLoading(true);
    try {
      const res = await api.getResumeSkillGap(selectedResumeId, jobId, token);
      setGapResult(res?.data || res);
      addToast("Deterministic skill gap analysis complete! 🎯", "success");
    } catch (err) {
      console.error("Skill gap analysis failed:", err);
      addToast("Failed to analyze skill gap against the selected job.", "error");
    } finally {
      setGapLoading(false);
    }
  };

  // Filter skills by category
  const skillsList = skillProfile?.skills || [];
  const filteredSkills =
    selectedCategoryFilter === "ALL"
      ? skillsList
      : skillsList.filter((s) => s.category === selectedCategoryFilter);

  const metrics = skillProfile?.metrics || {
    totalSkills: 0,
    explicitSkillsCount: 0,
    mentionedSkillsCount: 0,
    declaredLevelsCount: 0,
    unspecifiedLevelsCount: 0,
    categoriesRepresented: 0,
  };

  const aliasesDetected = skillProfile?.aliasesDetected || [];

  return (
    <div className="skill-intelligence-page" style={{ paddingBottom: "5rem" }}>
      {/* Top Banner Header */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "2.5rem 0 2rem 0",
        }}
      >
        <div className="container" style={{ maxWidth: "1150px" }}>
          {/* Breadcrumbs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <Link
              to="/candidate/resumes"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Resumes</span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="badge badge-purple" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <Sparkles size={12} />
                <span>Deterministic Engine v1.0.0</span>
              </span>
              <span className="badge badge-blue" style={{ fontSize: "0.75rem" }}>
                Zero Fake AI Scores
              </span>
            </div>
          </div>

          {/* Title & Actions Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                Skill Intelligence Hub
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "680px", lineHeight: 1.5 }}>
                Inspect normalized canonical skills detected in your resume, audit normalization aliases, and analyze explainable skill gaps against Indian tech job requirements.
              </p>
            </div>

            {/* Resume Selector & Builder Quick Links */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {allResumes.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label htmlFor="resume-selector" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>
                    Resume:
                  </label>
                  <select
                    id="resume-selector"
                    value={selectedResumeId || ""}
                    onChange={(e) => handleSelectResume(e.target.value)}
                    style={{
                      padding: "0.45rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      color: "var(--text-main)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {allResumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title} {r.isPrimary ? "★" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedResumeId && (
                <Link to={`/candidate/resumes/${selectedResumeId}/builder`} style={{ textDecoration: "none" }}>
                  <Button variant="secondary" size="sm">
                    <Edit3 size={14} />
                    <span>Open Builder</span>
                  </Button>
                </Link>
              )}

              {selectedResumeId && (
                <Link to={`/candidate/resumes/${selectedResumeId}/analyze`} style={{ textDecoration: "none" }}>
                  <Button variant="outline" size="sm">
                    <ShieldCheck size={14} />
                    <span>Quality Audit</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ maxWidth: "1150px", marginTop: "2rem" }}>
        {error && (
          <Alert variant="danger" style={{ marginBottom: "1.5rem" }}>
            <span>{error}</span>
          </Alert>
        )}

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
            <Skeleton height="110px" count={4} />
          </div>
        ) : (
          <>
            {/* 1. Metric Overview Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <Card style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Layers size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                      {metrics.totalSkills}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Total Normalized Skills
                    </div>
                  </div>
                </div>
              </Card>

              <Card style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--secondary-light)",
                      color: "var(--secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                      {metrics.categoriesRepresented}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Categories Represented
                    </div>
                  </div>
                </div>
              </Card>

              <Card style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Award size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                      {metrics.declaredLevelsCount}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Explicit Levels Declared
                    </div>
                  </div>
                </div>
              </Card>

              <Card style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(148, 163, 184, 0.15)",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Info size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
                      {metrics.unspecifiedLevelsCount}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Unspecified Levels (Not Inferred)
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Navigation Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                borderBottom: "1px solid var(--border)",
                marginBottom: "1.75rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("CATEGORIES")}
                style={{
                  padding: "0.75rem 1.25rem",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === "CATEGORIES" ? "2px solid var(--primary)" : "2px solid transparent",
                  color: activeTab === "CATEGORIES" ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: activeTab === "CATEGORIES" ? 700 : 500,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <Layers size={16} />
                <span>Skills by Category ({skillsList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ALIASES")}
                style={{
                  padding: "0.75rem 1.25rem",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === "ALIASES" ? "2px solid var(--primary)" : "2px solid transparent",
                  color: activeTab === "ALIASES" ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: activeTab === "ALIASES" ? 700 : 500,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <Tag size={16} />
                <span>Normalization Transparency ({aliasesDetected.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("GAP")}
                style={{
                  padding: "0.75rem 1.25rem",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === "GAP" ? "2px solid var(--primary)" : "2px solid transparent",
                  color: activeTab === "GAP" ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: activeTab === "GAP" ? 700 : 500,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <Zap size={16} />
                <span>Target Job Skill Gap Engine</span>
              </button>
            </div>

            {/* TAB 1: SKILLS BY CATEGORY */}
            {activeTab === "CATEGORIES" && (
              <div>
                {/* Category Filter Pills */}
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter("ALL")}
                    className={`badge ${selectedCategoryFilter === "ALL" ? "badge-blue" : "badge-neutral"}`}
                    style={{ cursor: "pointer", padding: "0.4rem 0.8rem", fontSize: "0.8rem", border: "none" }}
                  >
                    All Skills ({skillsList.length})
                  </button>

                  {Object.keys(skillProfile?.categories || {}).map((catKey) => {
                    const count = (skillProfile.categories[catKey] || []).length;
                    if (count === 0) return null;
                    const isSelected = selectedCategoryFilter === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(catKey)}
                        className={`badge ${isSelected ? "badge-blue" : "badge-neutral"}`}
                        style={{ cursor: "pointer", padding: "0.4rem 0.8rem", fontSize: "0.8rem", border: "none" }}
                      >
                        {CATEGORY_LABELS[catKey] || catKey} ({count})
                      </button>
                    );
                  })}
                </div>

                {filteredSkills.length === 0 ? (
                  <Card style={{ padding: "3rem", textAlign: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                      No skills found in this category.
                    </p>
                  </Card>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {filteredSkills.map((skill) => {
                      const isExpanded = expandedSkillKey === skill.key;
                      return (
                        <Card
                          key={skill.key}
                          style={{
                            padding: "1.25rem",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            {/* Skill Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                              <div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.2rem" }}>
                                  {skill.name}
                                </h3>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                  {CATEGORY_LABELS[skill.category] || skill.category}
                                </span>
                              </div>

                              {skill.level && skill.level !== "NOT_SPECIFIED" ? (
                                <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>
                                  {skill.level}
                                </span>
                              ) : (
                                <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>
                                  Unspecified
                                </span>
                              )}
                            </div>

                            {/* Source badges */}
                            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", margin: "0.75rem 0" }}>
                              {skill.sources.map((src) => {
                                if (src === "EXPLICIT_SKILL") {
                                  return (
                                    <span key={src} className="badge badge-blue" style={{ fontSize: "0.65rem" }}>
                                      Explicit Skill
                                    </span>
                                  );
                                }
                                if (src === "EXPERIENCE_BULLET") {
                                  return (
                                    <span key={src} className="badge badge-purple" style={{ fontSize: "0.65rem" }}>
                                      Experience Bullet
                                    </span>
                                  );
                                }
                                if (src === "PROJECT_TECHNOLOGY" || src === "PROJECT_DESCRIPTION") {
                                  return (
                                    <span key={src} className="badge badge-amber" style={{ fontSize: "0.65rem" }}>
                                      Project
                                    </span>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>

                          {/* Evidence Expansion Toggle */}
                          {skill.evidence && skill.evidence.length > 0 && (
                            <div style={{ marginTop: "0.5rem", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>
                              <button
                                type="button"
                                onClick={() => setExpandedSkillKey(isExpanded ? null : skill.key)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--primary)",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                  padding: "0.2rem 0",
                                }}
                              >
                                <span>{isExpanded ? "Hide Evidence" : `View Evidence (${skill.evidence.length})`}</span>
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>

                              {isExpanded && (
                                <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                  {skill.evidence.map((ev, i) => (
                                    <div
                                      key={i}
                                      style={{
                                        padding: "0.4rem 0.6rem",
                                        background: "var(--surface-subtle)",
                                        borderRadius: "var(--radius-sm)",
                                        fontSize: "0.75rem",
                                        color: "var(--text-muted)",
                                        lineHeight: 1.4,
                                        borderLeft: "2px solid var(--primary)",
                                      }}
                                    >
                                      {ev.text}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: NORMALIZATION & ALIASES TRANSPARENCY */}
            {activeTab === "ALIASES" && (
              <div>
                <Card style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem" }}>
                    Canonical Normalization Transparency
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    The skill intelligence engine maps informal spellings, aliases, and framework variations into standard industry terms while ensuring custom unmapped skills are never deleted.
                  </p>
                </Card>

                {aliasesDetected.length === 0 ? (
                  <Card style={{ padding: "2.5rem", textAlign: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                      All skills in your resume are already in their canonical format (e.g., "React", "Python"). No aliases required resolution.
                    </p>
                  </Card>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
                    {aliasesDetected.map((alias, idx) => (
                      <Card key={idx} style={{ padding: "1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Raw Resume Input</span>
                          <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 700 }}>Canonical Output</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <code style={{ fontSize: "0.95rem", color: "var(--danger)", background: "var(--surface-subtle)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                            "{alias.original}"
                          </code>
                          <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>→</span>
                          <span className="badge badge-green" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                            {alias.canonicalName}
                          </span>
                        </div>
                        <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          Category: <strong>{CATEGORY_LABELS[alias.category] || alias.category}</strong>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TARGET JOB SKILL GAP ENGINE */}
            {activeTab === "GAP" && (
              <div>
                <Card style={{ padding: "1.75rem", marginBottom: "1.75rem" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                    Explainable Job Skill Gap Analysis
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                    Select an active job posting from Indian tech employers to run an instant deterministic skill gap audit. Discover matched competencies and targeted learning recommendations without fake percentage scores.
                  </p>

                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: "260px" }}>
                      <select
                        value={selectedJobId}
                        onChange={(e) => handleAnalyzeJobGap(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.6rem 1rem",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          color: "var(--text-main)",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        <option value="">-- Select a Target Job to Analyze --</option>
                        {availableJobs.map((j) => (
                          <option key={j._id} value={j._id}>
                            {j.title} • {j.company} ({j.location})
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => handleAnalyzeJobGap(selectedJobId)}
                      disabled={!selectedJobId || gapLoading}
                    >
                      {gapLoading ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />}
                      <span>Run Skill Gap Audit</span>
                    </Button>
                  </div>
                </Card>

                {/* Skill Gap Results */}
                {gapResult && (
                  <div>
                    {/* Job Context Header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem 1.25rem",
                        background: "var(--surface-subtle)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border)",
                        marginBottom: "1.5rem",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>
                          Target: {gapResult.job?.jobTitle}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          {gapResult.job?.company} • Total Declared Requirements: {gapResult.metrics?.totalJobSkills} skills
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <span className="badge badge-green" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>
                          ✓ {gapResult.metrics?.matchedCount} Matched
                        </span>
                        <span className="badge badge-amber" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>
                          ✕ {gapResult.metrics?.missingCount} Missing
                        </span>
                      </div>
                    </div>

                    {/* 1. MATCHED SKILLS */}
                    <div style={{ marginBottom: "2rem" }}>
                      <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <CheckCircle2 size={18} color="#10b981" />
                        <span>Matched Job Requirements ({gapResult.matched?.length || 0})</span>
                      </h4>

                      {gapResult.matched?.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                          No direct skill matches detected for this job.
                        </p>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
                          {gapResult.matched.map((m) => (
                            <Card key={m.key} style={{ padding: "1rem", borderColor: "#10b981" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                                <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{m.name}</div>
                                {m.candidateLevel && m.candidateLevel !== "NOT_SPECIFIED" && (
                                  <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>{m.candidateLevel}</span>
                                )}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                Category: {CATEGORY_LABELS[m.category] || m.category}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. MISSING SKILLS */}
                    <div style={{ marginBottom: "2rem" }}>
                      <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <AlertTriangle size={18} color="var(--warning)" />
                        <span>Declared Job Requirements Absent from Resume ({gapResult.missing?.length || 0})</span>
                      </h4>

                      {gapResult.missing?.length === 0 ? (
                        <p style={{ color: "#10b981", fontSize: "0.875rem", fontWeight: 600 }}>
                          ✓ Outstanding! You have full coverage of all declared skill requirements for this position.
                        </p>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "0.75rem" }}>
                          {gapResult.missing.map((ms) => (
                            <Card key={ms.key} style={{ padding: "1rem", borderColor: "var(--warning)" }}>
                              <div style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: "0.2rem" }}>
                                {ms.name}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                                {CATEGORY_LABELS[ms.category] || ms.category}
                              </div>
                              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
                                {ms.reason}
                              </p>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. DETERMINISTIC LEARNING RECOMMENDATIONS */}
                    {gapResult.recommendations?.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Sparkles size={18} color="var(--primary)" />
                          <span>Actionable Recommendations ({gapResult.recommendations.length})</span>
                        </h4>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          {gapResult.recommendations.map((rec) => (
                            <Card key={rec.id} style={{ padding: "1.25rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem" }}>
                                  {rec.action}
                                </div>
                                <span
                                  className={`badge ${
                                    rec.priority === "HIGH"
                                      ? "badge-red"
                                      : rec.priority === "MEDIUM"
                                      ? "badge-amber"
                                      : "badge-blue"
                                  }`}
                                  style={{ fontSize: "0.7rem", fontWeight: 700 }}
                                >
                                  {rec.priority} Priority
                                </span>
                              </div>

                              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                                {rec.reason}
                              </p>

                              <div style={{ fontSize: "0.8rem", color: "var(--text-light)", background: "var(--surface-subtle)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)" }}>
                                💡 <strong>Guidance:</strong> {rec.guidance}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
