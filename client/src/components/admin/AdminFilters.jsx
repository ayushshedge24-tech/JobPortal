import React from "react";
import { Search, RotateCcw } from "lucide-react";

export const AdminFilters = ({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  onReset,
  children,
}) => {
  return (
    <div
      className="card"
      style={{
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", flex: 1, minWidth: "260px" }}>
        {onSearchChange && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onSearchSubmit) onSearchSubmit();
            }}
            style={{ position: "relative", minWidth: "220px", flex: 1 }}
          >
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2rem", width: "100%", fontSize: "0.85rem" }}
            />
          </form>
        )}
        {children}
      </div>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};
