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
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {label}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            "flex items-center justify-between w-full bg-[#070f1c] border text-sm px-4 py-3 outline-none text-left transition-colors",
            error
              ? "border-red-500 text-white"
              : "border-white/10 focus:border-[#f2b705] text-white",
            !value && "text-gray-600",
            "data-[state=open]:border-[#f2b705]"
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown size={14} className="text-gray-500" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="bg-[#0b1f3a] border border-white/10 shadow-xl z-50 overflow-hidden"
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
                    "text-gray-300 hover:bg-white/5 hover:text-white",
                    "data-[state=checked]:text-[#f2b705]",
                    opt.disabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check size={13} className="text-[#f2b705]" />
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
