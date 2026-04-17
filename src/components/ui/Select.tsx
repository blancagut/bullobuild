"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">
          {label}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            "flex w-full items-center justify-between border border-stroke bg-white px-4 py-3 text-left text-sm text-ink outline-none transition-colors",
            error
              ? "border-red-500 text-ink"
              : "focus:border-yellow/60",
            !value && "text-ink-muted",
            "data-[state=open]:border-yellow/50"
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown size={14} className="text-ink-muted" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-50 overflow-hidden rounded-2xl border border-stroke bg-white shadow-[0_20px_45px_rgba(43,36,24,0.14)]"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer outline-none transition-colors",
                    "text-ink-soft hover:bg-panel hover:text-ink",
                    "data-[state=checked]:text-yellow-dark",
                    opt.disabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check size={13} className="text-yellow-dark" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
