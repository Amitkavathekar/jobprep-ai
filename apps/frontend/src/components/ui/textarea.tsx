import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border bg-white/[0.04] p-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-amber-400/50 focus:border-amber-400" : "border-white/10",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
