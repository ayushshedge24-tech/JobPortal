import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught render error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: "var(--background)",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              width: "100%",
              padding: "2rem",
              background: "var(--surface)",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.1)",
                color: "var(--danger, #ef4444)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem auto",
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
              Something Went Wrong
            </h2>

            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              An unexpected display error occurred while rendering this page. You can reload the page or return home.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={this.handleReset}
                className="btn btn-primary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <RefreshCw size={15} />
                <span>Reload Page</span>
              </button>
              <a
                href="/"
                className="btn btn-secondary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Home size={15} />
                <span>Go to Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
