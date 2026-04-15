import Link from "next/link";
import Image from "next/image";
import { Badge } from "./Badge";
import { PriceTag } from "./PriceTag";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";

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
  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

  return (
    <Link
      href={`/shop/${slug}`}
      className={cn(
        "group flex flex-col bg-[#0B1F3A] border border-white/8 hover:border-[#F2B705]/40 transition-all duration-200 overflow-hidden",
        !inStock && "opacity-60 pointer-events-none",
        className
      )}
    >
      <div className="relative aspect-square bg-white/5 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-600 text-sm">
            No image
          </div>
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
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-xs font-bold text-white uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <span className="text-xs font-semibold text-[#F2B705] uppercase tracking-wider">
          {brand}
        </span>
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#F2B705] transition-colors">
          {name}
        </h3>
        {rating !== undefined && (
          <div className="flex items-center gap-1.5">
            <StarRating value={rating} size="sm" showCount={false} />
            {reviewCount !== undefined && (
              <span className="text-xs text-gray-500">({reviewCount})</span>
            )}
          </div>
        )}
        <div className="mt-auto pt-2">
          <PriceTag price={price} originalPrice={originalPrice} size="sm" />
        </div>
      </div>
    </Link>
  );
}
