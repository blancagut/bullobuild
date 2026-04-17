"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  id?: string;
  label?: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: CheckboxProps) {
  const checkId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <CheckboxPrimitive.Root
        id={checkId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 border border-stroke bg-white",
          "data-[state=checked]:border-yellow data-[state=checked]:bg-yellow",
          "focus:outline-none focus:ring-2 focus:ring-yellow/20",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "transition-colors cursor-pointer"
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          <Check size={10} className="stroke-[3] text-ink" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {(label || description) && (
        <label htmlFor={checkId} className="cursor-pointer">
          {label && (
            <p className="mb-1 text-sm font-medium leading-none text-ink">
              {label}
            </p>
          )}
          {description && (
            <p className="text-xs text-ink-muted">{description}</p>
          )}
        </label>
      )}
    </div>
  );
}
