import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable Button component with multiple variants, sizes, and states.
 */
export const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary", // primary | secondary | outline | ghost | danger | success | link
      size = "md", // sm | md | lg | icon
      loading = false,
      disabled = false,
      startIcon = null,
      endIcon = null,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={`btn ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 size={size === "sm" ? 14 : size === "lg" ? 20 : 16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          startIcon
        )}
        {children && <span>{children}</span>}
        {!loading && endIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
