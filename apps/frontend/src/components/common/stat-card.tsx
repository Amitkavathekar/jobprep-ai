import React from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function StatCard({
  title,
  value,
  subtitle,
  color = "#a855f7",
  icon,
  className = "",
  style,
}: StatCardProps) {
  return (
    <div
      className={`glass-card relative overflow-hidden rounded-xl border p-4 transition-all hover:border-white/20 ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: `1px solid ${color ? `${color}33` : "rgba(255, 255, 255, 0.08)"}`,
        borderRadius: 14,
        padding: "16px 20px",
        position: "relative",
        ...style,
      }}
    >
      <div className="flex items-center justify-between">
        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
          }}
        >
          {title}
        </div>
        {icon && <div style={{ color, opacity: 0.85 }}>{icon}</div>}
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "white",
          marginTop: 6,
          lineHeight: 1.15,
        }}
      >
        {value}
      </div>

      {subtitle && (
        <div
          style={{
            fontSize: 11,
            color: color || "#94a3b8",
            marginTop: 4,
            fontFamily: "JetBrains Mono, monospace",
            fontWeight: 500,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
