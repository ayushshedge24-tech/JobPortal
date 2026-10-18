import React from "react";

export const AdminStatCard = ({ title, value, subtitle, icon: Icon, color = "var(--primary)", bg = "var(--primary-light)" }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ background: bg, color }}>
        {Icon && <Icon size={22} />}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
        {subtitle && (
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
