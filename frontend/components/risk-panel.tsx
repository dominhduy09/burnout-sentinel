import type { AnalysisResponse } from "@/lib/types";

type Props = {
  result: AnalysisResponse | null;
  celebrateToken?: number;
  moderateToken?: number;
  highToken?: number;
};

const riskStyles = {
  Low: "bg-emerald-50/40 text-emerald-900 ring-emerald-200/60",
  Moderate: "bg-amber-50/40 text-amber-900 ring-amber-200/60",
  High: "bg-rose-50/40 text-rose-900 ring-rose-200/60"
} as const;

const riskCopy = {
  Low: {
    headline: "Balanced week",
    body: "Your workload and recovery look reasonably aligned. Protect sleep and buffer time as deadlines change."
  },
  Moderate: {
    headline: "Starting to compress",
    body: "This week is trending heavy. Small changes (reduce compression, protect sleep, add buffer time) can prevent a slide into overload."
  },
  High: {
    headline: "Overload risk",
    body: "This week is likely to feel crowded and reactive. The best first move is to reduce compression and add recovery time before performance suffers."
  }
} as const;

const priorityStyles = {
  high: "border-rose-200/60 bg-rose-50/35 text-rose-900",
  medium: "border-amber-200/60 bg-amber-50/35 text-amber-900",
  low: "border-emerald-200/60 bg-emerald-50/35 text-emerald-900"
} as const;

const breakdownStyles = {
  risk: {
    pill: "bg-rose-50/40 text-rose-900 ring-rose-200/60",
    bar: "from-rose-500/80 to-rose-300/30"
  },
  multiplier: {
    pill: "bg-violet-50/40 text-violet-900 ring-violet-200/60",
    bar: "from-violet-500/80 to-violet-300/30"
  },
  protective: {
    pill: "bg-emerald-50/40 text-emerald-900 ring-emerald-200/60",
    bar: "from-emerald-500/80 to-emerald-300/30"
  }
} as const;

function ReactionBurst({ variant }: { variant: "low" | "moderate" | "high" }) {
  const count = variant === "low" ? 18 : variant === "high" ? 16 : 14;

  return (
    <div aria-hidden className={`reaction-burst reaction-burst--${variant}`}>
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} style={{ ["--i" as never]: index } as React.CSSProperties} />
      ))}
    </div>
  );
}

function MethodDetails() {
  return (
    <details className="mt-5 rounded-2xl border border-white/55 bg-white/20 px-4 py-3 text-sm text-slate-700 backdrop-blur-xl">
      <summary className="cursor-pointer select-none text-xs font-semibold uppercase tracking-[0.22em] text-stone-700">
        How the risk level works
      </summary>
      <div className="mt-3 space-y-3 leading-6">
        <p>
          This is an explainable demo score (0–100) based on workload + recovery signals. Recovery factors can
          also amplify risk (for example, low sleep increases the impact of high workload). It is not a medical
          diagnosis.
        </p>
        <div className="surface-shell p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="glass-stat">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-600">Low</p>
              <p className="mt-1 text-sm font-semibold text-ink">0–39</p>
            </div>
            <div className="glass-stat">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-600">Moderate</p>
              <p className="mt-1 text-sm font-semibold text-ink">40–69</p>
            </div>
            <div className="glass-stat">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-600">High</p>
              <p className="mt-1 text-sm font-semibold text-ink">70–100</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-700">References</p>
          <ul className="list-disc space-y-1 pl-5 text-[13px] text-slate-700">
            <li>
              WHO ICD-11: burn-out as an occupational phenomenon.{" "}
              <a
                className="underline decoration-emerald-300/70 underline-offset-2 hover:text-ink"
                href="https://www.who.int/standards/classifications/frequently-asked-questions/burn-out-an-occupational-phenomenon"
                target="_blank"
                rel="noreferrer"
              >
                Read
              </a>
              .
            </li>
            <li>
              Kristensen et al. (2005): Copenhagen Burnout Inventory (CBI).{" "}
              <a
                className="underline decoration-emerald-300/70 underline-offset-2 hover:text-ink"
                href="https://researchprofiles.ku.dk/en/publications/the-copenhagen-burnout-inventory-a-new-tool-for-the-assessment-of/"
                target="_blank"
                rel="noreferrer"
              >
                Abstract
              </a>
              .
            </li>
          </ul>
        </div>
      </div>
    </details>
  );
}

function ScoreBreakdown({ result }: { result: AnalysisResponse }) {
  const items = [...result.score_breakdown].sort((a, b) => b.points - a.points);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-ink">How the score adds up</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Each item shows the points added to the 0–100 score (plus amplifiers that increase the baseline).
      </p>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item.key} className="glass-stat px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`glass-pill px-3 py-1 text-[10px] uppercase tracking-[0.2em] ring-1 ${breakdownStyles[item.direction].pill}`}
                  >
                    {item.direction}
                  </span>
                  <p className="font-semibold text-ink">{item.label}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.detail}</p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-600">Points</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{item.points}</p>
              </div>
            </div>

            <div className="mt-3 h-2 rounded-full bg-white/30">
              <div
                className={`h-2 rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out motion-reduce:transition-none ${breakdownStyles[item.direction].bar}`}
                style={{ width: `${item.percent_of_score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RiskPanel({ result, celebrateToken, moderateToken, highToken }: Props) {
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

          <MethodDetails />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-flat p-0">
        <div className="panel-header-flat">
          {result.risk_label === "Low" && celebrateToken ? (
            <ReactionBurst key={`low-${celebrateToken}`} variant="low" />
          ) : null}
          {result.risk_label === "Moderate" && moderateToken ? (
            <ReactionBurst key={`moderate-${moderateToken}`} variant="moderate" />
          ) : null}
          {result.risk_label === "High" && highToken ? (
            <ReactionBurst key={`high-${highToken}`} variant="high" />
          ) : null}
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
              <p className="mt-3 text-sm font-semibold text-ink">{riskCopy[result.risk_label].headline}</p>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-700">{riskCopy[result.risk_label].body}</p>
            </div>

            <div className="glass-pill px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-700">
              {result.analysis_source === "backend" ? "Live API analysis" : "Built-in demo analysis"}
            </div>
          </div>
        </div>

        <div className="panel-body">
          <p className="text-sm leading-7 text-slate-700">{result.summary}</p>
          <MethodDetails />
        </div>
      </div>

      <div className="surface-shell p-1">
        <div className="grid gap-1 p-1 lg:grid-cols-2">
          <ScoreBreakdown result={result} />

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
