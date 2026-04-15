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
      className="flex items-center justify-center gap-2 w-full h-12 bg-[#F2B705] hover:bg-[#D9A204] text-[#070F1C] font-bold uppercase tracking-wider text-sm transition-colors"
    >
      <ShoppingCart size={18} />
      Buy Now
    </button>
  );
}
