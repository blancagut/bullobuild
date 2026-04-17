import { cn } from "@/lib/utils";

interface PriceTagProps {
  price: number;
  originalPrice?: number | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: { price: "text-base", original: "text-xs", badge: "text-[9px]" },
  md: { price: "text-xl", original: "text-sm", badge: "text-[10px]" },
  lg: { price: "text-3xl", original: "text-base", badge: "text-xs" },
  xl: { price: "text-4xl", original: "text-lg", badge: "text-xs" },
};

export function PriceTag({ price, originalPrice, size = "md", className }: PriceTagProps) {
  const discount = originalPrice
    ? Math.round((1 - price / originalPrice) * 100)
    : null;
  const s = sizes[size];

  return (
    <div className={cn("flex items-baseline gap-2 flex-wrap", className)}>
      <span className={cn("font-display font-black leading-none text-ink", s.price)}>
        ${price.toFixed(2)}
      </span>
      {originalPrice && (
        <>
          <span className={cn("leading-none line-through text-ink-muted", s.original)}>
            ${originalPrice.toFixed(2)}
          </span>
          <span
            className={cn(
              "bg-red-100 px-1.5 py-0.5 font-black leading-none text-red-700",
              s.badge
            )}
          >
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}
