import React from "react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (FilterOption | string)[];
  className?: string;
  style?: React.CSSProperties;
}

export default function FilterDropdown({
  label,
  value,
  onChange,
  options,
  className = "",
  style,
}: FilterDropdownProps) {
  const normalizedOptions: FilterOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        ...style,
      }}
    >
      {label && (
        <label
          style={{
            fontSize: 12,
            color: "#94a3b8",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white outline-none transition focus:border-violet-500/50"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          color: "white",
          padding: "7px 12px",
          borderRadius: 8,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        {normalizedOptions.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            style={{
              background: "#13122b",
              color: "white",
            }}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
