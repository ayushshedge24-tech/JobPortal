import React from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
  Calendar,
  Award,
  AlertCircle,
} from "lucide-react";

export const ApplicationStatusBadge = ({ status, size = "md" }) => {
  const norm = (status || "APPLIED").toUpperCase().replace(/\s+/g, "_");

  const getConfig = () => {
    switch (norm) {
      case "UNDER_REVIEW":
        return {
          label: "Under Review",
          variant: "badge-purple",
          icon: <Clock size={12} />,
        };
      case "SHORTLISTED":
        return {
          label: "Shortlisted",
          variant: "badge-amber",
          icon: <CheckCircle2 size={12} />,
        };
      case "INTERVIEW":
        return {
          label: "Interview Stage",
          variant: "badge-blue",
          icon: <Calendar size={12} />,
        };
      case "OFFER":
        return {
          label: "Offer Extended",
          variant: "badge-green",
          icon: <Award size={12} />,
        };
      case "REJECTED":
        return {
          label: "Application Closed",
          variant: "badge-red",
          icon: <XCircle size={12} />,
        };
      case "WITHDRAWN":
        return {
          label: "Withdrawn",
          variant: "badge-neutral",
          icon: <AlertCircle size={12} />,
        };
      case "APPLIED":
      default:
        return {
          label: "Application Submitted",
          variant: "badge-blue",
          icon: <FileCheck size={12} />,
        };
    }
  };

  const { label, variant, icon } = getConfig();
  const fontSize = size === "sm" ? "0.7rem" : size === "lg" ? "0.85rem" : "0.75rem";
  const padding = size === "sm" ? "0.15rem 0.4rem" : size === "lg" ? "0.35rem 0.75rem" : "0.2rem 0.55rem";

  return (
    <span
      className={`badge ${variant}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize,
        padding,
        fontWeight: 600,
      }}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
