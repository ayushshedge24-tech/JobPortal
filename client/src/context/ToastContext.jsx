import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = "info", title, message, duration = 4000 }) => {
      const id = "toast-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);
      const newToast = { id, type, title, message };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (message, title = "Success") => addToast({ type: "success", title, message }),
    error: (message, title = "Error") => addToast({ type: "error", title, message }),
    warning: (message, title = "Warning") => addToast({ type: "warning", title, message }),
    info: (message, title = "Info") => addToast({ type: "info", title, message }),
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={18} color="var(--success)" />;
      case "error":
        return <AlertCircle size={18} color="var(--danger)" />;
      case "warning":
        return <AlertTriangle size={18} color="var(--warning)" />;
      case "info":
      default:
        return <Info size={18} color="var(--info)" />;
    }
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Fixed Toast Container */}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: "var(--z-toast)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          maxWidth: "380px",
          width: "100%",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: "auto",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "0.85rem 1rem",
              boxShadow: "var(--shadow-lg)",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              animation: "slideInRight 200ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div style={{ marginTop: "2px" }}>{getIcon(t.type)}</div>
            <div style={{ flex: 1 }}>
              {t.title && (
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.15rem" }}>
                  {t.title}
                </div>
              )}
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                {t.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
};
