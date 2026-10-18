import React from "react";
import { Card } from "../ui/Card";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Clock,
  Laptop,
  MapPin,
  FolderGit2,
} from "lucide-react";

const FACTOR_ICONS = {
  REQUIRED_SKILL_MATCH: Layers,
  PREFERRED_SKILL_MATCH: Sparkles,
  EXPERIENCE_ALIGNMENT: Clock,
  WORK_MODE_ALIGNMENT: Laptop,
  LOCATION_ALIGNMENT: MapPin,
  CATEGORY_ALIGNMENT: FolderGit2,
};

export const MatchFactorCard = ({ factor }) => {
  if (!factor) return null;

  const IconComponent = FACTOR_ICONS[factor.factorType] || Layers;

  const getStatusBadge = () => {
    if (factor.alignment) {
      switch (factor.alignment) {
        case "WITHIN_RANGE":
          return <span className="badge badge-green">✓ Within Stated Range</span>;
        case "ABOVE_RANGE":
          return <span className="badge badge-blue">★ Exceeds Guideline</span>;
        case "BELOW_RANGE":
          return <span className="badge badge-red">✕ Below Stated Minimum</span>;
        case "NOT_EVALUATED":
        default:
          return <span className="badge badge-neutral">Not Evaluated</span>;
      }
    }

    switch (factor.status) {
      case "MATCHED":
        return <span className="badge badge-green">✓ Aligned</span>;
      case "PARTIAL":
        return <span className="badge badge-amber">⚠ Partially Aligned</span>;
      case "NOT_MATCHED":
        return <span className="badge badge-red">✕ Gap Detected</span>;
      case "NOT_EVALUATED":
      default:
        return <span className="badge badge-neutral">Not Evaluated</span>;
    }
  };

  const getBorderColor = () => {
    if (factor.status === "MATCHED" || factor.alignment === "WITHIN_RANGE" || factor.alignment === "ABOVE_RANGE") {
      return "rgba(16, 185, 129, 0.4)";
    }
    if (factor.status === "PARTIAL") {
      return "rgba(245, 158, 11, 0.4)";
    }
    if (factor.status === "NOT_MATCHED" || factor.alignment === "BELOW_RANGE") {
      return "rgba(239, 68, 68, 0.3)";
    }
    return "var(--border)";
  };

  return (
    <Card
      style={{
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderLeft: `4px solid ${getBorderColor()}`,
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-sm)",
                background: "var(--surface-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <IconComponent size={16} />
            </div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
              {factor.label || "Factor"}
            </h4>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, margin: "0.5rem 0 0 0" }}>
          {factor.reason}
        </p>
      </div>
    </Card>
  );
};
