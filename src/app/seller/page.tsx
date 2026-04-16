import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatPrice } from "@/lib/utils";
import { DollarSign, List, TrendingUp, Star } from "lucide-react";
import { SellerSalesChart } from "@/components/seller/SellerSalesChart";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Seller Dashboard | BULLOBUILD" };

export default async function SellerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: listings },
    { data: soldListings },
  ] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, price, is_sold, is_approved, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("listings")
      .select("price, created_at")
      .eq("user_id", user!.id)
      .eq("is_sold", true),
  ]);

  const activeCount = listings?.filter((l) => !l.is_sold && l.is_approved).length ?? 0;
  const totalRevenue = soldListings?.reduce((sum, l) => sum + (l.price ?? 0), 0) ?? 0;

  // Sales by day (last 7 days)
  const now = new Date();
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateStr = d.toISOString().slice(0, 10);
    const sales = soldListings?.filter((l) => l.created_at.slice(0, 10) === dateStr).length ?? 0;
    const revenue = soldListings?.filter((l) => l.created_at.slice(0, 10) === dateStr).reduce((s, l) => s + (l.price ?? 0), 0) ?? 0;
    return { label, sales, revenue };
  });

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign },
    { label: "Active Listings", value: activeCount, icon: List },
    { label: "Total Sold", value: soldListings?.length ?? 0, icon: TrendingUp },
    { label: "Seller Rating", value: "N/A", icon: Star },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader label="Seller" title="Dashboard" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#0B1F3A] border border-white/8 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</span>
              <Icon size={15} className="text-gray-600" />
            </div>
            <p className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-barlow), system-ui" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#0B1F3A] border border-white/8 p-6">
        <h2 className="text-sm font-black uppercase text-white tracking-tight mb-6" style={{ fontFamily: "var(--font-barlow), system-ui" }}>
          Sales — Last 7 Days
        </h2>
        <SellerSalesChart data={chartData} />
      </div>

      {/* Recent listings */}
      <div className="bg-[#0B1F3A] border border-white/8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="text-sm font-black uppercase text-white tracking-tight" style={{ fontFamily: "var(--font-barlow), system-ui" }}>Recent Listings</h2>
          <a href="/seller/listings" className="text-xs text-[#F2B705] hover:underline">View all</a>
        </div>
        {!listings || listings.length === 0 ? (
          <p className="px-5 py-8 text-gray-500 text-sm">No listings yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {listings.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm text-white line-clamp-1">{l.title}</p>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-sm text-white font-semibold">{formatPrice(l.price)}</span>
                  <span className={`text-xs font-bold uppercase ${l.is_sold ? "text-red-400" : l.is_approved ? "text-green-400" : "text-yellow-400"}`}>
                    {l.is_sold ? "Sold" : l.is_approved ? "Live" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
