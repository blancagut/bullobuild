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
  const { items, total, count, clearCart } = useCartStore();
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
    <div className="min-h-screen bg-[#070F1C] py-10">
      <Container>
        <SectionHeader label="Secure Checkout" title="Complete Your Order" className="mb-8" />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0B1F3A] border border-white/10 p-6 space-y-4">
              <h2
                className="text-lg font-black uppercase text-white"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
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

            <div className="bg-[#0B1F3A] border border-white/10 p-6">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Lock size={14} className="text-[#F2B705]" />
                Your order is secure. Payment details will be confirmed by our team.
              </div>
            </div>
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

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300 line-clamp-1 flex-1 mr-2">
                      {item.name}{" "}
                      <span className="text-gray-500">×{item.quantity}</span>
                    </span>
                    <span className="text-white shrink-0 font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(total())}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Shipping</span>
                  <span className="text-[#F2B705]">
                    {total() >= 99 ? "FREE" : formatPrice(9.99)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
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
