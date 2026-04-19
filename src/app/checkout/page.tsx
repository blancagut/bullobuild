"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { Lock, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace("/cart");
    }
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate order placement — payment integration coming soon
      await new Promise((r) => setTimeout(r, 1000));
      clearCart();
      toast.success("Order placed! We'll contact you shortly to confirm.");
      router.push("/");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-6 lg:py-8">
        <SectionHeader label="Secure Checkout" title="Complete Your Order" className="mb-7 md:mb-8" />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Shipping */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4 rounded-2xl border border-stroke bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-lg font-black uppercase text-ink">
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  placeholder="John Smith"
                  className="sm:col-span-2"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className="sm:col-span-2"
                />
                <Input
                  label="Address"
                  name="address_line1"
                  value={form.address_line1}
                  onChange={handleChange}
                  required
                  placeholder="123 Main St"
                  className="sm:col-span-2"
                />
                <Input
                  label="Apt / Suite (optional)"
                  name="address_line2"
                  value={form.address_line2}
                  onChange={handleChange}
                  placeholder="Apt 4B"
                  className="sm:col-span-2"
                />
                <Input
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="Chicago"
                />
                <Input
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  placeholder="IL"
                  maxLength={2}
                />
                <Input
                  label="ZIP Code"
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  required
                  placeholder="60601"
                />
                <Input
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  placeholder="US"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-stroke bg-panel p-5 text-sm text-ink-soft shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-yellow-dark" />
                Your order is secure. Payment details will be confirmed by our team.
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4 rounded-2xl border border-stroke bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-xl font-black uppercase text-ink">
                Order Summary
              </h2>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="mr-2 flex-1 line-clamp-1 text-ink-soft">
                      {item.name}{" "}
                      <span className="text-ink-muted">×{item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium text-ink">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-stroke pt-4">
                <div className="flex justify-between text-sm text-ink-soft">
                  <span>Subtotal</span>
                  <span>{formatPrice(total())}</span>
                </div>
                <div className="flex justify-between text-sm text-ink-soft">
                  <span>Shipping</span>
                  <span className="text-yellow-dark">
                    {total() >= 99 ? "FREE" : formatPrice(9.99)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-stroke pt-2 font-bold text-ink">
                  <span>Total</span>
                  <span>
                    {formatPrice(
                      total() + (total() >= 99 ? 0 : 9.99) + total() * 0.08
                    )}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2"
                size="lg"
              >
                {loading ? (
                  "Placing Order…"
                ) : (
                  <>
                    <ShoppingBag size={16} className="mr-2" />
                    Place Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
