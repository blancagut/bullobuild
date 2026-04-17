import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number; // 0–5
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

const sizeMap = { sm: 11, md: 14, lg: 18 };

export function StarRating({
  value,
  count,
  size = "sm",
  showCount = true,
  className,
}: StarRatingProps) {
  const px = sizeMap[size];
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={px}
            className={cn(
              i < full
                ? "fill-yellow text-yellow"
                : i === full && hasHalf
                  ? "fill-yellow/50 text-yellow"
                  : "fill-stroke text-stroke"
            )}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-[11px] text-ink-muted">
          {value.toFixed(1)} ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
