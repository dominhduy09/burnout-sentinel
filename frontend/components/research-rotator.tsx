"use client";

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

  return (
    <div className="card flex min-h-[190px] flex-col justify-between p-0 shadow-card">
      <div className="panel-header">
        <div className="absolute inset-0 glass-grain" />
        <div className="relative flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Research Signal</p>
          <div className="flex gap-1.5">
            {SLIDES.map((item, itemIndex) => (
              <span
                key={item.title}
                className={`h-1.5 w-6 rounded-full ${itemIndex === index ? "bg-coral" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="space-y-2">
          <span className="glass-pill glass-pill-mint px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]">
            {slide.tag}
          </span>
          <h2 className="text-lg font-semibold leading-7 text-ink">{slide.title}</h2>
          <p className="text-sm leading-6 text-slate-700">{slide.body}</p>
        </div>
      </div>

      <div className="border-t border-white/50 px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-slate-600">
        Source: {slide.source}
      </div>
    </div>
  );
}
