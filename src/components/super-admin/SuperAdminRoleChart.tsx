"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#F2B705", "#D97706", "#C2410C", "#7C8C5A"];

export function SuperAdminRoleChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) {
    return <div className="flex h-50 items-center justify-center text-sm text-ink-muted">No data</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e3dac8", borderRadius: 16 }} itemStyle={{ color: "#2b2418" }} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-[11px] text-ink-muted">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
