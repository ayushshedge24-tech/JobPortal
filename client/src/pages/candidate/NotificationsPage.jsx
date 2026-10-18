import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../api/api";
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Sparkles,
  Briefcase,
  BellOff,
  Filter,
} from "lucide-react";
import { NotificationItem } from "../../components/notifications/NotificationItem";
import { NotificationFilters } from "../../components/notifications/NotificationFilters";
import { DiscoveryPagination } from "../../components/job-discovery/DiscoveryPagination";
import { DiscoverySkeleton } from "../../components/job-discovery/DiscoverySkeleton";
import { Alert } from "../../components/ui/Alert";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export const NotificationsPage = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    notifications: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    unreadCount: 0,
  });

  const [activeFilter, setActiveFilter] = useState("ALL");
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const fetchNotifications = async (page = 1, filterType = "ALL") => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20 };
      if (filterType === "UNREAD") {
        params.isRead = false;
      } else if (filterType === "APPLICATIONS") {
        params.type = "APPLICATION_STATUS_CHANGED";
      } else if (filterType === "SAVED") {
        params.type = "JOB_SAVED";
      }

      const res = await api.getNotifications(params, token);
      setData(res?.data || res || { notifications: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 }, unreadCount: 0 });
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(currentPage, activeFilter);
  }, [currentPage, activeFilter, token]);

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
    setSearchParams(new URLSearchParams({ page: "1" }));
  };

  const handlePageChange = (newPage) => {
    setSearchParams(new URLSearchParams({ page: String(newPage) }));
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead(token);
      toast.success("All notifications marked as read.");
      fetchNotifications(currentPage, activeFilter);
    } catch (err) {
      console.error("Failed to mark all read:", err);
      toast.error(err.message || "Failed to mark notifications read.");
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationAsRead(id, token);
      setData((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
        notifications: prev.notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      }));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const notifications = data.notifications || [];
  const pagination = data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };
  const unreadCount = data.unreadCount || 0;

  return (
    <div className="notifications-page" style={{ paddingBottom: "5rem" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "2.5rem 0 2rem 0",
        }}
      >
        <div className="container" style={{ maxWidth: "860px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span className="badge badge-purple" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <Bell size={12} />
                  <span>Communication Center</span>
                </span>
                {unreadCount > 0 ? (
                  <span className="badge badge-blue" style={{ fontSize: "0.75rem" }}>
                    {unreadCount} Unread Notifications
                  </span>
                ) : (
                  <span className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>
                    All Caught Up
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                Platform Notifications
              </h1>

              <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", maxWidth: "600px", lineHeight: 1.5, margin: 0 }}>
                Verified status updates, application receipts, and activity milestones from your job search workflow.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              {unreadCount > 0 && (
                <Button variant="secondary" size="sm" onClick={handleMarkAllRead} startIcon={<CheckCheck size={14} />}>
                  Mark All Read
                </Button>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fetchNotifications(currentPage, activeFilter)}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ maxWidth: "860px", marginTop: "2rem" }}>
        {error && (
          <Alert variant="danger" style={{ marginBottom: "1.5rem" }}>
            <span>{error}</span>
          </Alert>
        )}

        {/* Filter Tabs */}
        <div style={{ marginBottom: "1.25rem" }}>
          <NotificationFilters
            activeFilter={activeFilter}
            onChange={handleFilterChange}
            unreadCount={unreadCount}
          />
        </div>

        {/* Notifications Container */}
        {loading ? (
          <DiscoverySkeleton />
        ) : notifications.length > 0 ? (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {notifications.map((notif) => (
              <NotificationItem
                key={notif._id}
                notification={notif}
                onMarkRead={handleMarkRead}
              />
            ))}

            {pagination.totalPages > 1 && (
              <div style={{ padding: "1rem" }}>
                <DiscoveryPagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </Card>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 1.5rem",
              background: "var(--surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed var(--border)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--surface-subtle)",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem auto",
              }}
            >
              <BellOff size={28} />
            </div>

            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.4rem", color: "var(--text-main)" }}>
              No Notifications Found
            </h3>

            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxWidth: "420px", margin: "0 auto 1.5rem auto", lineHeight: 1.5 }}>
              {activeFilter === "UNREAD"
                ? "You have zero unread notifications. All your platform updates have been reviewed."
                : "When you apply to jobs, bookmark openings, or receive status updates, your alerts will show here."}
            </p>

            <Link to="/candidate/applications">
              <Button variant="secondary" size="md">
                View My Applications Pipeline
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
