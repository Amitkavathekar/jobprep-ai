"use client";

import React from "react";
import { Lock } from "lucide-react";

export interface LockedBlurOverlayProps {
  isLocked?: boolean;
  onOpenUpgradeModal?: () => void;
  customText?: string;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}

export default function LockedBlurOverlay({
  isLocked = false,
  onOpenUpgradeModal,
  customText,
  style,
  className = "",
  children,
}: LockedBlurOverlayProps) {
  if (!isLocked) {
    return (
      <div style={style} className={className}>
        {children}
      </div>
    );
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenUpgradeModal) {
      onOpenUpgradeModal();
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-membership-modal"));
    }
  };

  return (
    <div
      className={`group relative overflow-hidden transition-all duration-200 cursor-pointer ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        cursor: "pointer",
        ...style,
      }}
      onClick={handleOpen}
      title="Click to unlock with Membership Plan"
    >
      <div
        style={{
          filter: "blur(6px)",
          userSelect: "none",
          pointerEvents: "none",
          opacity: 0.45,
          width: "100%",
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(11, 10, 32, 0.55)",
          backdropFilter: "blur(3px)",
          padding: 8,
          zIndex: 10,
          cursor: "pointer",
        }}
        onClick={handleOpen}
      >
        <div
          style={{
            background: "rgba(20, 16, 45, 0.94)",
            border: "1px solid rgba(124, 58, 237, 0.45)",
            boxShadow:
              "0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(124, 58, 237, 0.25)",
            borderRadius: 10,
            padding: "8px 14px",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            transition: "transform 0.15s ease, border-color 0.15s ease",
          }}
          className="hover:scale-105 hover:border-violet-400"
          onClick={handleOpen}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: "rgba(124, 58, 237, 0.25)",
              border: "1px solid rgba(124, 58, 237, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#c4b5fd",
              flexShrink: 0,
            }}
          >
            <Lock size={13} />
          </div>
          <div style={{ textAlign: "left" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>
              Pro Feature
            </span>
            {customText && (
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(148, 163, 184, 0.85)",
                  marginLeft: 6,
                }}
              >
                {customText}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleOpen}
            style={{
              marginLeft: 4,
              padding: "4px 11px",
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 6,
              background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
              color: "white",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
            className="hover:brightness-110 active:scale-95"
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
