import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole =
      user?.role === "jobseeker"
        ? "JOB_SEEKER"
        : user?.role === "employer"
        ? "RECRUITER"
        : user?.role;

    const normalizedAllowed = allowedRoles.map((r) =>
      r === "jobseeker" ? "JOB_SEEKER" : r === "employer" ? "RECRUITER" : r
    );

    const hasPermission =
      userRole === "ADMIN" || normalizedAllowed.includes(userRole);

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};
