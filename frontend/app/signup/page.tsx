"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Signup failed.");
      }

      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-10 text-slate-900 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-sky-300/28 blur-3xl" />
        <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-emerald-300/28 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-amber-200/24 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="relative overflow-hidden rounded-[34px] border border-white/65 bg-white/22 shadow-[0_38px_90px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
          <div className="glass-grain pointer-events-none absolute inset-0" />
          <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
            <section className="relative border-b border-white/50 bg-[linear-gradient(145deg,_rgba(59,130,246,0.18)_0%,_rgba(16,185,129,0.16)_56%,_rgba(255,255,255,0.12)_100%)] px-6 py-7 sm:px-8 sm:py-8 lg:border-b-0 lg:border-r lg:border-white/50 lg:px-9 lg:py-10">
              <p className="eyebrow">Liquid Glass Signup</p>
              <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-[2.1rem]">
                Create your planner profile in seconds
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-700 sm:text-[15px]">
                Start with your name and email to create a local session profile and continue with personalized planning.
              </p>

              <div className="mt-7 space-y-3">
                <div className="glass-pill w-fit text-xs text-sky-900">No password setup needed</div>
                <div className="glass-pill w-fit text-xs text-emerald-900">Secure cookie session</div>
                <div className="glass-pill w-fit text-xs text-amber-900">You can logout anytime</div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                <Link
                  href="/"
                  className="glass-button inline-flex items-center justify-center rounded-full border border-white/75 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200/70"
                >
                  Back to planner
                </Link>
                <Link
                  href="/login"
                  className="glass-button inline-flex items-center justify-center rounded-full border border-emerald-200/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.85)_0%,_rgba(236,253,245,0.72)_100%)] px-4 py-2 text-sm font-semibold text-emerald-900"
                >
                  I already have access
                </Link>
              </div>
            </section>

            <section className="relative p-6 sm:p-8 lg:p-9">
              <div className="pointer-events-none absolute left-8 top-8 h-14 w-14 rounded-full border border-white/40 bg-white/25" />
              <div className="pointer-events-none absolute bottom-7 right-8 h-20 w-20 rounded-full border border-white/40 bg-white/18" />

              <form onSubmit={onSubmit} className="relative space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-ink">Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="glass-input mt-2 h-11 w-full px-3"
                    placeholder="Your name"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-ink">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="glass-input mt-2 h-11 w-full px-3"
                    placeholder="you@school.edu"
                  />
                </label>

                {error ? (
                  <div className="rounded-2xl border border-rose-200/60 bg-rose-50/40 px-4 py-3 text-sm text-rose-900 backdrop-blur-xl">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="glass-button inline-flex w-full items-center justify-center rounded-full border border-sky-200/70 bg-[linear-gradient(135deg,_rgba(14,165,233,0.95)_0%,_rgba(16,185,129,0.9)_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(14,165,233,0.24)] transition hover:shadow-[0_18px_40px_rgba(16,185,129,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Creating profile..." : "Sign up"}
                </button>

                <p className="pt-1 text-center text-xs text-slate-600">
                  Already have access?{" "}
                  <Link href="/login" className="font-semibold text-sky-700 underline decoration-sky-300/80 underline-offset-2">
                    Log in
                  </Link>
                </p>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
