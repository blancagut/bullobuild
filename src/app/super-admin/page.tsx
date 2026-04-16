import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatPrice } from "@/lib/utils";
import { Package, Store, Users, ShoppingBag, DollarSign } from "lucide-react";
import { SuperAdminRoleChart } from "@/components/super-admin/SuperAdminRoleChart";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Super Admin | BULLOBUILD" };

export default async function SuperAdminPage() {
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: listingCount },
    { count: userCount },
    { count: orderCount },
    { data: orders },
    { data: profiles },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total"),
    supabase.from("profiles").select("role"),
    supabase
      .from("orders")
      .select("id, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const totalRevenue = orders?.reduce((s, o) => s + (o.total ?? 0), 0) ?? 0;

  // Role breakdown for chart
  const roleCount: Record<string, number> = {};
  profiles?.forEach((p) => {
    roleCount[p.role] = (roleCount[p.role] ?? 0) + 1;
  });
  const roleData = Object.entries(roleCount).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign },
    { label: "Products", value: productCount ?? 0, icon: Package },
    { label: "Listings", value: listingCount ?? 0, icon: Store },
    { label: "Users", value: userCount ?? 0, icon: Users },
    { label: "Orders", value: orderCount ?? 0, icon: ShoppingBag },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader label="Super Admin" title="System Overview" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#0B1F3A] border border-white/8 border-t-2 border-t-red-600/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</span>
              <Icon size={15} className="text-red-400/60" />
            </div>
            <p className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-barlow), system-ui" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0B1F3A] border border-white/8 p-6">
          <h2 className="text-sm font-black uppercase text-white tracking-tight mb-6" style={{ fontFamily: "var(--font-barlow), system-ui" }}>
            Users by Role
          </h2>
          <SuperAdminRoleChart data={roleData} />
        </div>

        <div className="bg-[#0B1F3A] border border-white/8">
          <div className="px-5 py-4 border-b border-white/8">
            <h2 className="text-sm font-black uppercase text-white tracking-tight" style={{ fontFamily: "var(--font-barlow), system-ui" }}>
              Recent Global Activity
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {recentActivity?.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-white font-mono">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white font-semibold">{formatPrice(o.total)}</span>
                  <span className={`text-xs capitalize font-medium ${{ pending: "text-yellow-400", paid: "text-blue-400", shipped: "text-purple-400", delivered: "text-green-400", cancelled: "text-red-400" }[o.status as string] ?? "text-gray-400"}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
