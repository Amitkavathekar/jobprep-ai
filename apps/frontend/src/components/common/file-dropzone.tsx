import React, { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Upload, FileText, X, AlertTriangle } from "lucide-react";

export interface FileDropzoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | { name: string; size: number } | null;
  acceptedExtensions?: string[];
  maxSizeInBytes?: number;
  label?: string;
  sublabel?: string;
  errorMessage?: string;
  onClearError?: () => void;
  disabled?: boolean;
  className?: string;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function FileDropzone({
  onFileSelect,
  selectedFile,
  acceptedExtensions = [".pdf", ".docx", ".txt"],
  maxSizeInBytes = 10 * 1024 * 1024,
  label = "Click to browse or drag and drop your resume",
  sublabel,
  errorMessage,
  onClearError,
  disabled = false,
  className = "",
}: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState("");

  const activeError = errorMessage || internalError;

  const validateAndSelect = (file: File) => {
    setInternalError("");
    onClearError?.();

    const lowerName = file.name.toLowerCase();
    const isValidExt = acceptedExtensions.some((ext) =>
      lowerName.endsWith(ext.toLowerCase())
    );

    if (!isValidExt) {
      const err = `Unsupported format. Allowed: ${acceptedExtensions.join(", ")}`;
      setInternalError(err);
      return;
    }

    if (file.size > maxSizeInBytes) {
      const err = `File exceeds the maximum limit of ${formatBytes(maxSizeInBytes)}.`;
      setInternalError(err);
      return;
    }

    onFileSelect(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = "";
    setInternalError("");
    onClearError?.();
    onFileSelect(null);
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedExtensions.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            disabled
              ? "cursor-not-allowed opacity-50 border-white/10"
              : isDragging
              ? "border-violet-500 bg-violet-500/10 cursor-pointer"
              : "border-white/15 bg-white/[0.02] hover:border-violet-400/50 hover:bg-white/[0.04] cursor-pointer"
          }`}
          style={{
            minHeight: 130,
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 mb-3">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-white">{label}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {sublabel || `${acceptedExtensions.join(", ").toUpperCase()} (up to ${formatBytes(maxSizeInBytes)})`}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.04] p-3.5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
              <FileText className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {formatBytes(selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {activeError && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
}
