import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav
      className={`pagination-nav ${className}`}
      aria-label="Pagination Navigation"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        marginTop: "var(--space-8)",
      }}
    >
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
        <span>Previous</span>
      </Button>

      {renderPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          type="button"
          aria-current={currentPage === pageNum ? "page" : undefined}
          onClick={() => onPageChange(pageNum)}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "var(--radius-md)",
            border: "1px solid",
            borderColor: currentPage === pageNum ? "var(--primary)" : "var(--border-subtle)",
            backgroundColor: currentPage === pageNum ? "var(--primary)" : "var(--bg-surface)",
            color: currentPage === pageNum ? "#ffffff" : "var(--text-primary)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
        >
          {pageNum}
        </button>
      ))}

      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next Page"
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </Button>
    </nav>
  );
};
