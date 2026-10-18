import React, { useState } from "react";
import { Briefcase, Check } from "lucide-react";

export const JobModerationModal = ({ job, onClose, onConfirm, loading = false }) => {
  const [selectedStatus, setSelectedStatus] = useState(job?.status || "PUBLISHED");
  const [note, setNote] = useState("");

  if (!job) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div className="card" style={{ maxWidth: "460px", width: "100%", padding: "1.75rem" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "0.25rem" }}>
          Moderate Job Status
        </h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          {job.title} at {job.company}
        </p>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
            Select Status
          </label>
          {["PUBLISHED", "DRAFT", "CLOSED", "ARCHIVED"].map((st) => (
            <label
              key={st}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                marginBottom: "0.35rem",
                cursor: "pointer",
                background: selectedStatus === st ? "var(--surface-subtle)" : "transparent",
                fontWeight: selectedStatus === st ? 700 : 500,
                fontSize: "0.85rem",
              }}
            >
              <input
                type="radio"
                name="jobStatus"
                value={st}
                checked={selectedStatus === st}
                onChange={() => setSelectedStatus(st)}
              />
              <span>{st}</span>
            </label>
          ))}
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
            Moderation Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="e.g. Approved listing after compliance verification"
            className="input-field"
            style={{ width: "100%", fontSize: "0.85rem" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(job._id, selectedStatus, note)}
            className="btn btn-primary btn-sm"
            disabled={loading || selectedStatus === job.status}
          >
            {loading ? "Updating..." : "Save Moderation"}
          </button>
        </div>
      </div>
    </div>
  );
};
