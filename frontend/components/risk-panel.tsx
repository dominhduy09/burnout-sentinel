import type { AnalysisResponse } from "@/lib/types";

type Props = {
  result: AnalysisResponse | null;
};

const riskStyles = {
  Low: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Moderate: "bg-amber-100 text-amber-800 ring-amber-200",
  High: "bg-rose-100 text-rose-800 ring-rose-200"
} as const;

const priorityStyles = {
  high: "border-rose-200 bg-rose-50 text-rose-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-emerald-200 bg-emerald-50 text-emerald-800"
} as const;

export function RiskPanel({ result }: Props) {
  if (!result) {
    return (
      <div className="surface-soft flex min-h-[260px] items-center justify-center p-6 shadow-card">
        <div className="max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Weekly Analysis</p>
          <h3 className="mt-3 text-xl font-semibold text-ink">See where the week starts to slip</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter a realistic student schedule to surface overload risk, the factors driving it, and the
            first changes worth making.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-stone-500">Burnout Risk</p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ring-1 ${
                  riskStyles[result.risk_label]
                }`}
              >
                {result.risk_label}
              </span>
              <span className="text-4xl font-semibold text-ink">{result.risk_score}</span>
            </div>
            <div className="mt-3 inline-flex rounded-full border border-stone-200 bg-[#fffaf4] px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-600">
              {result.analysis_source === "backend" ? "Live API analysis" : "Built-in demo analysis"}
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm leading-7 text-slate-700">{result.summary}</p>
      </div>

      <div className="surface-shell">
        <div className="grid gap-1 lg:grid-cols-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-ink">What is driving the score?</h3>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
              {result.contributing_factors.map((factor) => (
                <li key={factor} className="rounded-2xl bg-[linear-gradient(180deg,_rgba(242,247,245,0.9)_0%,_rgba(249,243,235,0.78)_100%)] px-4 py-3">
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
                  className={`rounded-2xl border px-4 py-3 ${priorityStyles[recommendation.priority]}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{recommendation.title}</p>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
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
