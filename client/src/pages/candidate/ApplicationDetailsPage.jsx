import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../api/api";
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Send,
  XCircle,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { ApplicationStatusBadge } from "../../components/job-pipeline/ApplicationStatusBadge";
import { ApplicationTimeline } from "../../components/job-pipeline/ApplicationTimeline";

export const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [app, setApp] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [confirmWithdrawModal, setConfirmWithdrawModal] = useState(false);

  const fetchApplication = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCandidateApplicationById(id, token);
      setApp(res?.data || res);
    } catch (err) {
      console.error("Failed to load application details:", err);
      setError(err.message || "Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id, token]);

  const handleWithdraw = async () => {
    if (withdrawing) return;
    setWithdrawing(true);
    try {
      await api.withdrawApplication(id, token);
      toast.success("Application successfully withdrawn.");
      setConfirmWithdrawModal(false);
      fetchApplication();
    } catch (err) {
      console.error("Withdraw failed:", err);
      toast.error(err.message || "Failed to withdraw application.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="section" style={{ paddingTop: "3rem" }}>
        <div className="container" style={{ maxWidth: "860px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading verified application record...
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="section" style={{ paddingTop: "3rem" }}>
        <div className="container" style={{ maxWidth: "860px" }}>
          <Alert variant="danger">
            <span>{error || "Application not found"}</span>
          </Alert>
          <div style={{ marginTop: "1rem" }}>
            <Button variant="secondary" size="sm" onClick={() => navigate("/candidate/applications")} startIcon={<ArrowLeft size={14} />}>
              Back to My Applications
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const job = app.job || { title: "Job Position", company: "Company" };
  const jobId = typeof job === "object" ? job._id : job;
  const formattedSalary = job.salary?.startsWith("₹") ? job.salary : job.salary ? `₹${job.salary}` : null;

  return (
    <div className="application-details-page" style={{ paddingBottom: "5rem" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "2rem 0",
        }}
      >
        <div className="container" style={{ maxWidth: "880px" }}>
          <div style={{ marginBottom: "1rem" }}>
            <Link to="/candidate/applications" className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <ArrowLeft size={14} />
              <span>Back to My Applications</span>
            </Link>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <ApplicationStatusBadge status={app.status} size="lg" />
                {job.workMode && <span className="badge badge-neutral">{job.workMode}</span>}
              </div>

              <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)", margin: "0 0 0.3rem 0" }}>
                {job.title}
              </h1>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 600, color: "var(--text-main)" }}>
                  <Building size={15} />
                  <span>{job.company}</span>
                </div>
                {job.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <MapPin size={15} />
                    <span>{job.location}</span>
                  </div>
                )}
                {formattedSalary && (
                  <span className="badge-rupee">{formattedSalary}</span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await api.getOrCreateConversation({ applicationId: id }, token);
                    if (res?.data?._id) {
                      navigate(`/candidate/messages/${res.data._id}`);
                    }
                  } catch (err) {
                    toast.error(err.message || "Failed to open conversation with recruiter");
                  }
                }}
                className="btn btn-primary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              >
                <MessageSquare size={14} />
                <span>Message Recruiter</span>
              </button>
              {jobId && (
                <Link to={`/candidate/jobs/${jobId}/match`} className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <Sparkles size={14} color="var(--primary)" />
                  <span>Check Alignment</span>
                </Link>
              )}
              {jobId && (
                <Link to={`/jobs/${jobId}`} className="btn btn-secondary btn-sm">
                  View Job Posting
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container" style={{ maxWidth: "880px", marginTop: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.75rem", alignItems: "flex-start" }} className="application-details-layout">
          {/* Left Column: Timeline & Cover Letter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Real Application Timeline Card */}
            <Card style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <Clock size={18} color="var(--primary)" />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                  Application Timeline
                </h2>
              </div>

              <ApplicationTimeline timeline={app.timeline || []} />
            </Card>

            {/* Note / Cover Letter if submitted */}
            {app.coverLetter && (
              <Card style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-main)" }}>
                  Cover Note to Hiring Team
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
                  {app.coverLetter}
                </p>
              </Card>
            )}

            {/* Candidate Submitted Details */}
            {app.applicantDetails && (
              <Card style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-main)" }}>
                  Submitted Profile Snapshot
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", fontSize: "0.85rem" }}>
                  {app.applicantDetails.name && (
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Full Name</span>
                      <strong style={{ color: "var(--text-main)" }}>{app.applicantDetails.name}</strong>
                    </div>
                  )}
                  {app.applicantDetails.email && (
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Email</span>
                      <strong style={{ color: "var(--text-main)" }}>{app.applicantDetails.email}</strong>
                    </div>
                  )}
                  {app.applicantDetails.phone && (
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Phone</span>
                      <strong style={{ color: "var(--text-main)" }}>{app.applicantDetails.phone}</strong>
                    </div>
                  )}
                  {app.applicantDetails.currentLocation && (
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Location</span>
                      <strong style={{ color: "var(--text-main)" }}>{app.applicantDetails.currentLocation}</strong>
                    </div>
                  )}
                  {app.applicantDetails.experienceYears && (
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Total Experience</span>
                      <strong style={{ color: "var(--text-main)" }}>{app.applicantDetails.experienceYears}</strong>
                    </div>
                  )}
                  {app.applicantDetails.noticePeriod && (
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Notice Period</span>
                      <strong style={{ color: "var(--text-main)" }}>{app.applicantDetails.noticePeriod}</strong>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Resume Used & Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Resume Snapshot Card */}
            <Card style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <FileText size={18} color="var(--primary)" />
                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                  Resume Used
                </h3>
              </div>

              <div style={{ background: "var(--surface-subtle)", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", marginBottom: "1rem" }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "0.2rem" }}>
                  {app.resume?.title || "Resume Snapshot"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Version {app.resume?.version || 1} • Linked at submission
                </div>
              </div>

              {app.resume?.url && (
                <a
                  href={app.resume.url.startsWith("http") ? app.resume.url : "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm btn-block"
                  style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "0.3rem" }}
                >
                  <span>View Attached Resume</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </Card>

            {/* Application Management Actions */}
            <Card style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-main)" }}>
                Application Actions
              </h3>

              {app.canWithdraw ? (
                <div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.4, marginBottom: "0.75rem" }}>
                    If you are no longer interested in this position, you can withdraw your application.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    className="btn-block"
                    onClick={() => setConfirmWithdrawModal(true)}
                  >
                    Withdraw Application
                  </Button>
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>
                  Status is finalized or currently managed directly by the recruiting team.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Withdraw Confirmation Modal */}
      {confirmWithdrawModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <Card style={{ maxWidth: "440px", width: "100%", padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <AlertTriangle size={20} color="var(--danger)" />
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                Confirm Withdrawal
              </h3>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>
              Are you sure you want to withdraw your application for <strong>{job.title}</strong> at <strong>{job.company}</strong>? This action cannot be reversed online.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setConfirmWithdrawModal(false)}
                disabled={withdrawing}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? "Withdrawing..." : "Confirm Withdraw"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
