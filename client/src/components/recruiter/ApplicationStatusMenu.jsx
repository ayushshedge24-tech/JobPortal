import React, { useState } from "react";
import { ChevronDown, Check, AlertCircle } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "APPLIED", label: "Applied", badgeClass: "badge-blue" },
  { value: "UNDER_REVIEW", label: "Under Review", badgeClass: "badge-amber" },
  { value: "SHORTLISTED", label: "Shortlisted", badgeClass: "badge-purple" },
  { value: "INTERVIEW", label: "Interview", badgeClass: "badge-indigo" },
  { value: "OFFER", label: "Offer", badgeClass: "badge-green" },
  { value: "REJECTED", label: "Rejected", badgeClass: "badge-red" },
];

export const ApplicationStatusMenu = ({ currentStatus, onStatusChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const currentOption = STATUS_OPTIONS.find((s) => s.value === currentStatus) || {
    value: currentStatus || "APPLIED",
    label: currentStatus || "Applied",
    badgeClass: "badge-blue",
  };

  const handleSelect = (status) => {
    setIsOpen(false);
    if (status.value === currentStatus) return;
    setTargetStatus(status);
    setShowNoteModal(true);
  };

  const handleConfirm = async () => {
    if (!targetStatus) return;
    setLoading(true);
    try {
      await onStatusChange(targetStatus.value, note);
      setShowNoteModal(false);
      setNote("");
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setIsOpen(!isOpen)}
        className={`badge ${currentOption.badgeClass}`}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.35rem 0.65rem",
          fontSize: "0.75rem",
          fontWeight: 700,
          border: "none",
        }}
        title="Change application status"
      >
        <span>{currentOption.label}</span>
        <ChevronDown size={12} />
      </button>

      {isOpen && (
        <>
          <div
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            className="card"
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "0.25rem",
              zIndex: 100,
              minWidth: "160px",
              padding: "0.35rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          >
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => handleSelect(status)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: status.value === currentStatus ? "var(--surface-subtle)" : "transparent",
                  border: "none",
                  padding: "0.45rem 0.65rem",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--text-main)",
                }}
              >
                <span>{status.label}</span>
                {status.value === currentStatus && <Check size={14} color="var(--primary)" />}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Confirmation & Note Modal */}
      {showNoteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div className="card" style={{ maxWidth: "440px", width: "100%", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Move Candidate to <span style={{ color: "var(--primary)" }}>{targetStatus?.label}</span>
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              This will update the applicant's status, add a milestone to their timeline, and send a live candidate notification.
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                Status Change Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Cleared round 1 technical screen, scheduling manager interview..."
                rows={3}
                className="input-field"
                style={{ width: "100%", fontSize: "0.85rem" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => {
                  setShowNoteModal(false);
                  setNote("");
                }}
                className="btn btn-secondary btn-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="btn btn-primary btn-sm"
                disabled={loading}
              >
                {loading ? "Updating..." : "Confirm Transition"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
