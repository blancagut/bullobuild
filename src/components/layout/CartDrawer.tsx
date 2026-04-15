"use client";

import { useEffect } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total, count } =
    useCartStore();

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={toggleCart}
      title={`Cart (${count()})`}
      side="right"
      width="w-[420px] max-w-full"
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
          <ShoppingBag size={48} className="text-gray-600" />
          <div>
            <p className="text-white font-semibold">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-1">
              Add some tools to get started.
            </p>
          </div>
          <Button
            href="/shop"
            onClick={toggleCart}
            className="mt-2"
          >
            Browse Shop
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 bg-white/5 p-3 border border-white/8"
              >
                <div className="relative h-16 w-16 shrink-0 bg-white/5 overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-600 text-xs">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0 gap-1">
                  <p className="text-sm text-white font-medium leading-snug line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">{item.brand}</p>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="h-6 w-6 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm text-white w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="h-6 w-6 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-white/10 p-5 space-y-4">
            <div className="flex justify-between text-white">
              <span className="text-sm text-gray-400">Subtotal</span>
              <span className="font-bold">{formatPrice(total())}</span>
            </div>
            <p className="text-xs text-gray-500">
              Shipping &amp; taxes calculated at checkout
            </p>
            <Button
              href="/checkout"
              onClick={toggleCart}
              className="w-full"
              size="lg"
            >
              Checkout — {formatPrice(total())}
            </Button>
            <Button
              href="/cart"
              onClick={toggleCart}
              variant="outline"
              className="w-full"
            >
              View Full Cart
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
