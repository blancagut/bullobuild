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
          "w-4 h-4 shrink-0 border border-white/20 bg-transparent mt-0.5",
          "data-[state=checked]:bg-[#f2b705] data-[state=checked]:border-[#f2b705]",
          "focus:outline-none focus:ring-1 focus:ring-[#f2b705]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "transition-colors cursor-pointer"
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          <Check size={10} className="text-[#0b1f3a] stroke-[3]" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {(label || description) && (
        <label htmlFor={checkId} className="cursor-pointer">
          {label && (
            <p className="text-sm text-white font-medium leading-none mb-1">
              {label}
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </label>
      )}
    </div>
  );
}
