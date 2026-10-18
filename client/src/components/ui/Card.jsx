import React from "react";

export const Card = ({
  children,
  variant = "default", // default | elevated | interactive | outlined
  className = "",
  onClick,
  ...props
}) => {
  const variantClass = variant !== "default" ? `card-${variant}` : "";

  return (
    <div
      className={`card ${variantClass} ${className}`}
      onClick={onClick}
      role={variant === "interactive" ? "button" : undefined}
      tabIndex={variant === "interactive" ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, as: Tag = "h3", className = "", ...props }) => (
  <Tag className={`card-title ${className}`} {...props}>
    {children}
  </Tag>
);

export const CardDescription = ({ children, className = "", ...props }) => (
  <p className={`card-description ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "", ...props }) => (
  <div className={`card-content ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = "", ...props }) => (
  <div
    className={`card-footer ${className}`}
    style={{
      marginTop: "var(--space-4)",
      paddingTop: "var(--space-4)",
      borderTop: "1px solid var(--border-subtle)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
    {...props}
  >
    {children}
  </div>
);
