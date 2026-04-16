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
          <ShoppingBag size={48} className="text-ink-muted" />
          <div>
            <p className="font-semibold text-ink">Your cart is empty</p>
            <p className="mt-1 text-sm text-ink-soft">
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
                className="flex gap-3 border border-stroke bg-card p-3"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-wash">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-ink-muted">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0 gap-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-ink">
                    {item.name}
                  </p>
                  <p className="text-xs text-ink-soft">{item.brand}</p>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="flex h-6 w-6 items-center justify-center bg-panel text-sm text-ink transition-colors hover:bg-panel-strong"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-sm text-ink">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="flex h-6 w-6 items-center justify-center bg-panel text-sm text-ink transition-colors hover:bg-panel-strong"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-ink">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-ink-muted transition-colors hover:text-red-500"
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

          <div className="shrink-0 space-y-4 border-t border-stroke p-5">
            <div className="flex justify-between text-ink">
              <span className="text-sm text-ink-soft">Subtotal</span>
              <span className="font-bold">{formatPrice(total())}</span>
            </div>
            <p className="text-xs text-ink-muted">
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
              className="w-full border-stroke text-ink hover:border-yellow hover:bg-panel"
            >
              View Full Cart
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
