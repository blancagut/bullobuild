"use client";

import * as RadixAvatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  fallback?: string;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({ src, fallback, alt, size = "md", className }: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <RadixAvatar.Root
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizes[size],
        className
      )}
    >
      {src && (
        <RadixAvatar.Image
          src={src}
          alt={alt ?? fallback ?? "Avatar"}
          className="aspect-square h-full w-full object-cover"
        />
      )}
      <RadixAvatar.Fallback
        className="flex h-full w-full items-center justify-center rounded-full bg-[#F2B705] text-[#0B1F3A] font-bold"
        delayMs={src ? 600 : 0}
      >
        {initials}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
