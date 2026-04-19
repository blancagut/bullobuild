"use client";

import { useCartStore } from "@/store/cart";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, count } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-3">
        <div className="rounded-2xl border border-stroke bg-white px-6 py-12 text-center shadow-sm">
          <ShoppingCart size={56} className="mx-auto text-ink-muted" />
          <h1 className="mt-4 font-display text-3xl font-black uppercase text-ink">
            Your Cart is Empty
          </h1>
          <p className="mt-2 text-sm text-ink-soft">Add some tools to get started.</p>
          <Button href="/shop" className="mt-5">
            Browse Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-6 lg:py-8">
        <SectionHeader
          label={`${count()} items`}
          title="Your Cart"
          className="mb-7 md:mb-8"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-stroke bg-white p-4 shadow-sm sm:flex-row"
              >
                <div className="relative h-24 w-24 shrink-0 rounded-xl border border-stroke bg-panel">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-ink-muted">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {item.brand && (
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-yellow-dark sm:text-xs">
                      {item.brand}
                    </span>
                  )}
                  <h3 className="text-sm font-semibold leading-snug text-ink">
                    {item.name}
                  </h3>
                  <Badge item={item} />

                  <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex w-fit items-center rounded-full border border-stroke bg-panel">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors hover:bg-white hover:text-ink"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm text-ink">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors hover:bg-white hover:text-ink"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-sm font-bold text-ink">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-ink-muted transition-colors hover:text-red-500"
                        aria-label="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4 rounded-2xl border border-stroke bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-xl font-black uppercase text-ink">
                Order Summary
              </h2>

              <div className="space-y-3 border-y border-stroke py-4">
                <div className="flex justify-between text-sm text-ink-soft">
                  <span>Subtotal ({count()} items)</span>
                  <span>{formatPrice(total())}</span>
                </div>
                <div className="flex justify-between text-sm text-ink-soft">
                  <span>Shipping</span>
                  <span className="text-yellow-dark">
                    {total() >= 99 ? "FREE" : formatPrice(9.99)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-ink-soft">
                  <span>Tax (est.)</span>
                  <span>{formatPrice(total() * 0.08)}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-ink">
                <span>Total</span>
                <span>
                  {formatPrice(
                    total() + (total() >= 99 ? 0 : 9.99) + total() * 0.08
                  )}
                </span>
              </div>

              <Button href="/checkout" className="w-full mt-2" size="lg">
                Proceed to Checkout
                <ArrowRight size={16} className="ml-2" />
              </Button>

              <Link
                href="/shop"
                className="mt-2 block text-center text-xs text-ink-muted transition-colors hover:text-ink-soft"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

// Inline badge for listing type
function Badge({ item }: { item: { type: string } }) {
  if (item.type === "listing") {
    return (
      <span className="inline-block w-fit border border-yellow/30 bg-yellow/10 px-2 py-0.5 text-xs text-yellow-dark">
        Pre-owned
      </span>
    );
  }
  return null;
}
