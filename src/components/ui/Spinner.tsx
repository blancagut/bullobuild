import { cn } from "@/lib/utils";

// ── Spinner ─────────────────────────────────────────────────────────────────
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}
const spinnerSizes = { sm: "w-4 h-4", md: "w-7 h-7", lg: "w-10 h-10" };

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn(
        "border-2 border-white/10 border-t-[#f2b705] rounded-full animate-spin",
        spinnerSizes[size],
        className
      )}
    />
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("bg-white/5 animate-pulse", className)}
      {...props}
    />
  );
}

// ── ProductCardSkeleton ───────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="bg-[#0f1b2e] flex flex-col">
      <Skeleton className="h-52 w-full" />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center mt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}

// ── ListingCardSkeleton ───────────────────────────────────────────────────
export function ListingCardSkeleton() {
  return (
    <div className="bg-[#0f1b2e] p-5 flex gap-4">
      <Skeleton className="w-24 h-24 shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-28" />
      </div>
    </div>
  );
}

// ── PageSkeleton ──────────────────────────────────────────────────────────
export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4 py-12">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={cn("h-12 w-full", i % 2 === 0 ? "w-3/4" : "w-full")} />
      ))}
    </div>
  );
}
