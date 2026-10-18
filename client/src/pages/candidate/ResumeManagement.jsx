import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../api/api";
import {
  FileText,
  Plus,
  Copy,
  Star,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Layout,
  Clock,
  Sparkles,
  Info,
  Zap,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Skeleton } from "../../components/ui/Skeleton";
import { Alert } from "../../components/ui/Alert";

const TEMPLATES = [
  {
    id: "ATS_CLASSIC",
    name: "ATS Classic",
    badge: "Legacy Compliant",
    description: "Clean single-column structure optimized for applicant tracking systems.",
  },
  {
    id: "MODERN_PROFESSIONAL",
    name: "Modern Professional",
    badge: "Tech & Product",
    description: "Balanced professional layout for modern applications and product teams.",
  },
  {
    id: "MINIMAL_EXECUTIVE",
    name: "Minimal Executive",
    badge: "Typography Focus",
    description: "Minimal typography-focused presentation tailored for senior roles.",
  },
];

const MAX_RESUMES = 5;

export const ResumeManagement = () => {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    template: "ATS_CLASSIC",
    status: "ACTIVE",
  });
  const [submitting, setSubmitting] = useState(false);

  // Load Resumes
  const fetchResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCandidateResumes(token);
      setResumes(data || []);
    } catch (err) {
      console.error("Failed to load resumes:", err);
      setError("Unable to load your resumes. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [token]);

  // Handle Create
  const handleOpenCreateModal = () => {
    if (resumes.length >= MAX_RESUMES) {
      addToast(`You have reached the maximum limit of ${MAX_RESUMES} resumes.`, "warning");
      return;
    }
    setFormData({
      title: `Resume #${resumes.length + 1}`,
      template: "ATS_CLASSIC",
      status: "ACTIVE",
    });
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      addToast("Please provide a resume title.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createCandidateResume(
        {
          title: formData.title.trim(),
          template: formData.template,
          status: formData.status,
        },
        token
      );
      addToast("Resume created successfully! 📄", "success");
      setCreateModalOpen(false);
      await fetchResumes();
    } catch (err) {
      console.error("Create resume error:", err);
      addToast(err.message || "Failed to create resume.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Metadata
  const handleOpenEditModal = (resume) => {
    setSelectedResume(resume);
    setFormData({
      title: resume.title || "",
      template: resume.template || "ATS_CLASSIC",
      status: resume.status || "ACTIVE",
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedResume) return;
    if (!formData.title.trim()) {
      addToast("Please provide a resume title.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await api.updateCandidateResume(
        selectedResume._id,
        {
          title: formData.title.trim(),
          template: formData.template,
          status: formData.status,
        },
        token
      );
      addToast("Resume updated successfully! ✓", "success");
      setEditModalOpen(false);
      await fetchResumes();
    } catch (err) {
      console.error("Update resume error:", err);
      addToast(err.message || "Failed to update resume.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Set Primary
  const handleSetPrimary = async (resume) => {
    if (resume.isPrimary) return;
    try {
      await api.setPrimaryCandidateResume(resume._id, token);
      addToast(`"${resume.title}" is now your primary resume. ★`, "success");
      await fetchResumes();
    } catch (err) {
      console.error("Set primary error:", err);
      addToast(err.message || "Failed to update primary resume.", "error");
    }
  };

  // Handle Duplicate
  const handleDuplicate = async (resume) => {
    if (resumes.length >= MAX_RESUMES) {
      addToast(`You have reached the limit of ${MAX_RESUMES} resumes. Delete one to duplicate.`, "warning");
      return;
    }
    try {
      await api.duplicateCandidateResume(resume._id, token);
      addToast(`Duplicated "${resume.title}" successfully. 📑`, "success");
      await fetchResumes();
    } catch (err) {
      console.error("Duplicate error:", err);
      addToast(err.message || "Failed to duplicate resume.", "error");
    }
  };

  // Handle Delete
  const handleOpenDeleteConfirm = (resume) => {
    setSelectedResume(resume);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedResume) return;
    try {
      await api.deleteCandidateResume(selectedResume._id, token);
      addToast("Resume deleted successfully.", "info");
      setDeleteConfirmOpen(false);
      await fetchResumes();
    } catch (err) {
      console.error("Delete error:", err);
      addToast(err.message || "Failed to delete resume.", "error");
    }
  };

  const isLimitReached = resumes.length >= MAX_RESUMES;

  const getTemplateBadge = (templateId) => {
    switch (templateId) {
      case "MODERN_PROFESSIONAL":
        return <Badge variant="primary">Modern Professional</Badge>;
      case "MINIMAL_EXECUTIVE":
        return <Badge variant="neutral">Minimal Executive</Badge>;
      case "ATS_CLASSIC":
      default:
        return <Badge variant="secondary">ATS Classic</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="warning">Draft</Badge>;
      case "ARCHIVED":
        return <Badge variant="neutral">Archived</Badge>;
      case "ACTIVE":
      default:
        return <Badge variant="success">Active</Badge>;
    }
  };

  return (
    <div className="resume-management-page" style={{ paddingBottom: "5rem" }}>
      {/* Top Banner & Header */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "2.5rem 0 2rem 0",
        }}
      >
        <div className="container" style={{ maxWidth: "1150px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <Link
                to="/candidate-dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.8rem",
                  textDecoration: "none",
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Candidate Dashboard</span>
              </Link>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                Resume Management Hub
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "600px" }}>
                Create and manage targeted resumes tailored for different roles, tech stacks, and Indian recruitment opportunities.
              </p>
            </div>

            {/* Header Right Action & Counter */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--surface)",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Layers size={16} color="var(--primary)" />
                <span>
                  {resumes.length} / {MAX_RESUMES} Resumes
                </span>
                {isLimitReached && (
                  <span className="badge badge-amber" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}>
                    Limit Reached
                  </span>
                )}
              </div>

              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                disabled={isLimitReached}
              >
                <Plus size={16} />
                <span>Create Resume</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ maxWidth: "1150px", marginTop: "2rem" }}>
        {/* Error Alert */}
        {error && (
          <Alert variant="danger" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <span>{error}</span>
              <Button size="sm" variant="ghost" onClick={fetchResumes}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Limit Warning Banner */}
        {isLimitReached && (
          <div
            className="card"
            style={{
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              background: "var(--warning-light)",
              borderColor: "var(--warning)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Info size={20} color="var(--warning)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: "0.875rem", color: "var(--text-main)" }}>
              <strong>5-Resume Limit:</strong> You have created the maximum allowed number of resumes (5/5). To create a new resume, please delete or update an existing one.
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            <Skeleton height="220px" count={3} />
          </div>
        ) : resumes.length === 0 ? (
          /* Empty State */
          <Card style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--primary-light)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem auto",
              }}
            >
              <FileText size={32} />
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Resumes Created Yet</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.75rem", lineHeight: 1.6 }}>
              Create tailored resumes for different roles (e.g. "Full-Stack Engineer", "Backend Specialist"). Your primary resume is selected by default when applying for Indian tech jobs.
            </p>
            <Button variant="primary" onClick={handleOpenCreateModal}>
              <Plus size={16} />
              <span>Create Your First Resume</span>
            </Button>
          </Card>
        ) : (
          /* Resumes Grid */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {resumes.map((resume) => {
              return (
                <Card
                  key={resume._id}
                  style={{
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    borderColor: resume.isPrimary ? "var(--primary)" : "var(--border)",
                    boxShadow: resume.isPrimary ? "0 0 0 1px var(--primary)" : "var(--shadow-sm)",
                  }}
                >
                  <div>
                    {/* Card Top Row: Badges */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                        {resume.isPrimary ? (
                          <span
                            className="badge badge-blue"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              fontWeight: 700,
                            }}
                          >
                            <Star size={12} fill="currentColor" />
                            <span>Primary Resume</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>v{resume.version || 1}</span>
                        )}
                        {getStatusBadge(resume.status)}
                      </div>

                      <div style={{ display: "flex", alignItems: "center" }}>
                        {getTemplateBadge(resume.template)}
                      </div>
                    </div>

                    {/* Resume Title */}
                    <h3
                      style={{
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "var(--text-main)",
                        marginBottom: "0.4rem",
                        wordBreak: "break-word",
                      }}
                    >
                      {resume.title}
                    </h3>

                    {/* Metadata summary */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Layout size={14} />
                        <span>
                          Layout:{" "}
                          <strong style={{ color: "var(--text-main)" }}>
                            {TEMPLATES.find((t) => t.id === resume.template)?.name || "ATS Classic"}
                          </strong>
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Clock size={14} />
                        <span>
                          Updated:{" "}
                          {resume.updatedAt
                            ? new Date(resume.updatedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Recently"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Links: Builder, Analyzer, & Skills */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "0.4rem", marginTop: "1.25rem" }}>
                    <Link
                      to={`/candidate/resumes/${resume._id}/builder`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button size="sm" variant="primary" style={{ width: "100%", justifyContent: "center", gap: "0.3rem", padding: "0.35rem 0.5rem", fontSize: "0.8rem" }}>
                        <Edit3 size={13} />
                        <span>Builder</span>
                      </Button>
                    </Link>
                    <Link
                      to={`/candidate/resumes/${resume._id}/analyze`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button size="sm" variant="outline" style={{ width: "100%", justifyContent: "center", gap: "0.3rem", padding: "0.35rem 0.5rem", fontSize: "0.8rem" }}>
                        <Sparkles size={13} style={{ color: "var(--primary)" }} />
                        <span>Analyze</span>
                      </Button>
                    </Link>
                    <Link
                      to={`/candidate/resumes/${resume._id}/skills`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button size="sm" variant="outline" style={{ width: "100%", justifyContent: "center", gap: "0.3rem", padding: "0.35rem 0.5rem", fontSize: "0.8rem" }}>
                        <Zap size={13} style={{ color: "var(--secondary)" }} />
                        <span>Skills</span>
                      </Button>
                    </Link>
                  </div>

                  {/* Actions Strip */}
                  <div
                    style={{
                      marginTop: "1rem",
                      paddingTop: "0.85rem",
                      borderTop: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenEditModal(resume)}
                        title="Edit Resume Title and Template"
                      >
                        <span>Rename / Style</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDuplicate(resume)}
                        disabled={isLimitReached}
                        title="Duplicate Resume"
                      >
                        <Copy size={14} />
                        <span>Duplicate</span>
                      </Button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      {!resume.isPrimary && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetPrimary(resume)}
                          title="Set as Primary Resume"
                          style={{ color: "var(--primary)" }}
                        >
                          <Star size={14} />
                          <span>Make Primary</span>
                        </Button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenDeleteConfirm(resume)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--danger)", padding: "0.4rem" }}
                        title="Delete Resume"
                        aria-label="Delete Resume"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE RESUME MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Resume"
        size="md"
      >
        <form onSubmit={handleCreateSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <Input
              label="Resume Title *"
              placeholder="e.g. Senior Full-Stack Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              helperText="Give this resume a distinct name to identify its target role"
              autoFocus
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Select Resume Layout
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {TEMPLATES.map((tmpl) => {
                const isSelected = formData.template === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setFormData({ ...formData, template: tmpl.id })}
                    style={{
                      border: `1.5px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                      background: isSelected ? "var(--primary-subtle)" : "var(--surface)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.85rem 1rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: isSelected ? "var(--primary)" : "var(--text-main)" }}>
                        {tmpl.name}
                      </span>
                      <span className={`badge ${isSelected ? "badge-blue" : "badge-neutral"}`} style={{ fontSize: "0.7rem" }}>
                        {tmpl.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                      {tmpl.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "DRAFT", label: "Draft" },
                { value: "ARCHIVED", label: "Archived" },
              ]}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Create Resume
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT RESUME METADATA MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Resume Metadata"
        size="md"
      >
        <form onSubmit={handleEditSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <Input
              label="Resume Title *"
              placeholder="e.g. Backend Go Specialist"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Layout Template
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {TEMPLATES.map((tmpl) => {
                const isSelected = formData.template === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setFormData({ ...formData, template: tmpl.id })}
                    style={{
                      border: `1.5px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                      background: isSelected ? "var(--primary-subtle)" : "var(--surface)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.85rem 1rem",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: isSelected ? "var(--primary)" : "var(--text-main)" }}>
                        {tmpl.name}
                      </span>
                      <span className={`badge ${isSelected ? "badge-blue" : "badge-neutral"}`} style={{ fontSize: "0.7rem" }}>
                        {tmpl.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                      {tmpl.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "DRAFT", label: "Draft" },
                { value: "ARCHIVED", label: "Archived" },
              ]}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Resume?"
        variant="danger"
        confirmText="Delete Resume"
      >
        <div style={{ fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.5 }}>
          <p style={{ marginBottom: "0.75rem" }}>
            Are you sure you want to delete <strong>"{selectedResume?.title}"</strong>? This action cannot be undone.
          </p>
          {selectedResume?.isPrimary && (
            <div
              style={{
                padding: "0.75rem",
                background: "var(--warning-light)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--warning)",
                color: "var(--text-main)",
                fontSize: "0.85rem",
              }}
            >
              ⚠️ <strong>Primary Resume Notice:</strong> This is your primary resume. Deleting it will automatically promote another resume to primary.
            </div>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
};
export default ResumeManagement;
