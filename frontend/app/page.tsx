import { PlannerForm } from "@/components/planner-form";
import { AmbientBackground } from "@/components/ambient-background";
import ResearchRotator from "@/components/research-rotator";
import WelcomeOverlay from "@/components/welcome-overlay";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden text-slate-900 transition-colors">
      <WelcomeOverlay />
      <AmbientBackground />

      <section className="relative border-b border-white/50 backdrop-blur-xl">
        <div className="relative mx-auto w-full max-w-[94rem] rounded-[32px] border border-white/50 bg-white/18 px-5 py-6 shadow-card backdrop-blur-xl sm:px-6 sm:py-7 lg:px-10 lg:py-8 2xl:px-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.28fr)_minmax(360px,0.72fr)] lg:gap-8 xl:grid-cols-[minmax(0,1.32fr)_minmax(380px,0.68fr)]">
          <div className="min-w-0 max-w-2xl space-y-5">
            <p className="eyebrow">UAB Student Wellness Concept</p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-[2.65rem] sm:leading-[1.08] lg:text-[3.05rem] lg:leading-[1.04]">
              A planner that catches burnout before the week gets out of control.
            </h1>
            <p className="reading-copy max-w-xl text-sm sm:text-[15px] lg:text-base">
              Built for students dealing with packed schedules, overlapping deadlines, work, labs, clinicals,
              and personal responsibilities. The planner translates one busy week into a clearer picture of
              overload, recovery, and what to change first.
            </p>

            <div className="flex flex-wrap gap-2.5 text-xs sm:text-sm">
              <span className="chip">Weekly workload analysis</span>
              <span className="chip">Burnout risk scoring</span>
              <span className="chip">Personalized planning advice</span>
            </div>
          </div>

          <ResearchRotator />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[94rem] px-5 py-8 sm:px-6 lg:px-10 lg:py-10 2xl:px-12">
        <PlannerForm />
      </section>

      <footer className="relative mx-auto w-full max-w-[94rem] px-5 pb-12 pt-4 sm:px-6 lg:px-10 2xl:px-12">
        <div className="surface-shell p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-600">Information</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                Burnout Sentinel is a student wellness concept focused on early overload detection through planning,
                recovery, and explainable risk signals.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                <span>Created by</span>
                <a
                  className="font-medium text-ink underline decoration-emerald-300/70 underline-offset-2 hover:decoration-emerald-400/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                  href="https://bio.link/dmduy"
                  target="_blank"
                  rel="noreferrer"
                >
                  Minh Duy Do
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/research-signal"
                className="glass-button inline-flex min-w-[8.5rem] flex-1 items-center justify-center rounded-full border border-emerald-200/60 bg-[linear-gradient(135deg,_rgba(255,255,255,0.88)_0%,_rgba(236,253,245,0.72)_100%)] px-3.5 py-2 text-xs font-semibold text-emerald-900 shadow-[0_10px_22px_rgba(16,185,129,0.12)] transition hover:border-emerald-300/70 hover:shadow-[0_12px_26px_rgba(16,185,129,0.16)]"
              >
                Read research
              </Link>
              <a
                className="glass-button inline-flex min-w-[8.5rem] flex-1 items-center justify-center rounded-full border border-amber-200/60 bg-[linear-gradient(135deg,_rgba(255,255,255,0.88)_0%,_rgba(255,247,237,0.72)_100%)] px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-[0_10px_22px_rgba(245,158,11,0.12)] transition hover:border-amber-300/70 hover:shadow-[0_12px_26px_rgba(245,158,11,0.16)]"
                href="mailto:dominhduy09@gmail.com?subject=Burnout%20Sentinel%20Feedback"
              >
                Send feedback
              </a>
              <a
                className="glass-button inline-flex min-w-[8.5rem] flex-1 items-center justify-center rounded-full border border-sky-200/60 bg-[linear-gradient(135deg,_rgba(255,255,255,0.88)_0%,_rgba(239,246,255,0.72)_100%)] px-3.5 py-2 text-xs font-semibold text-sky-900 shadow-[0_10px_22px_rgba(59,130,246,0.12)] transition hover:border-sky-300/70 hover:shadow-[0_12px_26px_rgba(59,130,246,0.16)]"
                href="https://github.com/sponsors/dominhduy09"
                target="_blank"
                rel="noreferrer"
              >
                Donate
              </a>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/50 pt-3 text-xs text-slate-600">
            <span>Thanks for supporting student wellbeing projects.</span>
            <a
              className="glass-pill w-fit text-ink transition hover:bg-white/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
              href="https://github.com/dominhduy09/burnout-sentinel"
              target="_blank"
              rel="noreferrer"
            >
              GitHub project
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
