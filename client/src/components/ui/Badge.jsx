import React from "react";

export const Badge = ({
  children,
  variant = "primary", // primary | success | warning | danger | info | neutral | rupee
  styleVariant = "subtle", // subtle | solid | outline
  dot = false,
  icon = null,
  className = "",
  ...props
}) => {
  let badgeClass = `badge-${styleVariant}-${variant}`;
  if (variant === "rupee") {
    badgeClass = "badge-rupee";
  }

  return (
    <span className={`badge ${badgeClass} ${className}`} {...props}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {icon && <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
