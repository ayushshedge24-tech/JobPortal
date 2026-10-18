import React from "react";
import { Check, CheckCheck } from "lucide-react";

export const MessageBubble = ({ message, isOwn }) => {
  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOwn ? "flex-end" : "flex-start",
        marginBottom: "0.85rem",
        padding: "0 0.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          minWidth: "120px",
          padding: "0.75rem 1rem",
          borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isOwn ? "var(--primary)" : "var(--surface-subtle)",
          color: isOwn ? "#ffffff" : "var(--text)",
          border: isOwn ? "none" : "1px solid var(--border)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          fontSize: "0.9rem",
          lineHeight: 1.5,
        }}
      >
        {message.body}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          fontSize: "0.72rem",
          color: "var(--text-muted)",
          marginTop: "0.25rem",
          padding: "0 0.25rem",
        }}
      >
        <span>{formattedTime}</span>
        {isOwn && (
          <span>
            {message.isRead ? (
              <CheckCheck size={13} color="var(--primary, #3b82f6)" title="Read" />
            ) : (
              <Check size={13} title="Delivered" />
            )}
          </span>
        )}
      </div>
    </div>
  );
};
