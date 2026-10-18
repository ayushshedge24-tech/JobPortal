import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { BuilderHeader } from "../../components/resume-builder/BuilderHeader";
import { BuilderWorkspace } from "../../components/resume-builder/BuilderWorkspace";
import { ImportProfileModal } from "../../components/resume-builder/ImportProfileModal";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { Button } from "../../components/ui/Button";
import { ArrowLeft } from "lucide-react";

export const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [resume, setResume] = useState(null);
  const [content, setContent] = useState({});
  const [activeSection, setActiveSection] = useState("PERSONAL");
  const [activeMobileTab, setActiveMobileTab] = useState("editor");
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  // Debounce ref for autosave
  const autosaveTimerRef = useRef(null);
  const latestContentRef = useRef(content);
  latestContentRef.current = content;

  // Fetch resume data
  const loadResume = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCandidateResume(id, token);
      if (!data) {
        throw new Error("Resume not found or you do not have permission to view it.");
      }

      setResume(data);
      setContent(data.content || {});
      setIsDirty(false);
      setLastSavedTime(new Date(data.updatedAt || Date.now()));
    } catch (err) {
      console.error("Error loading resume in builder:", err);
      setError(err.message || "Failed to load resume details.");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  // Direct Cloud Save
  const performSave = useCallback(async (contentToSave) => {
    if (!id || !token) return;
    try {
      setSaving(true);
      const payload = contentToSave || latestContentRef.current;
      const updated = await api.updateCandidateResumeContent(id, payload, token);
      if (updated) {
        setResume((prev) => ({
          ...prev,
          version: updated.version,
          updatedAt: updated.updatedAt,
        }));
        setIsDirty(false);
        setLastSavedTime(new Date());
      }
    } catch (err) {
      console.error("Autosave/Save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [id, token]);

  // Handle local content changes with 1500ms debounced autosave
  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    setIsDirty(true);

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      performSave(newContent);
    }, 1500);
  }, [performSave]);

  // Handle template change
  const handleTemplateChange = async (newTemplate) => {
    try {
      const updated = await api.updateCandidateResumeTemplate(id, newTemplate, token);
      if (updated) {
        setResume((prev) => ({
          ...prev,
          template: updated.template || newTemplate,
          version: updated.version || prev.version,
        }));
      }
    } catch (err) {
      console.error("Template update failed:", err);
    }
  };

  // Handle Snapshot Import from Profile
  const handleConfirmImport = async () => {
    try {
      setImporting(true);
      const result = await api.importCandidateProfileIntoResume(id, token);
      if (result) {
        setResume(result);
        setContent(result.content || {});
        setIsDirty(false);
        setLastSavedTime(new Date());
        setImportModalOpen(false);
      }
    } catch (err) {
      console.error("Import profile failed:", err);
      alert("Failed to import profile data: " + (err.message || "Unknown error"));
    } finally {
      setImporting(false);
    }
  };

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty && !saving) {
          if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
          performSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, saving, performSave]);

  // Browser beforeunload warning if dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [isDirty]);

  // Section selection handler
  const handleSelectSection = (sectionId) => {
    setActiveSection(sectionId);
  };

  // Zoom level handler
  const handleChangeZoom = (newZoom) => {
    setZoom(newZoom);
  };

  // Mobile tab switcher
  const handleMobileTabChange = (tab) => {
    setActiveMobileTab(tab);
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div
        className="resume-builder-loading"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 61px)",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        <div
          style={{
            padding: "var(--space-3) var(--space-6)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            <Skeleton width="90px" height="32px" borderRadius="var(--radius-md)" />
            <Skeleton width="180px" height="24px" borderRadius="var(--radius-sm)" />
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Skeleton width="110px" height="32px" borderRadius="var(--radius-md)" />
            <Skeleton width="80px" height="32px" borderRadius="var(--radius-md)" />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40% 60%",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "var(--space-6)", borderRight: "1px solid var(--border-subtle)" }}>
            <Skeleton width="120px" height="18px" style={{ marginBottom: "var(--space-4)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} width="100%" height="38px" borderRadius="var(--radius-md)" />
              ))}
            </div>
          </div>
          <div style={{ padding: "var(--space-8)", backgroundColor: "var(--bg-secondary)", display: "flex", justifyContent: "center" }}>
            <Skeleton width="210mm" height="297mm" borderRadius="var(--radius-sm)" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !resume) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 120px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-8)",
        }}
      >
        <ErrorState
          title="Resume Not Available"
          description={error || "The requested resume could not be found or access is unauthorized."}
          onRetry={loadResume}
          action={
            <Button
              variant="outline"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate("/candidate/resumes")}
              style={{ marginTop: "var(--space-4)" }}
            >
              Back to Resumes
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div
      className="resume-builder-page"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 61px)",
        backgroundColor: "var(--bg-surface)",
        overflow: "hidden",
      }}
    >
      {/* Top Builder Header */}
      <BuilderHeader
        resume={resume}
        content={content}
        isDirty={isDirty}
        saving={saving}
        onSave={() => {
          if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
          performSave();
        }}
        onImportProfile={() => setImportModalOpen(true)}
        activeMobileTab={activeMobileTab}
        onMobileTabChange={handleMobileTabChange}
      />

      {/* Main Split Workspace */}
      <BuilderWorkspace
        resume={resume}
        content={content}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onContentChange={handleContentChange}
        onTemplateChange={handleTemplateChange}
        zoom={zoom}
        onChangeZoom={handleChangeZoom}
        activeMobileTab={activeMobileTab}
      />

      {/* Master Profile Import Confirmation Modal */}
      <ImportProfileModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onConfirmImport={handleConfirmImport}
        loading={importing}
      />
    </div>
  );
};

export default ResumeBuilder;
