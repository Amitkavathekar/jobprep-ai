import React from "react";

export type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "error"
  | "info"
  | "purple"
  | "neutral"
  | "cyan";

export interface StatusBadgeProps {
  status?: string;
  variant?: StatusVariant;
  label?: string;
  dot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const variantStyles: Record<
  StatusVariant,
  { color: string; bg: string; border: string; dot: string }
> = {
  success: {
    color: "#34d399",
    bg: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    dot: "#10b981",
  },
  warning: {
    color: "#fbbf24",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "1px solid rgba(245, 158, 11, 0.2)",
    dot: "#f59e0b",
  },
  danger: {
    color: "#f87171",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    dot: "#ef4444",
  },
  error: {
    color: "#f87171",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    dot: "#ef4444",
  },
  info: {
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.1)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    dot: "#38bdf8",
  },
  purple: {
    color: "#c084fc",
    bg: "rgba(168, 85, 247, 0.1)",
    border: "1px solid rgba(168, 85, 247, 0.2)",
    dot: "#a855f7",
  },
  cyan: {
    color: "#22d3ee",
    bg: "rgba(6, 182, 212, 0.1)",
    border: "1px solid rgba(6, 182, 212, 0.2)",
    dot: "#06b6d4",
  },
  neutral: {
    color: "#94a3b8",
    bg: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    dot: "#94a3b8",
  },
};

function resolveVariant(status?: string, fallback: StatusVariant = "neutral"): StatusVariant {
  if (!status) return fallback;
  const s = status.toLowerCase().trim();
  if (["active", "success", "resolved", "completed", "done", "published", "paid"].includes(s)) {
    return "success";
  }
  if (["pending", "in-progress", "in progress", "open", "trial", "medium"].includes(s)) {
    return "warning";
  }
  if (["suspended", "failed", "critical", "danger", "expired", "deleted", "high"].includes(s)) {
    return "danger";
  }
  if (["refunded", "promo", "pro", "pricing", "plus"].includes(s)) {
    return "purple";
  }
  if (["info", "low", "basic", "user action"].includes(s)) {
    return "info";
  }
  return fallback;
}

export default function StatusBadge({
  status,
  variant,
  label,
  dot = false,
  className = "",
  style,
}: StatusBadgeProps) {
  const displayLabel = label || status || "";
  const resolvedVariant = variant || resolveVariant(status);
  const theme = variantStyles[resolvedVariant] || variantStyles.neutral;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        color: theme.color,
        background: theme.bg,
        border: theme.border,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: theme.dot,
            flexShrink: 0,
          }}
        />
      )}
      {displayLabel}
    </span>
  );
}
