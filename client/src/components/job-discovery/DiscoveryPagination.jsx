import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const DiscoveryPagination = ({ page = 1, totalPages = 1, total = 0, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
        Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total openings)
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
