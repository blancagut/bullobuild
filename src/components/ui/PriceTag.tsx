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
      <span
        className={cn("font-black text-white leading-none", s.price)}
        style={{ fontFamily: "var(--font-barlow), system-ui" }}
      >
        ${price.toFixed(2)}
      </span>
      {originalPrice && (
        <>
          <span className={cn("text-gray-600 line-through leading-none", s.original)}>
            ${originalPrice.toFixed(2)}
          </span>
          <span
            className={cn(
              "bg-red-600 text-white font-black px-1.5 py-0.5 leading-none",
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
