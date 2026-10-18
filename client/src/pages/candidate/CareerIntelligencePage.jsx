import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { CareerOverviewStats } from "../../components/career-intelligence/CareerOverviewStats";
import { ResumeReadinessSummary } from "../../components/career-intelligence/ResumeReadinessSummary";
import { SkillCoverageSection } from "../../components/career-intelligence/SkillCoverageSection";
import { JobAlignmentSummary } from "../../components/career-intelligence/JobAlignmentSummary";
import { CareerActionPlan } from "../../components/career-intelligence/CareerActionPlan";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  Compass,
  FileCheck2,
  Award,
  CheckCircle2,
  Sliders,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const CareerIntelligencePage = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCareerIntelligence(token);
      setData(res?.data || res);
    } catch (err) {
      console.error("Career intelligence fetch failed:", err);
      setError(err.message || "Failed to load career intelligence workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  return (
    <div className="career-intelligence-page" style={{ paddingBottom: "5rem" }}>
      {/* Top Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "2.5rem 0 2rem 0",
        }}
      >
        <div className="container" style={{ maxWidth: "1150px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span className="badge badge-purple" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <Sparkles size={12} />
                  <span>Deterministic Career Intelligence v1.0.0</span>
                </span>
                <span className="badge badge-blue" style={{ fontSize: "0.75rem" }}>
                  Verified Fact Aggregation
                </span>
              </div>

              <h1 style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                Candidate Career Intelligence
              </h1>

              <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", maxWidth: "700px", lineHeight: 1.5, margin: 0 }}>
                Unified workspace aggregating your profile completion, resume ATS readiness, verified skills, and job alignment in one centralized location.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={fetchData}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>

              <Link to="/jobs">
                <button type="button" className="btn btn-primary btn-sm">
                  <span>Browse Tech Jobs</span>
                </button>
              </Link>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              <Skeleton height="140px" count={4} />
            </div>
            <Skeleton height="260px" count={2} />
          </div>
        ) : data ? (
          <div>
            {/* 1. TOP STATS ROW */}
            <CareerOverviewStats
              profile={data.profile}
              resumes={data.resumes}
              resumeReadiness={data.resumeReadiness}
              skills={data.skills}
            />

            {/* 2. SUB-SECTION NAVIGATION */}
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", marginBottom: "1.75rem", overflowX: "auto" }}>
              {[
                { id: "ALL", label: "Full Workspace" },
                { id: "READINESS", label: "Resume Readiness" },
                { id: "SKILLS", label: "Skill Coverage" },
                { id: "ALIGNMENT", label: "Job Alignment" },
                { id: "ACTIONS", label: `Action Plan (${data.actions?.length || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "0.65rem 1.1rem",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === tab.id ? "2px solid var(--primary)" : "2px solid transparent",
                    color: activeTab === tab.id ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 3. 2-COLUMN DASHBOARD GRID */}
            {activeTab === "ALL" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "flex-start" }} className="career-grid">
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <ResumeReadinessSummary
                    resumeReadiness={data.resumeReadiness}
                    primaryResume={data.resumes?.primary}
                  />
                  <SkillCoverageSection skills={data.skills} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <JobAlignmentSummary jobAlignment={data.jobAlignment} />
                  <CareerActionPlan actions={data.actions} />
                </div>
              </div>
            )}

            {activeTab === "READINESS" && (
              <ResumeReadinessSummary
                resumeReadiness={data.resumeReadiness}
                primaryResume={data.resumes?.primary}
              />
            )}

            {activeTab === "SKILLS" && (
              <SkillCoverageSection skills={data.skills} />
            )}

            {activeTab === "ALIGNMENT" && (
              <JobAlignmentSummary jobAlignment={data.jobAlignment} />
            )}

            {activeTab === "ACTIONS" && (
              <CareerActionPlan actions={data.actions} />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
