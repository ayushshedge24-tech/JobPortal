import React from "react";

export const Tabs = ({
  tabs = [], // [{ id: string, label: string, icon?: ReactNode, badge?: string|number }]
  activeTab,
  onChange,
  variant = "segmented", // segmented | underline
  className = "",
}) => {
  if (variant === "underline") {
    return (
      <div
        className={`tabs-underline ${className}`}
        style={{
          display: "flex",
          gap: "var(--space-6)",
          borderBottom: "1px solid var(--border-subtle)",
          overflowX: "auto",
        }}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              style={{
                background: "transparent",
                border: "none",
                padding: "var(--space-3) 0",
                fontSize: "var(--text-sm)",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--primary)" : "var(--text-secondary)",
                borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                whiteSpace: "nowrap",
                transition: "all var(--transition-fast)",
                marginBottom: "-1px",
              }}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    padding: "2px 6px",
                    borderRadius: "var(--radius-full)",
                    background: isActive ? "var(--primary-subtle)" : "var(--bg-subtle)",
                    color: isActive ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`tabs-segmented ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`tab-btn ${isActive ? "active" : ""}`}
          >
            {tab.icon && <span style={{ display: "inline-flex", alignItems: "center" }}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: "0.7rem",
                  padding: "1px 5px",
                  borderRadius: "var(--radius-full)",
                  background: isActive ? "var(--primary-subtle)" : "var(--bg-muted)",
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: 700,
                  marginLeft: "4px",
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
