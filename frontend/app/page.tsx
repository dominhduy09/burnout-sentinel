import { PlannerForm } from "@/components/planner-form";
import ResearchRotator from "@/components/research-rotator";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-slate-900 transition-colors">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-emerald-200/32 blur-[110px]" />
        <div className="absolute right-[-8rem] top-[3rem] h-[22rem] w-[22rem] rounded-full bg-amber-200/34 blur-[95px]" />
        <div className="absolute bottom-[-12rem] left-[24%] h-[30rem] w-[30rem] rounded-full bg-teal-200/22 blur-[120px]" />
        <div className="absolute left-[52%] top-[-6rem] h-[18rem] w-[18rem] rounded-full bg-sky-200/18 blur-[95px]" />
        <div className="absolute left-1/2 top-[42%] h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/55 blur-[120px]" />
        <div className="absolute inset-0 glass-grain" />
      </div>

      <section className="relative border-b border-white/50 backdrop-blur-xl">
        <div className="relative mx-auto grid max-w-7xl gap-5 px-6 py-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,360px)] lg:px-8 lg:py-6">
          <div className="max-w-3xl">
            <p className="eyebrow">UAB Student Wellness Concept</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              A planner that catches burnout before the week gets out of control.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
              Built for students dealing with packed schedules, overlapping deadlines, work, labs, clinicals,
              and personal responsibilities. The planner translates one busy week into a clearer picture of
              overload, recovery, and what to change first.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs sm:text-sm">
              <span className="chip">Weekly workload analysis</span>
              <span className="chip">Burnout risk scoring</span>
              <span className="chip">Personalized planning advice</span>
            </div>
          </div>

          <ResearchRotator />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4 lg:px-8 lg:py-4">
        <PlannerForm />
      </section>
    </main>
  );
}
