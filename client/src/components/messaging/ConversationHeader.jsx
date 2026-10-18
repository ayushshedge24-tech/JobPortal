import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, ArrowLeft, ExternalLink, FileText } from "lucide-react";

export const ConversationHeader = ({ conversation, isCandidate, onBack }) => {
  if (!conversation) return null;

  const otherUser = isCandidate ? conversation.recruiter : conversation.candidate;
  const otherRole = isCandidate ? "Recruiter" : "Candidate";
  const jobTitle = conversation.job?.title || "Job Position";
  const company = conversation.job?.company || "";
  const appStatus = conversation.application?.status || "Applied";

  return (
    <div
      style={{
        padding: "0.75rem 1rem",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-secondary btn-sm"
            style={{ padding: "0.4rem", borderRadius: "50%" }}
            title="Back to list"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: isCandidate ? "var(--accent, #8b5cf6)" : "var(--primary, #2563eb)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.95rem",
            flexShrink: 0,
          }}
        >
          {otherUser?.name ? otherUser.name[0].toUpperCase() : "U"}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>
              {otherUser?.name || "Participant"}
            </h4>
            <span
              className={`badge ${isCandidate ? "badge-purple" : "badge-blue"}`}
              style={{ fontSize: "0.68rem", padding: "0.1rem 0.4rem" }}
            >
              {otherRole}
            </span>
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "0.15rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <Briefcase size={12} />
            <span>{jobTitle}</span>
            {company && <span>• {company}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        <span
          className="badge badge-info"
          style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem" }}
          title="Application Status"
        >
          {appStatus}
        </span>
        {conversation.application?._id && (
          <Link
            to={
              isCandidate
                ? `/candidate/applications/${conversation.application._id}`
                : `/recruiter/applications/${conversation.application._id}`
            }
            className="btn btn-secondary btn-sm"
            style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
            title="View Application Details"
          >
            <FileText size={13} />
            <span style={{ display: "none", md: "inline" }}>Application</span>
          </Link>
        )}
      </div>
    </div>
  );
};
