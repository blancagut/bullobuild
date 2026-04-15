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
      <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
        No sales data yet — make your first sale!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#0B1F3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 0 }}
          labelStyle={{ color: "#fff", fontWeight: "bold" }}
          itemStyle={{ color: "#F2B705" }}
        />
        <Bar dataKey="sales" fill="#F2B705" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
