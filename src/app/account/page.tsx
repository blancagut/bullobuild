import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatPrice } from "@/lib/utils";
import { Package, List, Heart, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Account | BULLOBUILD" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile },
    { count: orderCount },
    { count: listingCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .eq("is_sold", false),
    supabase
      .from("orders")
      .select("id, total, status, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const statusVariant: Record<string, "success" | "warning" | "danger" | "dark"> = {
    paid: "success",
    shipped: "dark",
    delivered: "success",
    pending: "warning",
    cancelled: "danger",
  };

  const quickLinks = [
    { href: "/account/orders", label: "My Orders", icon: Package, value: `${orderCount ?? 0} orders`, desc: "View your order history" },
    { href: "/account/listings", label: "Active Listings", icon: List, value: `${listingCount ?? 0} active`, desc: "Manage your marketplace listings" },
    { href: "/account/saved", label: "Saved Items", icon: Heart, value: "View favorites", desc: "Products you've saved" },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader label="Account" title="Overview" />

      {/* Profile card */}
      <div className="bg-[#0B1F3A] border border-white/8 p-6 flex items-center gap-5">
        <Avatar src={profile?.avatar_url} fallback={profile?.full_name ?? user!.email ?? "U"} size="xl" />
        <div>
          <p className="font-black text-xl text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-barlow), system-ui" }}>
            {profile?.full_name ?? "Anonymous"}
          </p>
          <p className="text-gray-400 text-sm mt-0.5">{user!.email}</p>
          <Badge variant={profile?.role === "seller" || profile?.role === "admin" ? "yellow" : "dark"} className="mt-2">
            {profile?.role ?? "user"}
          </Badge>
        </div>
        <Link href="/account/profile" className="ml-auto text-xs text-[#F2B705] hover:underline">
          Edit profile
        </Link>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map(({ href, label, icon: Icon, value, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-[#0B1F3A] border border-white/8 hover:border-[#F2B705]/30 p-5 group transition-colors flex items-start justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-[#F2B705]" />
                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">{label}</span>
              </div>
              <p className="text-white font-black text-lg" style={{ fontFamily: "var(--font-barlow), system-ui" }}>{value}</p>
              <p className="text-gray-600 text-xs mt-1">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-700 group-hover:text-[#F2B705] transition-colors mt-1 shrink-0" />
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-[#0B1F3A] border border-white/8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="text-sm font-black uppercase text-white tracking-tight" style={{ fontFamily: "var(--font-barlow), system-ui" }}>
            Recent Orders
          </h2>
          <Link href="/account/orders" className="text-xs text-[#F2B705] hover:underline">View all</Link>
        </div>
        {!recentOrders || recentOrders.length === 0 ? (
          <p className="px-5 py-8 text-gray-500 text-sm">No orders yet. <Link href="/shop" className="text-[#F2B705] hover:underline">Start shopping</Link></p>
        ) : (
          <div className="divide-y divide-white/5">
            {recentOrders.map((o) => (
              <Link key={o.id} href={`/account/orders/${o.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div>
                  <p className="text-sm text-white font-mono">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">{formatPrice(o.total)}</span>
                  <Badge variant={statusVariant[o.status] ?? "dark"}>{o.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
