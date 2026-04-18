"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ResearchSignalItem = {
  id: string;
  title: string;
  journal: string;
  year: number | null;
  doi: string | null;
  url: string;
  source: "crossref" | "fallback";
};

type ResearchSignalResponse = {
  updated_at: string;
  next_refresh_at: string;
  source: "crossref" | "fallback";
  signals: ResearchSignalItem[];
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export default function ResearchSignalPage() {
  const [data, setData] = useState<ResearchSignalResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch("/api/research-signal", {
          cache: "no-store"
        });

        if (!response.ok) {
          if (mounted) {
            setData(null);
          }
          return;
        }

        const payload = (await response.json()) as ResearchSignalResponse;
        if (mounted) {
          setData(payload);
        }
      } catch {
        if (mounted) {
          setData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 text-ink lg:px-8">
      <div className="surface-soft p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Evidence Feed</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Research Signal</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
              This page pulls recent burnout and student wellbeing research from an external API and refreshes
              every day. Use it to keep your planning choices grounded in current evidence.
            </p>
          </div>

          <Link href="/" className="glass-pill text-sm text-ink hover:bg-white/60">
            Back to planner
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-xs sm:text-sm">
          <span className="chip">Daily API refresh</span>
          <span className="chip">Academic sources</span>
          <span className="chip">Burnout + sleep + stress</span>
        </div>
      </div>

      <section className="mt-6 space-y-4">
        {loading && (
          <div className="card p-6">
            <p className="text-sm text-slate-700">Loading fresh research signals...</p>
          </div>
        )}

        {!loading && !data && (
          <div className="card p-6">
            <p className="text-sm text-slate-700">
              Research feed is temporarily unavailable. Please try again in a minute.
            </p>
          </div>
        )}

        {data && (
          <>
            <div className="card p-5 text-xs uppercase tracking-[0.16em] text-slate-600">
              Last update: {formatDate(data.updated_at)} | Next refresh: {formatDate(data.next_refresh_at)} | Source: {" "}
              {data.source === "crossref" ? "Crossref API" : "Local fallback"}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {data.signals.map((signal) => (
                <article key={signal.id} className="card p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="glass-pill glass-pill-mint px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]">
                      {signal.source}
                    </span>
                    {signal.year && <span className="chip text-xs">{signal.year}</span>}
                  </div>

                  <h2 className="mt-3 text-lg font-semibold leading-7 text-ink">{signal.title}</h2>
                  <p className="mt-2 text-sm text-slate-700">{signal.journal}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <a
                      href={signal.url}
                      target="_blank"
                      rel="noreferrer"
                      className="glass-pill text-xs font-semibold uppercase tracking-[0.14em] text-ink hover:bg-white/60"
                    >
                      Open source
                    </a>
                    {signal.doi && <span className="text-xs text-slate-600">DOI: {signal.doi}</span>}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}