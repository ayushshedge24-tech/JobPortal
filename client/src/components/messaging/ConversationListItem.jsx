import React from "react";
import { Briefcase } from "lucide-react";

export const ConversationListItem = ({ conversation, isSelected, isCandidate, onClick }) => {
  const otherUser = isCandidate ? conversation.recruiter : conversation.candidate;
  const otherRole = isCandidate ? "Recruiter" : "Candidate";
  const jobTitle = conversation.job?.title || "Job Position";
  const company = conversation.job?.company || "";
  const lastMsgText = conversation.lastMessage?.text || "No messages yet";
  const unread = conversation.unreadCount || 0;

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div
      onClick={onClick}
      style={{
        padding: "0.85rem 1rem",
        cursor: "pointer",
        background: isSelected ? "var(--surface-subtle)" : "transparent",
        borderLeft: isSelected ? "3px solid var(--primary)" : "3px solid transparent",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.15s ease",
        display: "flex",
        gap: "0.75rem",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
          <span
            style={{
              fontWeight: unread > 0 ? 700 : 600,
              fontSize: "0.9rem",
              color: "var(--text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {otherUser?.name || "Participant"}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", flexShrink: 0 }}>
            {formatTimestamp(conversation.lastMessageAt || conversation.updatedAt)}
          </span>
        </div>

        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--primary)",
            marginBottom: "0.25rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {jobTitle} {company ? `• ${company}` : ""}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.82rem",
              color: unread > 0 ? "var(--text)" : "var(--text-muted)",
              fontWeight: unread > 0 ? 600 : 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "180px",
            }}
          >
            {lastMsgText}
          </p>
          {unread > 0 && (
            <span
              style={{
                background: "var(--primary)",
                color: "#ffffff",
                fontSize: "0.7rem",
                fontWeight: 700,
                borderRadius: "10px",
                padding: "0.1rem 0.45rem",
                flexShrink: 0,
              }}
            >
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
