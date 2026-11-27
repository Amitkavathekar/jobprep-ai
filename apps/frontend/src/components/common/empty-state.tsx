import React from "react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
  style,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      style={{
        padding: "40px 20px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: 36,
            marginBottom: 8,
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          color: "white",
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            color: "#94a3b8",
            fontSize: 12,
            marginTop: 4,
            maxWidth: 380,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
