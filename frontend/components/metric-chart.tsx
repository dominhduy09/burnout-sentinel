"use client";

import { memo } from "react";
import type { Insight } from "@/lib/types";

const DOTS: Record<Insight["status"], string> = {
  healthy: "bg-emerald-400",
  watch: "bg-amber-400",
  risk: "bg-rose-400"
};

type Props = {
  insights: Insight[];
};

type MetricSpec =
  | {
      kind: "higher_is_better";
      unit: string;
      scaleMin: number;
      scaleMax: number;
      warningMin: number;
      healthyMin: number;
      targetLabel: string;
    }
  | {
      kind: "lower_is_better";
      unit: string;
      scaleMin: number;
      scaleMax: number;
      healthyMax: number;
      warningMax: number;
      targetLabel: string;
    };

const METRIC_SPECS: Record<string, MetricSpec> = {
  "Task Load": {
    kind: "lower_is_better",
    unit: "tasks",
    scaleMin: 0,
    scaleMax: 40,
    healthyMax: 16,
    warningMax: 22,
    targetLabel: "Target ≤ 16 tasks"
  },
  "Priority Tasks": {
    kind: "lower_is_better",
    unit: "tasks",
    scaleMin: 0,
    scaleMax: 12,
    healthyMax: 3,
    warningMax: 5,
    targetLabel: "Target ≤ 3 critical tasks"
  },
  "Work Hours": {
    kind: "lower_is_better",
    unit: "hours",
    scaleMin: 0,
    scaleMax: 60,
    healthyMax: 28,
    warningMax: 40,
    targetLabel: "Target ≤ 28 hours/week"
  },
  Sleep: {
    kind: "higher_is_better",
    unit: "hours/night",
    scaleMin: 4,
    scaleMax: 10,
    warningMin: 6.5,
    healthyMin: 7.5,
    targetLabel: "Target ≥ 7.5 hours/night"
  },
  "Free Time": {
    kind: "higher_is_better",
    unit: "hours/week",
    scaleMin: 0,
    scaleMax: 30,
    warningMin: 10,
    healthyMin: 16,
    targetLabel: "Target ≥ 16 hours/week"
  }
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function percent(value: number, min: number, max: number) {
  if (!Number.isFinite(value) || max <= min) return 0;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

function buildGradient(spec: MetricSpec) {
  const green = "rgba(16,185,129,0.55)";
  const amber = "rgba(245,158,11,0.55)";
  const rose = "rgba(240,125,98,0.6)";

  if (spec.kind === "lower_is_better") {
    const healthyStop = percent(spec.healthyMax, spec.scaleMin, spec.scaleMax);
    const warningStop = percent(spec.warningMax, spec.scaleMin, spec.scaleMax);
    return `linear-gradient(90deg, ${green} 0%, ${green} ${healthyStop}%, ${amber} ${healthyStop}%, ${amber} ${warningStop}%, ${rose} ${warningStop}%, ${rose} 100%)`;
  }

  const warningStop = percent(spec.warningMin, spec.scaleMin, spec.scaleMax);
  const healthyStop = percent(spec.healthyMin, spec.scaleMin, spec.scaleMax);
  return `linear-gradient(90deg, ${rose} 0%, ${rose} ${warningStop}%, ${amber} ${warningStop}%, ${amber} ${healthyStop}%, ${green} ${healthyStop}%, ${green} 100%)`;
}

export const MetricChart = memo(function MetricChart({ insights }: Props) {
  return (
    <div className="card overflow-hidden p-0 shadow-card">
      <div className="panel-header">
        <div className="absolute inset-0 glass-grain" />
        <div className="relative">
          <h3 className="text-xl font-semibold text-ink">Workload Snapshot</h3>
          <p className="mt-2 text-[15px] leading-7 text-slate-700">
            These gauges show which metrics are in the healthy zone, watch zone, or risk zone.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
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

      <div className="space-y-4 px-7 py-6">
        {insights.map((insight) => {
          const spec = METRIC_SPECS[insight.label];
          if (!spec) {
            return (
              <div key={insight.label} className="glass-stat px-4 py-3">
                <p className="font-semibold text-ink">{insight.label}</p>
                <p className="mt-1 text-sm text-slate-700">Value: {insight.value}</p>
              </div>
            );
          }

          const marker = percent(insight.value, spec.scaleMin, spec.scaleMax);
          const gradient = buildGradient(spec);

          return (
            <div key={insight.label} className="glass-stat px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${DOTS[insight.status]}`} />
                    <p className="font-semibold text-ink">{insight.label}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{spec.targetLabel}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-stone-600">Current</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
                    {insight.value} <span className="text-sm font-semibold text-stone-600">{spec.unit}</span>
                  </p>
                </div>
              </div>

              <div className="relative mt-3 h-3 rounded-full bg-white/30 shadow-inner">
                <div className="absolute inset-0 rounded-full" style={{ background: gradient }} />
                <div
                  className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-ink/80 shadow-sm"
                  style={{ left: `calc(${marker}% - 2px)` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-stone-400">
                <span>{spec.scaleMin}</span>
                <span>{spec.scaleMax}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
