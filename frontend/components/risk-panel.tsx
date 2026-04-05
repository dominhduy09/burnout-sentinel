import type { AnalysisResponse } from "@/lib/types";

type Props = {
  result: AnalysisResponse | null;
};

const riskStyles = {
  Low: "bg-emerald-50/40 text-emerald-900 ring-emerald-200/60",
  Moderate: "bg-amber-50/40 text-amber-900 ring-amber-200/60",
  High: "bg-rose-50/40 text-rose-900 ring-rose-200/60"
} as const;

const priorityStyles = {
  high: "border-rose-200/60 bg-rose-50/35 text-rose-900",
  medium: "border-amber-200/60 bg-amber-50/35 text-amber-900",
  low: "border-emerald-200/60 bg-emerald-50/35 text-emerald-900"
} as const;

export function RiskPanel({ result }: Props) {
  if (!result) {
    return (
      <div className="card p-0 shadow-card">
        <div className="relative border-b border-white/50 bg-[linear-gradient(135deg,_rgba(255,255,255,0.66)_0%,_rgba(240,252,246,0.24)_48%,_rgba(255,242,230,0.22)_100%)] px-6 py-5">
          <div className="absolute inset-0 glass-grain" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-600">Weekly Analysis</p>
            <h3 className="mt-3 text-xl font-semibold text-ink">See where the week starts to slip</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Enter a realistic student schedule to surface overload risk, the factors driving it, and the
              first changes worth making.
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="surface-shell p-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="glass-stat">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-600">Tip</p>
                <p className="mt-1 text-sm font-semibold text-ink">Start with presets</p>
              </div>
              <div className="glass-stat">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-600">Then</p>
                <p className="mt-1 text-sm font-semibold text-ink">Adjust sliders</p>
              </div>
              <div className="glass-stat">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-600">Finally</p>
                <p className="mt-1 text-sm font-semibold text-ink">Run analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-0">
        <div className="relative border-b border-white/50 bg-[linear-gradient(135deg,_rgba(255,255,255,0.64)_0%,_rgba(240,252,246,0.22)_48%,_rgba(255,242,230,0.18)_100%)] px-6 py-5">
          <div className="absolute inset-0 glass-grain" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-stone-600">Burnout Risk</p>
              <div className="mt-3 flex items-center gap-3">
                <span className={`glass-pill px-4 py-2 ring-1 ${riskStyles[result.risk_label]}`}>
                  {result.risk_label}
                </span>
                <span className="text-4xl font-semibold tabular-nums tracking-tight text-ink">
                  {result.risk_score}
                </span>
              </div>
            </div>

            <div className="glass-pill px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-700">
              {result.analysis_source === "backend" ? "Live API analysis" : "Built-in demo analysis"}
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-7 text-slate-700">{result.summary}</p>
        </div>
      </div>

      <div className="surface-shell p-1">
        <div className="grid gap-1 p-1 lg:grid-cols-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-ink">What is driving the score?</h3>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
              {result.contributing_factors.map((factor) => (
                <li key={factor} className="glass-stat px-4 py-3 text-sm leading-6 text-slate-800">
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-ink">Recommended next steps</h3>
            <div className="mt-4 space-y-2">
              {result.recommendations.map((recommendation) => (
                <div
                  key={recommendation.title}
                  className={`relative overflow-hidden rounded-2xl border px-4 py-3 backdrop-blur-xl ${priorityStyles[recommendation.priority]}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{recommendation.title}</p>
                    <span className="glass-pill px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-700">
                      {recommendation.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7">{recommendation.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
