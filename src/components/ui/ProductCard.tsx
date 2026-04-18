import Link from "next/link";
import Image from "next/image";
import { Badge } from "./Badge";
import { PriceTag } from "./PriceTag";
import { StarRating } from "./StarRating";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { cn } from "@/lib/utils";
import { getProductPricingMode } from "@/lib/pricing";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
  className?: string;
}

export function ProductCard({
  id,
  slug,
  name,
  brand,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  badge,
  inStock = true,
  className,
}: ProductCardProps) {
  const pricingMode = getProductPricingMode({ brand, price, originalPrice: originalPrice ?? null });
  const isCatalogOnly = pricingMode === "catalog";
  const isContactOnly = pricingMode === "contact";
  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

  return (
    <Link
      href={`/shop/${slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-stroke bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-yellow/40 hover:shadow-md",
        !inStock && "opacity-60 pointer-events-none",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-wash">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <ImagePlaceholder slug={slug} brand={brand} />
        )}
        {badge && (
          <div className="absolute top-2 left-2">
            <Badge variant="yellow">{badge}</Badge>
          </div>
        )}
        {discount && (
          <div className="absolute top-2 right-2">
            <Badge variant="danger">-{discount}%</Badge>
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
            <span className="text-xs font-bold uppercase tracking-widest text-ink">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-yellow-dark">
          {brand}
        </span>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-yellow-dark">
          {name}
        </h3>
        {rating !== undefined && (
          <div className="flex items-center gap-1.5">
            <StarRating value={rating} size="sm" showCount={false} />
            {reviewCount !== undefined && (
              <span className="text-xs text-ink-muted">({reviewCount})</span>
            )}
          </div>
        )}
        <div className="mt-auto pt-2">
          {isCatalogOnly ? (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-black uppercase tracking-[0.14em] text-yellow-dark">
                Catalog item
              </span>
              <span className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                Pricing coming soon
              </span>
            </div>
          ) : isContactOnly ? (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-black uppercase tracking-[0.14em] text-yellow-dark">
                Contact us
              </span>
              <span className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                Request a quote
              </span>
            </div>
          ) : (
            <PriceTag price={price} originalPrice={originalPrice} size="sm" />
          )}
        </div>
      </div>
    </Link>
  );
}
