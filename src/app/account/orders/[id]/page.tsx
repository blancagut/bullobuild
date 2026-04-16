import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Package, CheckCircle, Truck, Clock, XCircle } from "lucide-react";
import type { Metadata } from "next";
import type { CartItem, OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Order Detail | BULLOBUILD" };

const STATUS_STEPS: OrderStatus[] = ["pending", "paid", "shipped", "delivered"];

const statusIcon: Record<string, React.ElementType> = {
  pending: Clock,
  paid: CheckCircle,
  shipped: Truck,
  delivered: Package,
  cancelled: XCircle,
};

const statusVariant: Record<string, "success" | "warning" | "danger" | "dark"> = {
  paid: "success",
  shipped: "dark",
  delivered: "success",
  pending: "warning",
  cancelled: "danger",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!order) notFound();

  const items: CartItem[] = Array.isArray(order.items) ? order.items : [];
  const currentStepIdx = STATUS_STEPS.indexOf(order.status as OrderStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account/orders" className="text-gray-500 hover:text-white transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <SectionHeader label="Order" title={`#${order.id.slice(0, 8).toUpperCase()}`} />
        <div className="ml-auto">
          <Badge variant={statusVariant[order.status] ?? "dark"}>{order.status}</Badge>
        </div>
      </div>

      {/* Status timeline */}
      {order.status !== "cancelled" && (
        <div className="bg-[#0B1F3A] border border-white/8 p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">Order Timeline</h3>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = statusIcon[step];
              const done = idx <= currentStepIdx;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${done ? "border-[#F2B705] bg-[#F2B705]/10 text-[#F2B705]" : "border-white/10 text-gray-700"}`}>
                      <Icon size={14} />
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${done ? "text-[#F2B705]" : "text-gray-700"}`}>
                      {step}
                    </span>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 mb-5 ${idx < currentStepIdx ? "bg-[#F2B705]/40" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-[#0B1F3A] border border-white/8">
          <div className="px-5 py-4 border-b border-white/8">
            <h3 className="text-sm font-black uppercase text-white tracking-tight" style={{ fontFamily: "var(--font-barlow), system-ui" }}>
              Items ({items.length})
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                {item.image && (
                  <div className="h-14 w-14 bg-white/5 shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.brand} · Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-white shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-[#0B1F3A] border border-white/8 p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shipping</span>
                <span className="text-[#F2B705] font-semibold">Free</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-white">{formatPrice(order.total)}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-600 mt-3">
              Placed {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          {order.shipping_address && (
            <div className="bg-[#0B1F3A] border border-white/8 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={13} className="text-[#F2B705]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Shipping Address</h3>
              </div>
              <div className="text-sm text-gray-400 space-y-0.5">
                <p className="text-white font-medium">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
