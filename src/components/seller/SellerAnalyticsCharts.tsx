"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface MonthPoint { label: string; sales: number; revenue: number }
interface ConditionSlice { name: string; value: number }

const COLORS = ["#F2B705", "#3B82F6", "#10B981", "#EF4444"];

export function SellerAnalyticsCharts({
  monthlyData,
  conditionBreakdown,
}: {
  monthlyData: MonthPoint[];
  conditionBreakdown: ConditionSlice[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[#0B1F3A] border border-white/8 p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Revenue (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0B1F3A", border: "1px solid rgba(255,255,255,0.1)" }}
              labelStyle={{ color: "#fff", fontWeight: "bold" }}
              itemStyle={{ color: "#F2B705" }}
              formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, "Revenue"]}
            />
            <Line type="monotone" dataKey="revenue" stroke="#F2B705" strokeWidth={2} dot={{ fill: "#F2B705", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#0B1F3A] border border-white/8 p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Condition Breakdown</h3>
        {conditionBreakdown.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={conditionBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {conditionBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#0B1F3A", border: "1px solid rgba(255,255,255,0.1)" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: "#9ca3af", fontSize: 11, textTransform: "capitalize" }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
