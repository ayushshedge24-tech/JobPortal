import React, { useState } from "react";
import { Shield, AlertTriangle, Check, X } from "lucide-react";

export const RoleChangeModal = ({ user, onClose, onConfirm, loading = false }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || "JOB_SEEKER");

  if (!user) return null;

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
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--warning-light)", color: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Modify User System Role</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{user.name} ({user.email})</p>
          </div>
        </div>

        <div style={{ background: "var(--surface-subtle)", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", gap: "0.5rem" }}>
          <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0 }} />
          <span>
            Changing a user's role grants or restricts access across Candidate and Recruiter consoles. This event is recorded to the audit log.
          </span>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Select Target Role
          </label>
          {["JOB_SEEKER", "RECRUITER", "ADMIN"].map((r) => (
            <label
              key={r}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 0.75rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                marginBottom: "0.4rem",
                cursor: "pointer",
                background: selectedRole === r ? "var(--surface-subtle)" : "transparent",
                fontWeight: selectedRole === r ? 700 : 500,
                fontSize: "0.85rem",
              }}
            >
              <input
                type="radio"
                name="roleOption"
                value={r}
                checked={selectedRole === r}
                onChange={() => setSelectedRole(r)}
              />
              <span>{r === "JOB_SEEKER" ? "Candidate (JOB_SEEKER)" : r === "RECRUITER" ? "Recruiter (RECRUITER)" : "Platform Administrator (ADMIN)"}</span>
            </label>
          ))}
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
            onClick={() => onConfirm(user._id, selectedRole)}
            className="btn btn-primary btn-sm"
            disabled={loading || selectedRole === user.role}
          >
            {loading ? "Updating Role..." : "Confirm Role Change"}
          </button>
        </div>
      </div>
    </div>
  );
};
