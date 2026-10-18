import React from "react";
import { Link } from "react-router-dom";
import { CheckCheck, ExternalLink, BellOff } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { Card } from "../ui/Card";

export const NotificationPopover = ({ notifications = [], unreadCount = 0, onMarkAllRead, onMarkRead, onClose }) => {
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: "calc(100% + 8px)",
        width: "360px",
        maxHeight: "480px",
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        border: "1px solid var(--border)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}>Notifications</span>
          {unreadCount > 0 && (
            <span className="badge badge-blue" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}>
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="btn btn-link btn-sm"
            style={{ fontSize: "0.75rem", padding: 0, display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--primary)" }}
          >
            <CheckCheck size={13} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "360px" }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
            <BellOff size={24} style={{ margin: "0 auto 0.5rem auto", opacity: 0.5 }} />
            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>All caught up!</div>
            <div style={{ fontSize: "0.75rem" }}>No new platform notifications</div>
          </div>
        ) : (
          notifications.slice(0, 5).map((notif) => (
            <NotificationItem
              key={notif._id}
              notification={notif}
              onMarkRead={onMarkRead}
              inPopover={true}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "0.6rem 1rem",
          borderTop: "1px solid var(--border)",
          background: "var(--surface-subtle)",
          textAlign: "center",
        }}
      >
        <Link
          to="/candidate/notifications"
          onClick={onClose}
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--primary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <span>View all notifications</span>
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
};
