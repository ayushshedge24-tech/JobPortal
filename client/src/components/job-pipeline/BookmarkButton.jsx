import React, { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../api/api";

export const BookmarkButton = ({ jobId, initialSaved = false, onToggle, size = "md", showLabel = false }) => {
  const { token, isAuthenticated } = useAuth();
  const toast = useToast();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please sign in to bookmark jobs to your candidate workstation.");
      return;
    }

    if (!jobId || loading) return;

    setLoading(true);
    try {
      if (isSaved) {
        await api.unsaveJob(jobId, token);
        setIsSaved(false);
        toast.success("Job removed from saved bookmarks.");
        if (onToggle) onToggle(false);
      } else {
        await api.saveJob(jobId, token);
        setIsSaved(true);
        toast.success("Job bookmarked to your saved list.");
        if (onToggle) onToggle(true);
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
      toast.error(err.message || "Failed to update saved job status.");
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;
  const padding = size === "sm" ? "0.3rem 0.5rem" : size === "lg" ? "0.6rem 1rem" : "0.45rem 0.75rem";
  const fontSize = size === "sm" ? "0.75rem" : "0.85rem";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className="btn btn-secondary"
      title={isSaved ? "Remove from saved jobs" : "Save this job"}
      style={{
        padding,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        fontSize,
        color: isSaved ? "var(--primary)" : "var(--text-secondary)",
        borderColor: isSaved ? "var(--primary-subtle)" : "var(--border)",
        background: isSaved ? "var(--primary-subtle)" : "var(--surface)",
        cursor: loading ? "wait" : "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck size={iconSize} color="var(--primary)" />
      ) : (
        <Bookmark size={iconSize} />
      )}
      {showLabel && (
        <span style={{ fontWeight: 600 }}>
          {isSaved ? "Saved" : "Save Job"}
        </span>
      )}
    </button>
  );
};
