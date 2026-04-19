import Link from "next/link";
import Image from "next/image";
import { Badge } from "./Badge";
import { StarRating } from "./StarRating";
import { MapPin, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Condition = "like_new" | "excellent" | "good" | "fair";

const conditionLabels: Record<Condition, string> = {
  like_new: "Like New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
};

const conditionVariants: Record<Condition, "success" | "yellow" | "outline" | "warning"> = {
  like_new: "success",
  excellent: "yellow",
  good: "outline",
  fair: "warning",
};

interface ListingCardProps {
  id: string;
  title: string;
  brand: string;
  price: number;
  condition: Condition;
  image?: string;
  location?: string;
  sellerName?: string;
  sellerRating?: number;
  createdAt?: string;
  className?: string;
}

export function ListingCard({
  id,
  title,
  brand,
  price,
  condition,
  image,
  location,
  sellerName,
  sellerRating,
  createdAt,
  className,
}: ListingCardProps) {
  const timeAgo = createdAt
    ? getTimeAgo(new Date(createdAt))
    : null;

  return (
    <Link
      href={`/marketplace/${id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-stroke bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-yellow/40 hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-wash">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-muted">
            No image
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant={conditionVariants[condition]}>
            {conditionLabels[condition]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft sm:text-xs">
          {brand}
        </span>
        <h3 className="min-h-[2.9rem] line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-yellow-dark sm:min-h-12">
          {title}
        </h3>

        <p className="mt-auto pt-2.5 font-display text-[1.4rem] font-black leading-none text-ink sm:text-[1.5rem]">
          {formatPrice(price)}
        </p>

        <div className="mt-1 flex flex-col gap-2 border-t border-stroke pt-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1 text-xs text-ink-soft">
            {sellerName && (
              <span className="font-medium">{sellerName}</span>
            )}
            {sellerRating !== undefined && (
              <StarRating value={sellerRating} size="sm" showCount={false} />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
            {location && (
              <span className="flex items-center gap-0.5">
                <MapPin size={10} />
                {location}
              </span>
            )}
            {timeAgo && (
              <span className="flex items-center gap-0.5">
                <Clock size={10} />
                {timeAgo}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
