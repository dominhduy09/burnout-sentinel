"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { Insight } from "@/lib/types";

const COLORS: Record<Insight["status"], string> = {
  healthy: "#1d8f6e",
  watch: "#f59e0b",
  risk: "#f07d62"
};

type Props = {
  insights: Insight[];
};

export function MetricChart({ insights }: Props) {
  return (
    <div className="surface-soft overflow-hidden p-6 shadow-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-ink">Workload Snapshot</h3>
        <p className="text-sm leading-6 text-slate-600">
          These metrics help explain why the current week looks manageable or overloaded.
        </p>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={insights} margin={{ top: 8, right: 16, left: -12, bottom: 16 }}>
            <CartesianGrid stroke="#dbe5ea" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(18, 38, 58, 0.04)" }}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid #dbe5ea",
                boxShadow: "0 20px 45px rgba(18, 38, 58, 0.12)"
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {insights.map((entry) => (
                <Cell key={entry.label} fill={COLORS[entry.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
