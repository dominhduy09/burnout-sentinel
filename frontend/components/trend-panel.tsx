"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { clearSnapshots, loadSnapshots, type RiskSnapshot } from "@/lib/history";

type Props = {
  refreshToken: number;
};

function formatShortDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const TrendPanel = memo(function TrendPanel({ refreshToken }: Props) {
  const [snapshots, setSnapshots] = useState<RiskSnapshot[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setSnapshots(loadSnapshots());
  }, [refreshToken]);

  const data = useMemo(() => {
    return [...snapshots]
      .reverse()
      .map((snapshot) => ({
        label: formatShortDate(snapshot.created_at),
        score: snapshot.risk_score,
        week: snapshot.week_name
      }));
  }, [snapshots]);

  return (
    <div className="card overflow-hidden p-0 shadow-card">
      <div className="panel-header">
        <div className="absolute inset-0 glass-grain" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-ink">Risk trend</h3>
            <p className="mt-2 text-[15px] leading-7 text-slate-700">
              Save snapshots to build a week-by-week burnout risk history.
            </p>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="glass-button rounded-full px-3 py-2 text-xs font-semibold text-ink hover:border-emerald-200/70"
              aria-expanded={!collapsed}
            >
              {collapsed ? "Expand" : "Collapse"}
            </button>
            <button
              type="button"
              onClick={() => {
                clearSnapshots();
                setSnapshots([]);
              }}
              className="glass-button rounded-full px-3 py-2 text-sm font-semibold text-ink hover:border-rose-200/70"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="px-7 py-6">
        {collapsed ? (
          <div className="rounded-2xl border border-white/55 bg-white/20 px-5 py-4 text-[15px] leading-7 text-slate-700 backdrop-blur-xl">
            Trend minimized. Expand to review the risk history chart.
          </div>
        ) : data.length < 2 ? (
          <div className="rounded-2xl border border-white/55 bg-white/20 px-5 py-4 text-[15px] leading-7 text-slate-700 backdrop-blur-xl">
            Save at least two weeks to see a trend line.
          </div>
        ) : (
          <div className="h-[clamp(250px,34vh,360px)] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 8 }}>
                <CartesianGrid stroke="rgba(18, 38, 58, 0.14)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <ReferenceLine y={40} stroke="rgba(245,158,11,0.65)" strokeDasharray="4 4" />
                <ReferenceLine y={70} stroke="rgba(240,125,98,0.65)" strokeDasharray="4 4" />
                <Tooltip
                  cursor={{ stroke: "rgba(18, 38, 58, 0.12)", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.65)",
                    boxShadow: "0 20px 45px rgba(18, 38, 58, 0.16)",
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(18px)"
                  }}
                  labelStyle={{ color: "#0f172a", fontWeight: 700 }}
                  formatter={(value) => [value, "Risk score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#0f172a"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: "rgba(255,255,255,0.8)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
});

