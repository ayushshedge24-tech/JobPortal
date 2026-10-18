import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { JobFormWizard } from "../../components/recruiter/JobFormWizard";

export const JobEditPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await api.getRecruiterJobById(id, token);
        if (res?.job) {
          setJob(res.job);
        }
      } catch (err) {
        setError(err.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    }
    if (id && token) loadJob();
  }, [id, token]);

  const handleUpdate = async (payload) => {
    await api.updateRecruiterJob(id, payload, token);
    navigate("/recruiter/jobs");
  };

  if (loading) {
    return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading job for editing...</div>;
  }

  if (error || !job) {
    return (
      <div className="container" style={{ padding: "4rem", textAlign: "center" }}>
        <div className="badge badge-red">{error || "Job not found"}</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto 1.5rem auto" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Edit Job Opening</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Update requirements, compensation, and description for {job.title}.
        </p>
      </div>
      <JobFormWizard initialData={job} onSubmit={handleUpdate} isEditing />
    </div>
  );
};
