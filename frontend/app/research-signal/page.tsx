"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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
  page: number;
  page_size: number;
  has_more: boolean;
  signals: ResearchSignalItem[];
};

const PAGE_SIZE = 8;

function mergeSignals(existing: ResearchSignalItem[], incoming: ResearchSignalItem[]) {
  const seen = new Set(existing.map((item) => item.id));
  const additions = incoming.filter((item) => !seen.has(item.id));
  return [...existing, ...additions];
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function safeExternalUrl(url: string, title: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // ignore and fall back
  }

  return `https://search.crossref.org/?q=${encodeURIComponent(title)}`;
}

export default function ResearchSignalPage() {
  const [data, setData] = useState<ResearchSignalResponse | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextPage, setNextPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inFlightRef = useRef(false);

  const loadPage = useCallback(async (page: number, append: boolean) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`/api/research-signal?page=${page}&pageSize=${PAGE_SIZE}`, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Could not load research signals");
      }

      const payload = (await response.json()) as ResearchSignalResponse;

      setData((previous) => {
        if (!append || !previous) {
          return payload;
        }

        return {
          ...payload,
          signals: mergeSignals(previous.signals, payload.signals)
        };
      });

      setHasMore(payload.has_more && payload.signals.length > 0);
      setNextPage(page + 1);
    } catch {
      if (!append) {
        setData(null);
      }
      setHasMore(false);
    } finally {
      inFlightRef.current = false;
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  useEffect(() => {
    if (!sentinelRef.current || loading || loadingMore || !hasMore || !data) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadPage(nextPage, true);
        }
      },
      {
        rootMargin: "320px 0px"
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [data, hasMore, loadPage, loading, loadingMore, nextPage]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 text-ink lg:px-8">
      <div className="surface-soft relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-52 w-52 rounded-full bg-amber-200/35 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="eyebrow">Evidence Feed</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Research Signal</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
              Fresh academic findings to support better weekly planning decisions. This feed updates daily and keeps
              useful links to source material.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs sm:text-sm">
              <span className="chip">Daily refresh</span>
              <span className="chip">Peer-reviewed signals</span>
              <span className="chip">Burnout, stress, sleep</span>
            </div>
          </div>

          <div className="surface-shell p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600">Today at a glance</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="glass-stat">
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Signals</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{data?.signals.length ?? "--"}</p>
              </div>
              <div className="glass-stat">
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Updated</p>
                <p className="mt-1 text-sm font-semibold text-ink">{data ? formatDate(data.updated_at) : "Loading"}</p>
              </div>
              <div className="glass-stat">
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Source</p>
                <p className="mt-1 text-sm font-semibold text-ink">{data?.source === "crossref" ? "Crossref" : "Fallback"}</p>
              </div>
            </div>

            <Link href="/" className="glass-button mt-4 inline-flex w-full items-center justify-center rounded-full px-3 py-2 text-sm font-semibold text-ink hover:border-emerald-200/70">
              Back to planner
            </Link>
          </div>
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
            <div className="surface-shell p-5">
              <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">Highlight quote</p>
                  <blockquote className="mt-2 rounded-2xl border border-white/60 bg-white/35 px-4 py-4 text-sm leading-7 text-slate-700">
                    &ldquo;{data.signals[0]?.title ?? "Reliable evidence helps you plan before overload builds up."}&rdquo;
                  </blockquote>
                </div>

                <div className="glass-stat">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Feed details</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Last update: <span className="font-semibold text-ink">{formatDate(data.updated_at)}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Next refresh: <span className="font-semibold text-ink">{formatDate(data.next_refresh_at)}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Source: <span className="font-semibold text-ink">{data.source === "crossref" ? "Crossref API" : "Local fallback"}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.signals.map((signal) => (
                <article key={signal.id} className="card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="glass-pill glass-pill-mint px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]">
                      {signal.source === "crossref" ? "Crossref" : "Fallback"}
                    </span>
                    {signal.year ? <span className="chip text-xs">{signal.year}</span> : null}
                  </div>

                  <h2 className="mt-3 text-lg font-semibold leading-7 text-ink">{signal.title}</h2>
                  <p className="mt-2 text-sm font-medium text-slate-700">{signal.journal}</p>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Use this source as context for weekly workload, stress, and recovery decisions.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <a
                      href={safeExternalUrl(signal.url, signal.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="glass-pill text-xs font-semibold uppercase tracking-[0.14em] text-ink hover:bg-white/60"
                    >
                      Open source link
                    </a>
                    {signal.doi ? <span className="text-xs text-slate-600">DOI: {signal.doi}</span> : null}
                  </div>
                </article>
              ))}
            </div>

            <div ref={sentinelRef} className="h-1" aria-hidden />

            {loadingMore ? (
              <div className="card p-6 text-sm text-slate-700">Loading more research signals...</div>
            ) : null}

            {!hasMore ? (
              <div className="card p-6 text-sm text-slate-700">You have reached the end of the current research feed.</div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}