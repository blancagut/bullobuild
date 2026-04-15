"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#F2B705", "#3B82F6", "#EF4444", "#10B981"];

export function SuperAdminRoleChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">No data</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: "#0B1F3A", border: "1px solid rgba(255,255,255,0.1)" }} itemStyle={{ color: "#fff" }} />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: "#9ca3af", fontSize: 11 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
