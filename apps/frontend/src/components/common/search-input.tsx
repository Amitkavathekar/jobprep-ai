import React from "react";
import { Search, X } from "lucide-react";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  className = "",
  style,
  autoFocus = false,
}: SearchInputProps) {
  return (
    <div
      className={`relative flex items-center ${className}`}
      style={{
        position: "relative",
        width: "100%",
        ...style,
      }}
    >
      <Search
        className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
        style={{ color: "#94a3b8" }}
      />
      <input
        type="text"
        className="glass-input w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-8 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        style={{
          paddingLeft: 34,
          paddingRight: value ? 28 : 12,
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            onClear?.();
          }}
          className="absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition hover:text-white"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
