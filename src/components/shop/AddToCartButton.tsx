"use client";

import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: Product;
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleCart);

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] ?? null,
      type: "product",
      brand: product.brand?.name ?? "",
    });
    toggleCart();
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className="flex items-center justify-center gap-2 w-full h-12 bg-[#F2B705] hover:bg-[#D9A204] text-[#070F1C] font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ShoppingCart size={18} />
      Add to Cart
    </button>
  );
}
