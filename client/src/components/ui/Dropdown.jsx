import React, { useState, useRef, useEffect } from "react";

export const Dropdown = ({
  trigger,
  children,
  align = "right", // left | right
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`dropdown-wrapper ${className}`}
      style={{ position: "relative", display: "inline-block" }}
    >
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ cursor: "pointer", display: "inline-flex" }}
      >
        {typeof trigger === "function" ? trigger({ isOpen }) : trigger}
      </div>

      {isOpen && (
        <div
          className="dropdown-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            [align]: 0,
            zIndex: "var(--z-popover)",
            minWidth: "200px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)",
            padding: "var(--space-2)",
            animation: "scaleUp 150ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  icon,
  children,
  onClick,
  danger = false,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dropdown-item ${className}`}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-2) var(--space-3)",
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        color: danger ? "var(--danger)" : "var(--text-primary)",
        backgroundColor: "transparent",
        border: "none",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        textAlign: "left",
        transition: "background-color var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = danger
          ? "var(--danger-subtle)"
          : "var(--bg-subtle)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {icon && <span style={{ display: "inline-flex", color: "currentColor" }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
