import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import {
  User,
  Mail,
  Phone,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building,
  MapPin,
  Link2,
  IndianRupee,
  Briefcase,
  Clock,
  Sparkles,
  ShieldCheck,
  FileText,
  Check,
  LogIn,
  ExternalLink,
} from "lucide-react";

export const ApplyJobPage = () => {
  const { id } = useParams();
  const { user, accessToken, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [existingApp, setExistingApp] = useState(null);

  // Form State
  const [name, setName] = useState(() => user?.name || "");
  const [email, setEmail] = useState(() => user?.email || "");
  const [phone, setPhone] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentCtc, setCurrentCtc] = useState("");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("30 Days");
  const [experienceYears, setExperienceYears] = useState("2+ years");
  const [resume, setResume] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);
  const [error, setError] = useState("");

  // Update name and email if user state resolves later
  useEffect(() => {
    if (user?.name && !name) setName(user.name);
    if (user?.email && !email) setEmail(user.email);
  }, [user]);

  // Fetch Job details and check for existing application
  useEffect(() => {
    const fetchJobAndApplications = async () => {
      setLoadingJob(true);
      setError("");
      try {
        const [jobData, appsList] = await Promise.all([
          api.getJobById(id),
          api.getApplications(accessToken),
        ]);
        setJob(jobData);

        // Check duplicate application accurately for the logged-in candidate
        if (Array.isArray(appsList) && user) {
          const found = appsList.find((app) => {
            const appId = typeof app.job === "object" ? app.job?._id : app.job;
            if (appId !== id) return false;
            const applicantMatch =
              (typeof app.applicant === "object" && app.applicant?._id === user._id) ||
              app.applicant === user._id ||
              app.applicantEmail === user.email ||
              app.email === user.email;
            return Boolean(applicantMatch);
          });
          if (found) {
            setAlreadyApplied(true);
            setExistingApp(found);
          }
        }
      } catch (err) {
        setError(err.message || "Could not load job details.");
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJobAndApplications();
  }, [id, accessToken, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");

    if (!user || !user._id) {
      setError("Please sign in with a candidate account to apply for this job.");
      toast.error("Please sign in as a job seeker to submit your application.");
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError("Please provide both your full name and valid email address.");
      toast.error("Please fill in the required personal details.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        job: id,
        applicant: user._id,
        applicantName: name.trim(),
        applicantEmail: email.trim(),
        phone: phone.trim(),
        currentLocation: currentLocation.trim(),
        currentCtc: currentCtc.trim(),
        expectedCtc: expectedCtc.trim(),
        noticePeriod,
        experienceYears,
        resume: resume.trim() || "https://jobportal.in/resumes/verified-candidate.pdf",
        portfolio: portfolio.trim(),
        coverLetter:
          coverLetter.trim() ||
          `Hi Hiring Team at ${job?.company || "your company"},\n\nI am thrilled to apply for the ${job?.title || "role"} position. With my relevant experience and tech stack background, I am confident in adding immediate value to your engineering team.`,
      };

      const result = await api.applyJob(payload, accessToken);
      const appRecord = result.application || {
        _id: "app-" + Date.now(),
        job,
        status: "Applied",
        createdAt: new Date().toISOString(),
      };

      setSubmittedApp(appRecord);
      setSuccess(true);
      toast.success(`Application submitted to ${job?.company}!`, "Application Sent");
    } catch (err) {
      setError(err.message || "Failed to submit application. Please try again.");
      toast.error("Failed to submit application. Please verify your details.");
    } finally {
      setSubmitting(false);
    }
  };

  const formattedSalary = job?.salary?.startsWith("₹") ? job.salary : job?.salary ? `₹${job.salary}` : null;

  if (loadingJob) {
    return (
      <div className="section" style={{ paddingTop: "var(--space-12)" }}>
        <div className="container" style={{ maxWidth: "720px", textAlign: "center" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "var(--text-base)" }}>
            Preparing verified application portal...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-16)" }}>
      <div className="container" style={{ maxWidth: "780px" }}>
        {/* Top Back Navigation */}
        <div style={{ marginBottom: "var(--space-4)" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            startIcon={<ArrowLeft size={14} />}
          >
            Back to Job
          </Button>
        </div>

        {/* ALREADY APPLIED STATE */}
        {alreadyApplied ? (
          <Card style={{ textAlign: "center", padding: "var(--space-10) var(--space-6)", boxShadow: "var(--shadow-md)" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-full)",
                background: "var(--success-subtle)",
                color: "var(--success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-4) auto",
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <Badge variant="success" style={{ marginBottom: "var(--space-3)" }}>
              Already Applied
            </Badge>

            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-2)" }}>
              You have already applied for this role!
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", maxWidth: "520px", margin: "0 auto var(--space-6) auto", lineHeight: 1.6 }}>
              Your application for <strong>{job?.title}</strong> at <strong>{job?.company}</strong> is currently on file with the recruiting team. You can monitor the screening progress and recruiter messages from your dashboard.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
              <Link to="/candidate-dashboard">
                <Button variant="primary" size="lg">
                  View in Candidate Dashboard
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="secondary" size="lg">
                  Explore Other Tech Roles
                </Button>
              </Link>
            </div>
          </Card>
        ) : success ? (
          /* SUCCESS SUBMISSION STATE */
          <Card style={{ textAlign: "center", padding: "var(--space-10) var(--space-6)", boxShadow: "var(--shadow-md)" }}>
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "var(--radius-full)",
                background: "var(--success-subtle)",
                color: "var(--success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-4) auto",
              }}
            >
              <CheckCircle2 size={40} />
            </div>

            <Badge variant="success" style={{ marginBottom: "var(--space-3)" }}>
              Application Successfully Transmitted
            </Badge>

            <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
              Application Received!
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", maxWidth: "540px", margin: "0 auto var(--space-6) auto", lineHeight: 1.6 }}>
              Your candidate profile for <strong>{job?.title}</strong> has been directly routed to the <strong>{job?.company}</strong> talent acquisition team.
            </p>

            {/* Next Steps Timeline Box */}
            <div
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-5)",
                maxWidth: "520px",
                margin: "0 auto var(--space-6) auto",
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "var(--space-3)" }}>
                What happens next?
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                  <Check size={14} color="var(--success)" />
                  <span>Confirmation email dispatched to <strong>{email}</strong></span>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                  <Clock size={14} color="var(--primary)" />
                  <span>Hiring manager review within <strong>2-3 business days</strong></span>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                  <Sparkles size={14} color="var(--warning)" />
                  <span>Interview invites sent directly via registered contact info</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
              <Link to="/candidate-dashboard">
                <Button variant="primary" size="lg">
                  Go to Candidate Dashboard
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="secondary" size="lg">
                  Browse More Openings
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* APPLICATION FORM */
          <Card style={{ padding: "var(--space-6)", boxShadow: "var(--shadow-md)" }}>
            {/* Header / Position summary */}
            <div
              style={{
                paddingBottom: "var(--space-5)",
                marginBottom: "var(--space-6)",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                <Badge variant="primary">Direct Application • Verified Opening</Badge>
                {job?.jobType && <Badge variant="neutral">{job.jobType}</Badge>}
              </div>

              <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)", color: "var(--text-primary)" }}>
                Apply for {job?.title}
              </h1>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", color: "var(--text-secondary)", fontSize: "var(--text-xs)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                  <Building size={14} />
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{job?.company}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                  <MapPin size={14} />
                  <span>{job?.location}</span>
                </div>
                {formattedSalary && (
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                    <span className="badge-rupee">{formattedSalary}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Guest Banner if unauthenticated */}
            {!isAuthenticated && (
              <div style={{ marginBottom: "var(--space-6)" }}>
                <Alert variant="info" icon={<LogIn size={18} />}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-2)" }}>
                    <span>
                      Applying as Guest. You can also sign in to auto-fill your profile and track application stages.
                    </span>
                    <Link
                      to="/login"
                      state={{ from: location }}
                      style={{ fontWeight: 700, color: "var(--primary)", textDecoration: "underline", fontSize: "var(--text-xs)" }}
                    >
                      Sign In Now
                    </Link>
                  </div>
                </Alert>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div style={{ marginBottom: "var(--space-5)" }}>
                <Alert variant="danger" title="Submission Error">
                  {error}
                </Alert>
              </div>
            )}

            {/* Main Application Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-3)" }}>
                1. Candidate Information
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                <Input
                  label="Full Name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  startIcon={<User size={16} />}
                />

                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="e.g. rahul.sharma@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  startIcon={<Mail size={16} />}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
                <Input
                  label="Mobile Number (+91)"
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  startIcon={<Phone size={16} />}
                />

                <Input
                  label="Current City / Location"
                  placeholder="e.g. Bangalore, Pune, Mumbai, Remote"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  startIcon={<MapPin size={16} />}
                />
              </div>

              <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-3)" }}>
                2. Professional Compensation & Availability
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                <Input
                  label="Current CTC (₹ LPA)"
                  placeholder="e.g. ₹12 LPA or NA (Fresher)"
                  value={currentCtc}
                  onChange={(e) => setCurrentCtc(e.target.value)}
                  startIcon={<IndianRupee size={16} />}
                />

                <Input
                  label="Expected CTC (₹ LPA)"
                  placeholder="e.g. ₹18 - ₹22 LPA"
                  value={expectedCtc}
                  onChange={(e) => setExpectedCtc(e.target.value)}
                  startIcon={<IndianRupee size={16} />}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
                <div className="form-group">
                  <label className="form-label">
                    <span>Notice Period / Availability</span>
                    <span className="form-label-required">*</span>
                  </label>
                  <select
                    className="select-field"
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                  >
                    <option value="Immediate Joiner">Immediate Joiner (0 days)</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days (1 Month)</option>
                    <option value="60 Days">60 Days (2 Months)</option>
                    <option value="90 Days">90 Days (3 Months / Serving)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Total Relevant Experience</span>
                  </label>
                  <select
                    className="select-field"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                  >
                    <option value="Fresher / College Graduate">Fresher / College Graduate</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="2-4 years">2-4 years</option>
                    <option value="4-7 years">4-7 years</option>
                    <option value="7+ years">7+ years (Senior / Lead)</option>
                  </select>
                </div>
              </div>

              <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-3)" }}>
                3. Resume & Portfolio Links
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                <Input
                  label="Resume URL (Drive / Dropbox / PDF / Cloud Link)"
                  type="url"
                  placeholder="https://drive.google.com/file/d/your-resume"
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  startIcon={<Link2 size={16} />}
                  helperText="Ensure link sharing is set to 'Anyone with link can view'"
                />

                <Input
                  label="GitHub / LinkedIn / Portfolio URL"
                  type="url"
                  placeholder="https://github.com/your-username"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  startIcon={<ExternalLink size={16} />}
                  helperText="Showcase your open source repos or live deployed projects"
                />
              </div>

              <div style={{ marginBottom: "var(--space-6)" }}>
                <Textarea
                  label="Note to Hiring Manager / Cover Letter"
                  rows={4}
                  placeholder="Highlight your relevant tech stack projects, major performance improvements, or why you are passionate about joining this company..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  helperText="Optional, but increases recruiter response rate by 35%."
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="btn-block"
                disabled={submitting}
                startIcon={<Send size={18} />}
              >
                {submitting ? "Submitting Application to Recruiter..." : `Submit Application to ${job?.company || "Employer"}`}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};
