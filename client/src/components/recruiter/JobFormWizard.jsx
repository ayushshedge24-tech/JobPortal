import React, { useState } from "react";
import { Check, ArrowRight, ArrowLeft, Briefcase, Plus, X } from "lucide-react";

const STEPS = [
  { id: 1, title: "Basic Info" },
  { id: 2, title: "Description" },
  { id: 3, title: "Skills & Requirements" },
  { id: 4, title: "Compensation & Work Mode" },
  { id: 5, title: "Benefits & Perks" },
  { id: 6, title: "Review & Publish" },
];

export const JobFormWizard = ({
  initialData = {},
  onSubmit,
  isEditing = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    company: initialData.company || "",
    location: initialData.location || "Bengaluru, India (Hybrid)",
    workMode: initialData.workMode || "Hybrid",
    experience: initialData.experience || "2-4 years",
    category: initialData.category || "Software Development",
    salary: initialData.salary || "₹18 - ₹26 LPA",
    jobType: initialData.jobType || "Full-time",
    description: initialData.description || "",
    skills: Array.isArray(initialData.skills) ? initialData.skills.join(", ") : initialData.skills || "React, Node.js, TypeScript, MongoDB",
    benefits: Array.isArray(initialData.benefits) ? initialData.benefits.join(", ") : initialData.benefits || "Comprehensive Health Insurance (₹7L), Annual Learning Budget, Hybrid Flexibility",
    status: initialData.status || "PUBLISHED",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    setError("");
    if (currentStep === 1) {
      if (!formData.title.trim() || !formData.company.trim()) {
        setError("Job title and Company name are required.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.description.trim() || formData.description.trim().length < 20) {
        setError("Please enter a detailed job description (at least 20 characters).");
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.location.trim()) {
        setError("Location is required.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((s) => Math.min(STEPS.length, s + 1));
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (targetStatus) => {
    if (!validateStep()) return;
    setLoading(true);
    setError("");

    try {
      const skillsArray = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const benefitsArray = formData.benefits
        ? formData.benefits.split(",").map((b) => b.trim()).filter(Boolean)
        : [];

      const payload = {
        ...formData,
        status: targetStatus || formData.status,
        skills: skillsArray,
        benefits: benefitsArray,
      };

      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "Failed to save job opening.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      {/* Wizard Step Indicator */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        {STEPS.map((step) => (
          <div
            key={step.id}
            onClick={() => step.id < currentStep && setCurrentStep(step.id)}
            style={{
              textAlign: "center",
              flex: 1,
              cursor: step.id < currentStep ? "pointer" : "default",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: currentStep === step.id ? "var(--primary)" : step.id < currentStep ? "var(--success)" : "var(--surface-subtle)",
                color: currentStep === step.id || step.id < currentStep ? "white" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 0.35rem auto",
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              {step.id < currentStep ? <Check size={14} /> : step.id}
            </div>
            <div style={{ fontSize: "0.75rem", fontWeight: currentStep === step.id ? 700 : 500, color: currentStep === step.id ? "var(--text-main)" : "var(--text-muted)" }}>
              {step.title}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="badge badge-red" style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem", textAlign: "left" }}>
          {error}
        </div>
      )}

      {/* STEP 1: Basic Info */}
      {currentStep === 1 && (
        <div>
          <h3 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Basic Position Information</h3>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="input-field"
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
              Hiring Company Name *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              placeholder="e.g. Razorpay Technologies"
              className="input-field"
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
              Job Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="input-field"
              style={{ width: "100%" }}
            >
              <option value="Software Development">Software Development</option>
              <option value="Product Management">Product Management</option>
              <option value="Data Science & AI">Data Science & AI</option>
              <option value="DevOps & Cloud">DevOps & Cloud</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Quality Assurance">Quality Assurance</option>
            </select>
          </div>
        </div>
      )}

      {/* STEP 2: Description */}
      {currentStep === 2 && (
        <div>
          <h3 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Job Description & Responsibilities</h3>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
              Detailed Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Outline role responsibilities, core impact, day-to-day work, and team expectations..."
              rows={8}
              className="input-field"
              style={{ width: "100%", lineHeight: 1.6 }}
            />
          </div>
        </div>
      )}

      {/* STEP 3: Skills */}
      {currentStep === 3 && (
        <div>
          <h3 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Required Skills & Experience</h3>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
              Technical Skills (comma-separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => handleChange("skills", e.target.value)}
              placeholder="React, Node.js, MongoDB, TypeScript, Kafka"
              className="input-field"
              style={{ width: "100%" }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
              Skills will be automatically normalized and indexed for candidate matching.
            </span>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
              Required Experience Level
            </label>
            <select
              value={formData.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
              className="input-field"
              style={{ width: "100%" }}
            >
              <option value="0-1 years (Fresher/Entry)">0-1 years (Fresher/Entry)</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5-8 years">5-8 years</option>
              <option value="8+ years (Lead/Principal)">8+ years (Lead/Principal)</option>
            </select>
          </div>
        </div>
      )}

      {/* STEP 4: Compensation & Work Mode */}
      {currentStep === 4 && (
        <div>
          <h3 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Compensation, Location & Work Mode</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                Annual Compensation (LPA)
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => handleChange("salary", e.target.value)}
                placeholder="e.g. ₹20 - ₹28 LPA"
                className="input-field"
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                Job Type
              </label>
              <select
                value={formData.jobType}
                onChange={(e) => handleChange("jobType", e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="e.g. Bangalore (Koramangala)"
                className="input-field"
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                Work Mode
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => handleChange("workMode", e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
              >
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Benefits */}
      {currentStep === 5 && (
        <div>
          <h3 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Perks & Benefits</h3>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
              Benefits Offered (comma-separated)
            </label>
            <textarea
              value={formData.benefits}
              onChange={(e) => handleChange("benefits", e.target.value)}
              placeholder="e.g. Group Health Insurance (₹7L Floater), Annual Learning Allowance, Meal Coupons, Gym Subsidy"
              rows={4}
              className="input-field"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      )}

      {/* STEP 6: Review & Publish */}
      {currentStep === 6 && (
        <div>
          <h3 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Review Position Details</h3>
          <div className="card" style={{ padding: "1.25rem", background: "var(--surface-subtle)", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{formData.title}</h2>
            <div style={{ color: "var(--primary)", fontWeight: 700, marginBottom: "0.5rem" }}>{formData.company}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              <span>📍 {formData.location} ({formData.workMode})</span>
              <span>💼 {formData.jobType} • {formData.experience}</span>
              <span>💰 {formData.salary}</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
              {formData.description}
            </p>
            <div style={{ fontSize: "0.8rem" }}>
              <strong>Required Skills:</strong> {formData.skills}
            </div>
          </div>
        </div>
      )}

      {/* Wizard Footer Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
            disabled={loading}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSubmit("DRAFT")}
                className="btn btn-secondary btn-sm"
                disabled={loading}
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("PUBLISHED")}
                className="btn btn-primary btn-sm"
                disabled={loading}
              >
                {loading ? "Publishing..." : isEditing ? "Save Changes" : "Publish Job Opening"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
