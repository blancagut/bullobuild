"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ChartPoint {
  label: string;
  sales: number;
  revenue: number;
}

export function SellerSalesChart({ data }: { data: ChartPoint[] }) {
  const hasData = data.some((d) => d.sales > 0);

  if (!hasData) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-ink-muted">
        No sales data yet — make your first sale!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(152,140,124,0.16)" />
        <XAxis dataKey="label" tick={{ fill: "#978c7c", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#978c7c", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#ffffff", border: "1px solid #e3dac8", borderRadius: 16 }}
          labelStyle={{ color: "#2b2418", fontWeight: "bold" }}
          itemStyle={{ color: "#F2B705" }}
        />
        <Bar dataKey="sales" fill="#F2B705" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
