"use client";

import { memo } from "react";
import type { PlannerFormValues } from "@/lib/types";
import { buildWhatIfSuggestions } from "@/lib/whatif";

type Props = {
  values: PlannerFormValues;
  baselineScore: number;
  onApply: (nextValues: PlannerFormValues) => void;
};

export const WhatIfPanel = memo(function WhatIfPanel({ values, baselineScore, onApply }: Props) {
  const suggestions = buildWhatIfSuggestions(values);

  return (
    <div className="card overflow-hidden p-0 shadow-card">
      <div className="panel-header">
        <div className="absolute inset-0 glass-grain" />
        <div className="relative">
          <h3 className="text-lg font-semibold text-ink">What-if simulator</h3>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            Try a change and see the risk score update instantly. These are the highest-impact moves for this
            week.
          </p>
        </div>
      </div>

      <div className="space-y-3 px-6 py-5">
        {suggestions.length ? (
          suggestions.map((suggestion) => (
            <div key={suggestion.title} className="glass-stat px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{suggestion.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{suggestion.rationale}</p>
                  <ul className="mt-3 space-y-1 text-sm text-slate-700">
                    {suggestion.changes.map((change) => (
                      <li key={`${change.field}-${change.delta}`} className="flex items-center justify-between gap-3">
                        <span className="truncate">{change.label}</span>
                        <span className="shrink-0 font-semibold tabular-nums text-ink">
                          {change.delta > 0 ? "+" : ""}
                          {change.delta}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-stone-600">Risk change</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
                    {baselineScore} → {suggestion.afterScore}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-800">
                    -{suggestion.deltaScore} points
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onApply(suggestion.afterValues)}
                  className="glass-button rounded-full px-3 py-2 text-sm font-semibold text-ink hover:border-emerald-200/70"
                >
                  Apply changes
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/35 px-4 py-3 text-sm text-emerald-900 backdrop-blur-xl">
            Your inputs already look close to the healthy zone. Try small tweaks (sleep +0.5h, +2h buffer) and
            watch the score.
          </div>
        )}
      </div>
    </div>
  );
});

