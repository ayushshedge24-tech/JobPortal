import React from "react";
import { CheckCircle2, Clock, FileCheck, Award, XCircle, AlertCircle, Calendar } from "lucide-react";

export const ApplicationTimeline = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  const getEventIcon = (status) => {
    switch (status) {
      case "OFFER":
        return <Award size={16} color="var(--success)" />;
      case "SHORTLISTED":
        return <CheckCircle2 size={16} color="var(--warning)" />;
      case "INTERVIEW":
        return <Calendar size={16} color="var(--primary)" />;
      case "REJECTED":
        return <XCircle size={16} color="var(--danger)" />;
      case "WITHDRAWN":
        return <AlertCircle size={16} color="var(--text-muted)" />;
      case "UNDER_REVIEW":
        return <Clock size={16} color="var(--accent)" />;
      case "APPLIED":
      default:
        return <FileCheck size={16} color="var(--primary)" />;
    }
  };

  return (
    <div className="application-timeline" style={{ position: "relative", paddingLeft: "1.5rem" }}>
      {/* Vertical Track */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          bottom: "8px",
          left: "8px",
          width: "2px",
          background: "var(--border)",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {timeline.map((event, idx) => {
          const isLatest = idx === timeline.length - 1;
          return (
            <div key={idx} style={{ position: "relative" }}>
              {/* Timeline Bullet Node */}
              <div
                style={{
                  position: "absolute",
                  left: "-1.5rem",
                  top: "2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "var(--surface)",
                  border: `2px solid ${isLatest ? "var(--primary)" : "var(--border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}>
                    {event.label}
                  </span>
                  {isLatest && (
                    <span className="badge badge-blue" style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}>
                      Current Status
                    </span>
                  )}
                </div>

                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
                  {event.timestamp
                    ? new Date(event.timestamp).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recorded Date"}
                </div>

                {event.note && (
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0, lineHeight: 1.4 }}>
                    {event.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
