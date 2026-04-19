"use client";

import { useCartStore } from "@/store/cart";
import { ShoppingCart } from "lucide-react";

interface AddListingToCartButtonProps {
  listing: {
    id: string;
    title: string;
    price: number;
    images?: string[] | null;
    brands?: { name: string } | null;
  };
}

export function AddListingToCartButton({ listing }: AddListingToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleCart);

  function handleAdd() {
    addItem({
      id: listing.id,
      name: listing.title,
      price: listing.price,
      quantity: 1,
      image: listing.images?.[0] ?? null,
      type: "listing",
      brand: listing.brands?.name ?? "",
    });
    toggleCart();
  }

  return (
    <button
      onClick={handleAdd}
      className="flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-yellow text-[13px] font-black uppercase tracking-[0.16em] text-ink transition-colors hover:bg-yellow-dark"
    >
      <ShoppingCart size={15} />
      Buy Now
    </button>
  );
}
