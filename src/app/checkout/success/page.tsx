"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Package, Home, ShoppingBag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (sessionId) clearCart();
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen bg-[#070F1C] flex items-center justify-center py-16">
      <Container>
        <div className="max-w-lg mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-24 w-24 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
              <CheckCircle size={48} className="text-green-400" />
            </div>
          </div>

          <div>
            <h1
              className="text-4xl font-black uppercase text-white tracking-tight"
              style={{ fontFamily: "var(--font-barlow), system-ui" }}
            >
              Order Confirmed!
            </h1>
            <p className="text-gray-400 mt-2">
              Thank you for your purchase. You'll receive a confirmation email shortly.
            </p>
          </div>

          {sessionId && (
            <div className="bg-[#0B1F3A] border border-white/10 p-4 text-left">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Package size={14} className="text-[#F2B705]" />
                <span className="font-mono text-xs text-gray-500 break-all">
                  Ref: {sessionId.slice(0, 20)}…
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button href="/account/orders">
              <ShoppingBag size={16} className="mr-2" />
              View Orders
            </Button>
            <Button href="/" variant="outline">
              <Home size={16} className="mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
