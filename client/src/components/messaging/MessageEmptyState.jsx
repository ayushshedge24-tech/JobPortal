import React from "react";
import { MessageSquare, Inbox } from "lucide-react";

export const MessageEmptyState = ({ title = "No conversations yet", description = "When you or a recruiter start a conversation regarding an application, it will appear here." }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        textAlign: "center",
        color: "var(--text-muted)",
        height: "100%",
        minHeight: "300px",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--surface-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
          color: "var(--primary)",
        }}
      >
        <MessageSquare size={26} />
      </div>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.4rem" }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.875rem", maxWidth: "340px", margin: 0, lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  );
};
