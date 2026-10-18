import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { JobMatchExplanation } from "../../components/job-matching/JobMatchExplanation";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  Send,
  ExternalLink,
} from "lucide-react";

export const JobMatchPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchData, setMatchData] = useState(null);

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getJobMatch(jobId, token);
        setMatchData(res?.data || res);
      } catch (err) {
        console.error("Job match fetch failed:", err);
        setError(err.message || "Failed to load job alignment analysis. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchMatch();
    }
  }, [jobId, token]);

  const job = matchData?.job;

  return (
    <div className="job-match-page" style={{ paddingBottom: "5rem" }}>
      {/* Top Banner Header */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "2.5rem 0 2rem 0",
        }}
      >
        <div className="container" style={{ maxWidth: "1050px" }}>
          {/* Breadcrumbs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <Link
              to={jobId ? `/jobs/${jobId}` : "/jobs"}
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
              <span>Back to Job Listing</span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="badge badge-purple" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <Sparkles size={12} />
                <span>Explainable Match Engine v1.0.0</span>
              </span>
              <span className="badge badge-blue" style={{ fontSize: "0.75rem" }}>
                Zero Opaque AI Scores
              </span>
            </div>
          </div>

          {/* Job Overview Title & CTA */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--primary)" }}>
                  {job?.company || "Employer"}
                </span>
                <span style={{ color: "var(--text-muted)" }}>•</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {job?.location || "Location"}
                </span>
              </div>

              <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                {job?.title || "Job Alignment Analysis"}
              </h1>

              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "650px", lineHeight: 1.4 }}>
                Detailed factor breakdown explaining deterministic compatibility between your candidate profile and this role's declared requirements.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <Link to={`/jobs/${jobId}/apply`} style={{ textDecoration: "none" }}>
                <Button variant="primary" size="md">
                  <Send size={15} />
                  <span>Apply for Role</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ maxWidth: "1050px", marginTop: "2rem" }}>
        {error && (
          <Alert variant="danger" style={{ marginBottom: "1.5rem" }}>
            <span>{error}</span>
          </Alert>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Skeleton height="140px" count={1} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
              <Skeleton height="120px" count={4} />
            </div>
          </div>
        ) : matchData ? (
          <JobMatchExplanation matchData={matchData} />
        ) : null}
      </div>
    </div>
  );
};
