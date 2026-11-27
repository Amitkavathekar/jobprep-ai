import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  style?: React.CSSProperties;
  totalItems?: number;
  pageSize?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  style,
  totalItems,
  pageSize,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        paddingTop: 16,
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        ...style,
      }}
    >
      <div style={{ fontSize: 12, color: "#94a3b8" }}>
        Page <span style={{ color: "white", fontWeight: 700 }}>{currentPage}</span> of{" "}
        <span style={{ color: "white", fontWeight: 700 }}>{totalPages}</span>
        {typeof totalItems === "number" && (
          <span style={{ marginLeft: 6 }}>
            ({totalItems} total {totalItems === 1 ? "item" : "items"})
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            cursor: currentPage <= 1 ? "not-allowed" : "pointer",
          }}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
          }}
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
