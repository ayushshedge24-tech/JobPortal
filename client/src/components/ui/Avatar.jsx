import React, { useState } from "react";

export const Avatar = ({
  name = "User",
  src = null,
  size = "md", // sm (32px) | md (40px) | lg (48px) | xl (64px)
  status = null, // online | busy | offline
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (n) => {
    if (!n) return "U";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const getSizePx = () => {
    switch (size) {
      case "sm":
        return 32;
      case "lg":
        return 48;
      case "xl":
        return 64;
      case "md":
      default:
        return 40;
    }
  };

  const sizePx = getSizePx();
  const initials = getInitials(name);

  return (
    <div
      className={`avatar-container ${className}`}
      style={{
        position: "relative",
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        flexShrink: 0,
      }}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            border: "1px solid var(--border-subtle)",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: "var(--primary-subtle)",
            color: "var(--primary)",
            fontWeight: 700,
            fontSize: `${Math.round(sizePx * 0.38)}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--primary-border)",
            fontFamily: "var(--font-heading)",
            userSelect: "none",
          }}
          aria-label={name}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: `${Math.max(8, Math.round(sizePx * 0.25))}px`,
            height: `${Math.max(8, Math.round(sizePx * 0.25))}px`,
            borderRadius: "50%",
            backgroundColor:
              status === "online"
                ? "var(--success)"
                : status === "busy"
                ? "var(--danger)"
                : "var(--text-muted)",
            border: "2px solid var(--bg-surface)",
          }}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};
