import React from "react";
import { X, ShieldAlert, Clock, User, Tag } from "lucide-react";

export const AuditLogDrawer = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        maxWidth: "500px",
        background: "var(--surface)",
        boxShadow: "-10px 0 30px rgba(0,0,0,0.25)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        padding: "1.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldAlert size={20} color="var(--primary)" />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Audit Event Inspection</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary btn-sm"
          style={{ padding: "0.4rem" }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>ACTION</div>
          <span className="badge badge-blue" style={{ marginTop: "0.25rem" }}>{log.action}</span>
        </div>

        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>SUMMARY</div>
          <p style={{ marginTop: "0.25rem", color: "var(--text-main)", fontWeight: 600 }}>{log.summary}</p>
        </div>

        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>PERFORMED BY (ACTOR)</div>
          <div style={{ marginTop: "0.25rem" }}>
            <strong>{log.actorName}</strong> ({log.actorEmail || "N/A"}) • Role: {log.actorRole}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>ENTITY</div>
          <div style={{ marginTop: "0.25rem" }}>
            Type: <strong>{log.entityType}</strong> | ID: <code>{log.entityId || "N/A"}</code>
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>TIMESTAMP</div>
          <div style={{ marginTop: "0.25rem" }}>
            {log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN") : "Recent"}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, marginBottom: "0.4rem" }}>STRUCTURED METADATA</div>
          <pre
            style={{
              background: "var(--surface-subtle)",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.75rem",
              overflowX: "auto",
              fontFamily: "monospace",
              color: "var(--text-main)",
            }}
          >
            {JSON.stringify(log.metadata || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
