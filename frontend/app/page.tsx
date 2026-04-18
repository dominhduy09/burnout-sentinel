import { PlannerForm } from "@/components/planner-form";
import { AmbientBackground } from "@/components/ambient-background";
import ResearchRotator from "@/components/research-rotator";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden text-slate-900 transition-colors">
      <AmbientBackground />

      <section className="relative border-b border-white/50 backdrop-blur-xl">
        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)] lg:px-8 lg:py-12">
          <div className="min-w-0 max-w-3xl space-y-6">
            <p className="eyebrow">UAB Student Wellness Concept</p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[3.2rem] lg:leading-[1.06]">
              A planner that catches burnout before the week gets out of control.
            </h1>
            <p className="reading-copy max-w-2xl text-sm sm:text-base">
              Built for students dealing with packed schedules, overlapping deadlines, work, labs, clinicals,
              and personal responsibilities. The planner translates one busy week into a clearer picture of
              overload, recovery, and what to change first.
            </p>

            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <span className="chip">Weekly workload analysis</span>
              <span className="chip">Burnout risk scoring</span>
              <span className="chip">Personalized planning advice</span>
            </div>
          </div>

          <ResearchRotator />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
        <PlannerForm />
      </section>

      <footer className="relative mx-auto flex max-w-7xl flex-col gap-3 px-6 pb-12 pt-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-slate-600">Credits:</span>
          <a
            className="font-medium text-ink underline decoration-emerald-300/70 underline-offset-2 hover:decoration-emerald-400/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            href="https://bio.link/dmduy"
            target="_blank"
            rel="noreferrer"
          >
            Minh Duy Do
          </a>
        </div>
        <a
          className="glass-pill w-fit text-ink transition hover:bg-white/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
          href="https://github.com/dominhduy09/burnout-sentinel"
          target="_blank"
          rel="noreferrer"
        >
          GitHub project
        </a>
      </footer>
    </main>
  );
}
