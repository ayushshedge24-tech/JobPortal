import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { RecruiterApplicationBoard } from "../../components/recruiter/RecruiterApplicationBoard";
import { PipelineFilters } from "../../components/recruiter/PipelineFilters";
import { CandidateSummaryDrawer } from "../../components/recruiter/CandidateSummaryDrawer";
import { Briefcase, ArrowLeft } from "lucide-react";

export const RecruiterPipelinePage = () => {
  const { jobId } = useParams();
  const { token } = useAuth();
  const [job, setJob] = useState(null);
  const [jobsList, setJobsList] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filters, setFilters] = useState({
    jobId: jobId || "ALL",
    status: "ALL",
    q: "",
    location: "ALL",
    experience: "ALL",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all recruiter jobs for dropdown
      const jobsRes = await api.getRecruiterJobs({}, token);
      if (jobsRes?.data) setJobsList(jobsRes.data);

      let appsRes;
      if (jobId) {
        appsRes = await api.getJobApplications(jobId, filters, token);
        if (appsRes?.job) setJob(appsRes.job);
      } else {
        appsRes = await api.getAllRecruiterApplications(filters, token);
      }

      if (appsRes?.applications) {
        setApplications(appsRes.applications);
      }
    } catch (err) {
      console.error("Failed to load ATS applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token, jobId, filters.status, filters.location, filters.jobId]);

  const handleFilterChange = (field, val) => {
    setFilters((prev) => ({ ...prev, [field]: val }));
  };

  const handleResetFilters = () => {
    setFilters({
      jobId: jobId || "ALL",
      status: "ALL",
      q: "",
      location: "ALL",
      experience: "ALL",
    });
  };

  const handleStatusChange = async (appId, newStatus, note) => {
    try {
      await api.updateRecruiterApplicationStatus(appId, newStatus, note, token);
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      if (selectedApp && selectedApp._id === appId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to change application status:", err);
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          {jobId && (
            <Link
              to="/recruiter/jobs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.85rem",
                color: "var(--primary)",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Job Listings</span>
            </Link>
          )}
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>
            {job ? `ATS Pipeline: ${job.title}` : "Candidate Recruitment Pipeline"}
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            {job ? `${job.company} • ${job.location}` : "Kanban workspace for evaluating inbound candidate applications."}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <PipelineFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        jobs={jobsList}
      />

      {/* Main Board */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          Loading candidate applications...
        </div>
      ) : (
        <RecruiterApplicationBoard
          applications={applications}
          onStatusChange={handleStatusChange}
          onOpenDrawer={(app) => setSelectedApp(app)}
        />
      )}

      {/* Candidate Review Drawer */}
      {selectedApp && (
        <CandidateSummaryDrawer
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};
