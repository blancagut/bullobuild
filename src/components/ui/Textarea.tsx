import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[10px] font-bold uppercase tracking-widest text-ink-soft"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={4}
          className={cn(
            "w-full resize-y border border-stroke bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted",
            error
              ? "border-red-500 focus:border-red-400"
              : "focus:border-yellow/60",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
