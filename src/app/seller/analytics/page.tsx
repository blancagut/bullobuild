import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SellerAnalyticsCharts } from "@/components/seller/SellerAnalyticsCharts";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics | Seller" };

export default async function SellerAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, condition, is_sold, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const sold = listings?.filter((l) => l.is_sold) ?? [];

  // Monthly sales (last 6 months)
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const month = d.toISOString().slice(0, 7);
    const items = sold.filter((l) => l.created_at.slice(0, 7) === month);
    return { label, sales: items.length, revenue: items.reduce((s, l) => s + (l.price ?? 0), 0) };
  });

  // Top 5 sold listings
  const topListings = sold.slice(0, 5);

  // Condition breakdown
  const conditions = ["like_new", "excellent", "good", "fair"];
  const conditionBreakdown = conditions.map((c) => ({
    name: c.replace("_", " "),
    value: listings?.filter((l) => l.condition === c).length ?? 0,
  })).filter((c) => c.value > 0);

  return (
    <div className="space-y-8">
      <SectionHeader label="Seller" title="Analytics" />

      <SellerAnalyticsCharts monthlyData={monthlyData} conditionBreakdown={conditionBreakdown} />

      {/* Top listings */}
      <div className="bg-[#0B1F3A] border border-white/8">
        <div className="px-5 py-4 border-b border-white/8">
          <h2 className="text-sm font-black uppercase text-white tracking-tight" style={{ fontFamily: "var(--font-barlow), system-ui" }}>
            Top Sold Listings
          </h2>
        </div>
        {topListings.length === 0 ? (
          <p className="px-5 py-8 text-gray-500 text-sm">No sold listings yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {topListings.map((l, i) => (
              <div key={l.id} className="flex items-center gap-4 px-5 py-3">
                <span className="text-lg font-black text-gray-700 w-6 text-center" style={{ fontFamily: "var(--font-barlow), system-ui" }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white line-clamp-1">{l.title}</p>
                  <Badge variant="dark" className="mt-1 capitalize">{l.condition.replace("_", " ")}</Badge>
                </div>
                <span className="text-sm font-semibold text-white shrink-0">{formatPrice(l.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
