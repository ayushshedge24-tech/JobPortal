import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { NotificationPopover } from "./NotificationPopover";

export const NotificationBell = () => {
  const { token, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const fetchUnreadAndRecent = async () => {
    if (!token || !isAuthenticated) return;
    try {
      const [countRes, listRes] = await Promise.all([
        api.getUnreadNotificationCount(token),
        api.getNotifications({ limit: 5 }, token),
      ]);
      setUnreadCount(countRes?.data?.unreadCount || countRes?.unreadCount || 0);
      setNotifications(listRes?.data?.notifications || listRes?.notifications || []);
    } catch (err) {
      console.warn("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchUnreadAndRecent();
    // Lightweight polling every 60 seconds
    const interval = setInterval(fetchUnreadAndRecent, 60000);
    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead(token);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationAsRead(id, token);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary btn-sm"
        title="Notifications"
        style={{
          position: "relative",
          padding: "0.45rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "var(--danger)",
              color: "white",
              fontSize: "0.65rem",
              fontWeight: 800,
              minWidth: "16px",
              height: "16px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 2px",
              border: "2px solid var(--surface)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPopover
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllRead}
          onMarkRead={handleMarkRead}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
