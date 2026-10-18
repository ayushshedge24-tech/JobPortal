import React, { useState } from "react";
import { AlertCircle, UserX, UserCheck } from "lucide-react";

export const UserStatusModal = ({ user, onClose, onConfirm, loading = false }) => {
  const [reason, setReason] = useState("");
  if (!user) return null;

  const willActivate = user.isActive === false;

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
      <div className="card" style={{ maxWidth: "440px", width: "100%", padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: willActivate ? "var(--success-light)" : "var(--danger-light)",
              color: willActivate ? "var(--success)" : "var(--danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {willActivate ? <UserCheck size={20} /> : <UserX size={20} />}
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
              {willActivate ? "Reactivate User Account" : "Deactivate User Account"}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{user.name} ({user.email})</p>
          </div>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.5 }}>
          {willActivate
            ? "Reactivating this account will restore sign-in privileges for this user."
            : "Deactivating this account will immediately block the user from signing in and revoke active sessions."}
        </p>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
            Administrative Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="e.g. Terms violation, requested deactivation, compliance check..."
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
            onClick={() => onConfirm(user._id, willActivate, reason)}
            className={`btn btn-sm ${willActivate ? "btn-primary" : "btn-secondary"}`}
            style={!willActivate ? { color: "var(--danger)", borderColor: "var(--danger)" } : {}}
            disabled={loading}
          >
            {loading ? "Processing..." : willActivate ? "Confirm Activation" : "Confirm Deactivation"}
          </button>
        </div>
      </div>
    </div>
  );
};
