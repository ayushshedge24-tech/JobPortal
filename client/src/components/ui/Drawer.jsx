import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react";

export const Drawer = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "480px",
}) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="drawer-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="drawer-content" style={{ maxWidth }}>
        <div className="modal-header">
          <div>
            {title && (
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>{title}</h2>
            )}
            {description && (
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon btn-sm"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: "auto" }}>
          {children}
        </div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
