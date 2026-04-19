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
      className="flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-yellow text-[13px] font-black uppercase tracking-[0.16em] text-ink transition-colors hover:bg-yellow-dark disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ShoppingCart size={15} />
      Add to Cart
    </button>
  );
}
