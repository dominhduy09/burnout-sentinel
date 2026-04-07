"use client";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10 text-slate-900 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-emerald-200/24 blur-[110px]" />
        <div className="absolute right-[-8rem] top-[3rem] h-[22rem] w-[22rem] rounded-full bg-amber-200/26 blur-[95px]" />
        <div className="absolute left-1/2 top-[45%] h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/55 blur-[120px]" />
        <div className="absolute inset-0 glass-grain" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <div className="card p-0">
          <div className="panel-header">
            <div className="absolute inset-0 glass-grain" />
            <div className="relative">
              <p className="eyebrow">Something went wrong</p>
              <h1 className="mt-2 text-2xl font-semibold text-ink">The planner hit an error while loading.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Try again. If it keeps happening, copy the error details below and send them here.
              </p>
            </div>
          </div>

          <div className="panel-body space-y-4">
            <button
              type="button"
              onClick={() => reset()}
              className="glass-button glass-button-ink inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              Reload
            </button>

            <details className="surface-shell p-4">
              <summary className="cursor-pointer select-none text-xs font-semibold uppercase tracking-[0.22em] text-stone-700">
                Error details
              </summary>
              <pre className="mt-3 whitespace-pre-wrap break-words rounded-2xl border border-white/60 bg-white/35 p-4 text-xs text-slate-800">
                {error?.message}
                {error?.digest ? `\nDigest: ${error.digest}` : ""}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}

