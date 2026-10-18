import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileCheck,
  Activity,
  RotateCcw,
  Bookmark,
  UserCircle,
  Award,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const NotificationItem = ({ notification, onMarkRead, inPopover = false }) => {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case "APPLICATION_STATUS_CHANGED":
        return <Activity size={16} color="var(--primary)" />;
      case "APPLICATION_WITHDRAWN":
        return <RotateCcw size={16} color="var(--warning)" />;
      case "JOB_SAVED":
        return <Bookmark size={16} color="var(--accent)" />;
      case "PROFILE_INCOMPLETE":
        return <UserCircle size={16} color="var(--primary)" />;
      case "RESUME_ANALYSIS_READY":
        return <Award size={16} color="var(--success)" />;
      case "APPLICATION_SUBMITTED":
      default:
        return <FileCheck size={16} color="var(--success)" />;
    }
  };

  const getTargetUrl = () => {
    switch (notification.entityType) {
      case "APPLICATION":
        return notification.entityId ? `/candidate/applications/${notification.entityId}` : "/candidate/applications";
      case "JOB":
        return notification.entityId ? `/jobs/${notification.entityId}` : "/candidate/jobs/saved";
      case "PROFILE":
        return "/candidate/profile";
      case "RESUME":
        return notification.entityId ? `/candidate/resumes/${notification.entityId}/analyze` : "/candidate/resumes";
      default:
        return null;
    }
  };

  const handleClick = (e) => {
    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification._id);
    }
    const target = getTargetUrl();
    if (target) {
      navigate(target);
    }
  };

  const formattedDate = notification.createdAt
    ? new Date(notification.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently";

  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: inPopover ? "0.75rem" : "1rem",
        background: notification.isRead ? "transparent" : "var(--surface-subtle)",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        transition: "background 0.15s ease",
      }}
      className="notification-item"
    >
      {/* Icon Node */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {getIcon(notification.type)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
          <span style={{ fontWeight: notification.isRead ? 600 : 700, fontSize: "0.875rem", color: "var(--text-main)" }}>
            {notification.title}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            {formattedDate}
          </span>
        </div>

        <p
          style={{
            margin: "0.2rem 0 0 0",
            fontSize: "0.825rem",
            color: "var(--text-secondary)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: inPopover ? 2 : 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {notification.message}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--primary)",
            marginTop: "0.4rem",
            flexShrink: 0,
          }}
          title="Unread"
        />
      )}
    </div>
  );
};
