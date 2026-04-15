"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  width?: string;
  className?: string;
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = "right",
  width = "w-[400px]",
  className,
}: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed top-0 bottom-0 z-50 flex flex-col bg-[#0b1f3a] border-white/10 shadow-2xl",
            side === "right"
              ? "right-0 border-l data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
              : "left-0 border-r data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
            width,
            className
          )}
        >
          <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
            <div>
              {title && (
                <Dialog.Title
                  className="font-black text-lg uppercase text-white tracking-tight"
                  style={{ fontFamily: "var(--font-barlow), system-ui" }}
                >
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="text-xs text-gray-400 mt-0.5">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="text-gray-500 hover:text-white transition-colors">
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
