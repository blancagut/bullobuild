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
            className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={4}
          className={cn(
            "w-full bg-[#070f1c] border text-white text-sm px-4 py-3 outline-none transition-colors placeholder:text-gray-600 resize-y",
            error
              ? "border-red-500 focus:border-red-400"
              : "border-white/10 focus:border-[#f2b705]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-600">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
