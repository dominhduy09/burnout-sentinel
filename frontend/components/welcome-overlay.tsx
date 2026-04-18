"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "burnout-sentinel:welcome-dismissed:v1";

export default function WelcomeOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  function closeWelcome() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors and still allow closing the overlay.
    }

    setOpen(false);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.24),rgba(15,23,42,0.72))] backdrop-blur-md"
        onClick={closeWelcome}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(140deg,_rgba(255,255,255,0.96)_0%,_rgba(240,253,250,0.88)_48%,_rgba(239,246,255,0.88)_100%)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-sky-200/45 blur-3xl" />

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">Welcome</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
            Burnout Sentinel helps you spot overload before the week gets out of control.
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
            Enter your weekly workload and recovery signals, run the analysis, and use the dashboard to decide what to
            adjust first.
          </p>

          <div className="mt-5 grid gap-2.5 text-xs sm:grid-cols-3">
            <span className="glass-pill justify-center text-emerald-800">Risk score</span>
            <span className="glass-pill justify-center text-amber-800">What-if planning</span>
            <span className="glass-pill justify-center text-sky-800">Research signals</span>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={closeWelcome}
              className="glass-button inline-flex items-center justify-center rounded-full border border-emerald-300/70 bg-[linear-gradient(135deg,_rgba(16,185,129,0.95)_0%,_rgba(14,165,233,0.9)_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(16,185,129,0.24)] transition hover:shadow-[0_18px_40px_rgba(14,165,233,0.28)]"
            >
              Start planning
            </button>

            <button
              type="button"
              onClick={closeWelcome}
              className="glass-button inline-flex items-center justify-center rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200/70"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
