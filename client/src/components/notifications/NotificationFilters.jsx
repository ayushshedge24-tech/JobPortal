import React from "react";

export const NotificationFilters = ({ activeFilter, onChange, unreadCount = 0 }) => {
  const tabs = [
    { key: "ALL", label: "All" },
    { key: "UNREAD", label: `Unread (${unreadCount})` },
    { key: "APPLICATIONS", label: "Applications" },
    { key: "SAVED", label: "Saved Jobs" },
  ];

  return (
    <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "white" : "var(--text-secondary)",
              background: isActive ? "var(--primary)" : "var(--surface)",
              border: `1px solid ${isActive ? "var(--primary)" : "var(--border)"}`,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
