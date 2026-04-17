"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface MonthPoint { label: string; sales: number; revenue: number }
interface ConditionSlice { name: string; value: number }

const COLORS = ["#F2B705", "#D97706", "#7C8C5A", "#C2410C"];

export function SellerAnalyticsCharts({
  monthlyData,
  conditionBreakdown,
}: {
  monthlyData: MonthPoint[];
  conditionBreakdown: ConditionSlice[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-stroke bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-ink-soft">Revenue (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(152,140,124,0.16)" />
            <XAxis dataKey="label" tick={{ fill: "#978c7c", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#978c7c", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #e3dac8", borderRadius: 16 }}
              labelStyle={{ color: "#2b2418", fontWeight: "bold" }}
              itemStyle={{ color: "#F2B705" }}
              formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, "Revenue"]}
            />
            <Line type="monotone" dataKey="revenue" stroke="#F2B705" strokeWidth={2} dot={{ fill: "#F2B705", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-stroke bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-ink-soft">Condition Breakdown</h3>
        {conditionBreakdown.length === 0 ? (
          <div className="flex h-50 items-center justify-center text-sm text-ink-muted">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={conditionBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {conditionBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#ffffff", border: "1px solid #e3dac8", borderRadius: 16 }}
                itemStyle={{ color: "#2b2418" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-[11px] capitalize text-ink-muted">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
