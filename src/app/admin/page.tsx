import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatPrice } from "@/lib/utils";
import { Package, Store, Users, ShoppingBag, Clock } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard | BULLOBUILD" };

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: listingCount },
    { count: userCount },
    { count: orderCount },
    { data: pendingListings },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("id, title, price, created_at")
      .eq("is_approved", false)
      .eq("is_sold", false)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select("id, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const stats = [
    { label: "Products", value: productCount ?? 0, icon: Package, href: "/admin/products" },
    { label: "Listings", value: listingCount ?? 0, icon: Store, href: "/admin/listings" },
    { label: "Users", value: userCount ?? 0, icon: Users, href: "/admin/users" },
    { label: "Orders", value: orderCount ?? 0, icon: ShoppingBag, href: "/admin/orders" },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader label="Admin" title="Dashboard" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-[#0B1F3A] border border-white/8 hover:border-[#F2B705]/30 p-5 group transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</span>
              <Icon size={15} className="text-gray-600 group-hover:text-[#F2B705] transition-colors" />
            </div>
            <p className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-barlow), system-ui" }}>
              {value.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0B1F3A] border border-white/8">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h2 className="text-sm font-black uppercase text-white tracking-tight" style={{ fontFamily: "var(--font-barlow), system-ui" }}>
              Pending Listings {(pendingListings?.length ?? 0) > 0 && <span className="text-[#F2B705]">({pendingListings?.length})</span>}
            </h2>
            <Link href="/admin/listings" className="text-xs text-[#F2B705] hover:underline">Review all</Link>
          </div>
          {!pendingListings || pendingListings.length === 0 ? (
            <p className="px-5 py-6 text-gray-500 text-sm">All caught up!</p>
          ) : (
            <div className="divide-y divide-white/5">
              {pendingListings.map((l) => (
                <div key={l.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm text-white line-clamp-1">{l.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock size={10} />{new Date(l.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm text-white font-semibold shrink-0 ml-4">{formatPrice(l.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0B1F3A] border border-white/8">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h2 className="text-sm font-black uppercase text-white tracking-tight" style={{ fontFamily: "var(--font-barlow), system-ui" }}>Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#F2B705] hover:underline">View all</Link>
          </div>
          {!recentOrders || recentOrders.length === 0 ? (
            <p className="px-5 py-6 text-gray-500 text-sm">No orders yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm text-white font-mono">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">{formatPrice(o.total)}</span>
                    <span className={`text-xs capitalize font-medium ${{ pending: "text-yellow-400", paid: "text-blue-400", shipped: "text-purple-400", delivered: "text-green-400", cancelled: "text-red-400" }[o.status as string] ?? "text-gray-400"}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
