"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PriceTag } from "@/components/ui/PriceTag";
import { useCartStore } from "@/store/cart";

interface StoreProductCardProps {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  image?: string | null;
  stock: number;
  badge?: string;
  priority?: boolean;
}

export function StoreProductCard({
  id,
  slug,
  name,
  brand,
  price,
  originalPrice,
  image,
  stock,
  badge,
  priority = false,
}: StoreProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isOpen = useCartStore((state) => state.isOpen);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  function handleAddToCart() {
    addItem({
      id,
      name,
      brand,
      price,
      quantity: 1,
      image: image ?? null,
      type: "product",
    });
    if (!isOpen) {
      toggleCart();
    }
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-white/8 bg-navy transition-colors hover:border-yellow/40">
      <Link href={`/shop/${slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-white/5">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              priority={priority}
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-surface">
              <span className="font-display text-4xl font-black uppercase tracking-tight text-white/10">
                {brand.split(/\s|\+/)[0]}
              </span>
            </div>
          )}

          <div className="absolute left-3 top-3 flex gap-2">
            {badge ? <Badge variant="yellow">{badge}</Badge> : null}
          </div>

          {discount ? (
            <div className="absolute right-3 top-3">
              <Badge variant="danger">-{discount}%</Badge>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow">
              {brand}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                stock <= 5 ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {stock <= 5 ? `${stock} left` : "In stock"}
            </span>
          </div>

          <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-yellow">
            {name}
          </h3>

          <div className="mt-auto pt-2">
            <PriceTag price={price} originalPrice={originalPrice ?? undefined} size="sm" />
          </div>
        </div>
      </Link>

      <div className="border-t border-white/8 p-4 pt-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className="flex h-11 w-full items-center justify-center gap-2 bg-yellow text-sm font-black uppercase tracking-[0.18em] text-navy transition-colors hover:bg-yellow-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}