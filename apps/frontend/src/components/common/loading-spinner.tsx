import React from "react";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | number;
  text?: string;
  color?: string;
  className?: string;
  fullScreen?: boolean;
  minHeight?: number | string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 36,
};

export default function LoadingSpinner({
  size = "md",
  text,
  color = "#a855f7",
  className = "",
  fullScreen = false,
  minHeight,
}: LoadingSpinnerProps) {
  const pixelSize = typeof size === "number" ? size : sizeMap[size];

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      style={{
        minHeight: fullScreen ? "100vh" : minHeight || "auto",
        width: "100%",
      }}
    >
      <Loader2
        style={{
          width: pixelSize,
          height: pixelSize,
          color,
        }}
        className="animate-spin"
      />
      {text && (
        <span
          style={{
            fontSize: 13,
            color: "#94a3b8",
            fontWeight: 500,
          }}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          backgroundColor: "#07071a",
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}
