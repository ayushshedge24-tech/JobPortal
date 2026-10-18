import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "../components/ui/Button";

export const UnauthorizedPage = () => {
  return (
    <div className="section flex-center" style={{ minHeight: "75vh" }}>
      <div className="container" style={{ maxWidth: "520px", textAlign: "center" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: "var(--danger-subtle)",
            color: "var(--danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-4) auto",
          }}
        >
          <ShieldAlert size={38} />
        </div>

        <span
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "var(--danger)",
            textTransform: "uppercase",
            marginBottom: "var(--space-2)",
            display: "block",
          }}
        >
          Access Restricted (403)
        </span>

        <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-2)" }}>
          Unauthorized Access
        </h1>

        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "var(--space-6)",
          }}
        >
          You do not have the required permissions to view this workspace. If you believe this is a mistake, please sign in with an authorized account or contact your team administrator.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <Link to="/">
            <Button variant="secondary" startIcon={<Home size={16} />}>
              Return Home
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="primary" startIcon={<ArrowLeft size={16} />}>
              Sign In with Another Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
