import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { JobFormWizard } from "../../components/recruiter/JobFormWizard";

export const JobCreationPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    await api.createRecruiterJob(payload, token);
    navigate("/recruiter/jobs");
  };

  return (
    <div className="container" style={{ padding: "2rem 1rem 4rem 1rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto 1.5rem auto" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Create New Job Opening</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Publish open positions with transparent requirements and LPA compensation packages.
        </p>
      </div>
      <JobFormWizard
        initialData={{
          company: user?.name ? user.name.split(" ")[0] + " Technologies" : "Razorpay Technologies",
        }}
        onSubmit={handleCreate}
      />
    </div>
  );
};
