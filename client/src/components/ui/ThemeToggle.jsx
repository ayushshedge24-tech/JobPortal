import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export const ThemeToggle = ({ size = "md", className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`btn btn-ghost btn-icon btn-${size} ${className}`}
      style={{
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-subtle)",
        color: "var(--text-primary)",
      }}
    >
      {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="var(--primary)" />}
    </button>
  );
};
