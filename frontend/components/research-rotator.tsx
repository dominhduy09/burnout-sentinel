"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    tag: "WHO",
    title: "Unmanaged chronic stress is the danger signal.",
    body: 'Burnout is linked to chronic stress that has "not been successfully managed."',
    source: "World Health Organization"
  },
  {
    tag: "Research",
    title: "Burnout is not rare in high-pressure student settings.",
    body: "A meta-analysis reported 23.0% pooled burnout prevalence among nursing students, with emotional exhaustion at 47.1%.",
    source: "2022 meta-analysis"
  },
  {
    tag: "Research",
    title: "Burnout can hurt both learning and wellbeing.",
    body: "A 2025 review linked burnout in nursing students with poorer academic performance and psychological distress.",
    source: "2025 systematic review"
  },
  {
    tag: "NIH",
    title: "Sleep loss makes overload harder to notice and manage.",
    body: "NIH notes that sleep deficiency can interfere with school, daily functioning, attention, and decision-making.",
    source: "National Institutes of Health"
  }
];

export default function ResearchRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const slide = SLIDES[index];

  function showNextSlide() {
    setIndex((current) => (current + 1) % SLIDES.length);
  }

  return (
    <div className="relative flex h-[250px] flex-col overflow-hidden rounded-[30px] border border-white/60 bg-white/28 shadow-[0_20px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:h-[258px] lg:h-[250px]">
      <button
        type="button"
        onClick={showNextSlide}
        className="panel-header border-white/40 bg-[linear-gradient(135deg,_rgba(255,255,255,0.74)_0%,_rgba(246,252,249,0.48)_48%,_rgba(255,246,236,0.36)_100%)] px-6 py-4 text-left transition hover:bg-[linear-gradient(135deg,_rgba(255,255,255,0.84)_0%,_rgba(246,252,249,0.58)_48%,_rgba(255,246,236,0.44)_100%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
      >
        <div className="absolute inset-0 glass-grain" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Research Signal</p>
            <span className="glass-pill glass-pill-mint px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]">
              {slide.tag}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {SLIDES.map((item, itemIndex) => (
                  <span
                    key={item.title}
                    className={`h-1.5 w-6 rounded-full ${itemIndex === index ? "bg-coral" : "bg-white/40"}`}
                  />
                ))}
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Click</span>
            </div>
            <div className="group flex items-center gap-2">
              <span className="max-w-0 overflow-hidden whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-slate-500 opacity-0 transition-all duration-200 group-hover:max-w-[120px] group-hover:opacity-100">
                Go to daily feed
              </span>
              <Link
                href="/research-signal"
                aria-label="Open daily feed"
                title="Open daily feed"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200/70 bg-white/75 text-ink shadow-sm transition hover:bg-white hover:border-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
              >
                ↗
              </Link>
            </div>
          </div>
        </div>
      </button>

      <div className="flex min-h-0 flex-1 items-center px-6 py-4">
        <div className="min-h-0 space-y-4 overflow-hidden">
          <h2 className="text-lg font-semibold leading-8 text-ink">{slide.title}</h2>
          <p className="text-sm leading-7 text-slate-700">{slide.body}</p>
        </div>
      </div>

      <div className="border-t border-white/50 bg-white/30 px-6 py-4 text-[11px] uppercase tracking-[0.18em] text-slate-600">
        <div className="flex items-center justify-between gap-2">
          <span>Source: {slide.source}</span>
        </div>
      </div>
    </div>
  );
}
