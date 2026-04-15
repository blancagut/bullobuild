"use client";

import { useCartStore } from "@/store/cart";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, count } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#070F1C] flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingCart size={64} className="text-gray-700 mx-auto" />
          <h1
            className="text-3xl font-black uppercase text-white"
            style={{ fontFamily: "var(--font-barlow), system-ui" }}
          >
            Your Cart is Empty
          </h1>
          <p className="text-gray-400">Add some tools to get started.</p>
          <Button href="/shop" className="mt-4">
            Browse Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070F1C] py-10">
      <Container>
        <SectionHeader
          label={`${count()} items`}
          title="Your Cart"
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-[#0B1F3A] border border-white/10 p-4"
              >
                <div className="relative h-24 w-24 shrink-0 bg-white/5">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                      sizes="96px"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-600 text-xs">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-0 gap-1">
                  {item.brand && (
                    <span className="text-xs font-bold text-[#F2B705] uppercase tracking-wider">
                      {item.brand}
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-white leading-snug">
                    {item.name}
                  </h3>
                  <Badge item={item} />

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center border border-white/10">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm text-white w-10 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-white text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
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
            <div className="bg-[#0B1F3A] border border-white/10 p-6 sticky top-24 space-y-4">
              <h2
                className="text-xl font-black uppercase text-white"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                Order Summary
              </h2>

              <div className="space-y-3 py-4 border-y border-white/10">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal ({count()} items)</span>
                  <span>{formatPrice(total())}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Shipping</span>
                  <span className="text-[#F2B705]">
                    {total() >= 99 ? "FREE" : formatPrice(9.99)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Tax (est.)</span>
                  <span>{formatPrice(total() * 0.08)}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-white">
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
                className="block text-center text-xs text-gray-500 hover:text-gray-300 transition-colors mt-2"
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
      <span className="inline-block text-xs px-2 py-0.5 bg-[#F2B705]/10 text-[#F2B705] border border-[#F2B705]/30 w-fit">
        Pre-owned
      </span>
    );
  }
  return null;
}
