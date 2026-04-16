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
            "fixed top-0 bottom-0 z-50 flex flex-col border-stroke bg-paper shadow-[0_24px_80px_rgba(26,35,51,0.18)]",
            side === "right"
              ? "right-0 border-l data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
              : "left-0 border-r data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
            width,
            className
          )}
        >
          <div className="flex items-center justify-between border-b border-stroke p-5 shrink-0">
            <div>
              {title && (
                <Dialog.Title className="font-display text-lg font-black uppercase tracking-tight text-ink">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="mt-0.5 text-xs text-ink-soft">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="text-ink-muted transition-colors hover:text-ink">
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
