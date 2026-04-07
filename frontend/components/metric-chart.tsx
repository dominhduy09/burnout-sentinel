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

const DOTS: Record<Insight["status"], string> = {
  healthy: "bg-emerald-400",
  watch: "bg-amber-400",
  risk: "bg-rose-400"
};

type Props = {
  insights: Insight[];
};

export function MetricChart({ insights }: Props) {
  return (
    <div className="card overflow-hidden p-0 shadow-card">
      <div className="panel-header">
        <div className="absolute inset-0 glass-grain" />
        <div className="relative">
          <h3 className="text-lg font-semibold text-ink">Workload Snapshot</h3>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            These metrics help explain why the current week looks manageable or overloaded.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {insights.map((insight) => (
              <div
                key={insight.label}
                className="glass-pill gap-2 px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                <span className={`h-2 w-2 rounded-full ${DOTS[insight.status]}`} />
                <span className="text-slate-700">{insight.label}</span>
                <span className="tabular-nums text-ink">{insight.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[260px] w-full px-6 py-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={insights} margin={{ top: 8, right: 16, left: -12, bottom: 18 }}>
            <CartesianGrid stroke="rgba(18, 38, 58, 0.14)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#475569", fontSize: 12 }}
              interval={0}
              angle={-12}
              textAnchor="end"
              tickMargin={8}
              height={52}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgba(18, 38, 58, 0.04)" }}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.65)",
                boxShadow: "0 20px 45px rgba(18, 38, 58, 0.16)",
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(18px)"
              }}
              labelStyle={{ color: "#0f172a", fontWeight: 700 }}
              formatter={(value) => [value, "Value"]}
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
