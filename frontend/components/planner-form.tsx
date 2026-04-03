"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { type FieldPath, type UseFormReturn, useForm } from "react-hook-form";

import { MetricChart } from "@/components/metric-chart";
import { RiskPanel } from "@/components/risk-panel";
import {
  type AnalysisResponse,
  type Insight,
  type PlannerFormValues,
  defaultPlannerValues,
  plannerSchema
} from "@/lib/types";

type MetricField = {
  name: Exclude<FieldPath<PlannerFormValues>, "week_name">;
  label: string;
  helper: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
  tone: "work" | "recovery";
};

const workloadFields: MetricField[] = [
  {
    name: "task_count",
    label: "Total Tasks",
    helper: "Assignments, quizzes, meetings, shifts, and life tasks.",
    min: 0,
    max: 40,
    step: 1,
    suffix: "tasks",
    tone: "work"
  },
  {
    name: "high_priority_task_count",
    label: "Critical Tasks",
    helper: "The must-finish items that will create pressure if they pile up.",
    min: 0,
    max: 12,
    step: 1,
    suffix: "tasks",
    tone: "work"
  },
  {
    name: "estimated_task_hours",
    label: "Study Hours",
    helper: "Time needed for studying, projects, and homework outside class.",
    min: 0,
    max: 60,
    step: 0.5,
    suffix: "hrs",
    tone: "work"
  },
  {
    name: "exam_count",
    label: "Exams or Checkoffs",
    helper: "Assessments that can spike stress in the same week.",
    min: 0,
    max: 6,
    step: 1,
    suffix: "items",
    tone: "work"
  },
  {
    name: "clinical_hours",
    label: "Labs or Clinical Hours",
    helper: "Structured hours spent in clinical, lab, or practicum settings.",
    min: 0,
    max: 40,
    step: 0.5,
    suffix: "hrs",
    tone: "work"
  }
];

const recoveryFields: MetricField[] = [
  {
    name: "average_sleep_hours",
    label: "Average Sleep",
    helper: "How much sleep you expect per night this week.",
    min: 0,
    max: 12,
    step: 0.1,
    suffix: "hrs",
    tone: "recovery"
  },
  {
    name: "stress_level",
    label: "Stress Level",
    helper: "Your current stress level from 1 to 10.",
    min: 1,
    max: 10,
    step: 1,
    suffix: "/10",
    tone: "recovery"
  },
  {
    name: "free_hours",
    label: "Open Buffer Time",
    helper: "Hours left for breaks, recovery, or unexpected work.",
    min: 0,
    max: 30,
    step: 0.5,
    suffix: "hrs",
    tone: "recovery"
  }
];

const presets: Array<{
  label: string;
  values: PlannerFormValues;
}> = [
  {
    label: "Balanced",
    values: {
      week_name: "Balanced Week",
      task_count: 11,
      high_priority_task_count: 3,
      estimated_task_hours: 15,
      exam_count: 1,
      clinical_hours: 8,
      average_sleep_hours: 7.8,
      stress_level: 4,
      free_hours: 18
    }
  },
  {
    label: "Heavy",
    values: {
      week_name: "Typical Heavy Week",
      task_count: 18,
      high_priority_task_count: 4,
      estimated_task_hours: 22,
      exam_count: 1,
      clinical_hours: 14,
      average_sleep_hours: 6.9,
      stress_level: 6,
      free_hours: 12
    }
  },
  {
    label: "Overloaded",
    values: defaultPlannerValues
  }
];

function formatValue(value: number, step: number) {
  return step < 1 ? value.toFixed(1) : String(Math.round(value));
}

function MetricControl({
  form,
  field
}: {
  form: UseFormReturn<PlannerFormValues>;
  field: MetricField;
}) {
  const rawValue = Number(form.watch(field.name));
  const value = Number.isFinite(rawValue) ? rawValue : field.min;
  const error = form.formState.errors[field.name];
  const isRecovery = field.tone === "recovery";

  return (
    <div
      className={`rounded-[24px] border p-4 ${
        isRecovery
          ? "border-emerald-100 bg-[linear-gradient(180deg,_#fbfffd_0%,_#f1f9f4_100%)]"
          : "border-stone-200 bg-[linear-gradient(180deg,_#fffefd_0%,_#f9f5ee_100%)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{field.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{field.helper}</p>
        </div>
        <div
          className={`shrink-0 rounded-2xl px-3 py-2 text-sm font-semibold ${
            isRecovery ? "bg-emerald-100 text-emerald-800" : "bg-orange-50 text-stone-700"
          }`}
        >
          {formatValue(value, field.step)} {field.suffix}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(event) => {
            form.setValue(field.name, Number(event.target.value) as never, {
              shouldDirty: true,
              shouldValidate: true
            });
          }}
          style={{ accentColor: isRecovery ? "#1d8f6e" : "#c26b4a" }}
          className={`slider h-2 w-full cursor-pointer appearance-none rounded-full ${
            isRecovery ? "bg-emerald-100" : "bg-orange-100"
          }`}
        />
        <input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          {...form.register(field.name, { valueAsNumber: true })}
          className="h-11 w-20 rounded-2xl border border-stone-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-emerald-100"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-stone-400">
        <span>{field.min}</span>
        <span>{field.max}</span>
      </div>

      {error ? <p className="mt-3 text-xs text-rose-600">{error.message as string}</p> : null}
    </div>
  );
}

export function PlannerForm() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PlannerFormValues>({
    resolver: zodResolver(plannerSchema),
    defaultValues: defaultPlannerValues
  });

  const isSubmitting = form.formState.isSubmitting;
  const values = form.watch();

  const fallbackInsights = useMemo<Insight[]>(
    () => [
      {
        label: "Task Load",
        value: values.task_count,
        status: values.task_count > 22 ? "risk" : values.task_count > 16 ? "watch" : "healthy"
      },
      {
        label: "Priority Tasks",
        value: values.high_priority_task_count,
        status:
          values.high_priority_task_count > 5
            ? "risk"
            : values.high_priority_task_count > 3
              ? "watch"
              : "healthy"
      },
      {
        label: "Work Hours",
        value: Number(values.estimated_task_hours) + Number(values.clinical_hours),
        status:
          Number(values.estimated_task_hours) + Number(values.clinical_hours) > 40
            ? "risk"
            : Number(values.estimated_task_hours) + Number(values.clinical_hours) > 28
              ? "watch"
              : "healthy"
      },
      {
        label: "Sleep",
        value: values.average_sleep_hours,
        status: values.average_sleep_hours < 6.5 ? "risk" : values.average_sleep_hours < 7.5 ? "watch" : "healthy"
      },
      {
        label: "Free Time",
        value: values.free_hours,
        status: values.free_hours < 10 ? "risk" : values.free_hours < 16 ? "watch" : "healthy"
      }
    ],
    [values]
  );

  async function onSubmit(formValues: PlannerFormValues) {
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formValues)
      });

      if (!response.ok) {
        throw new Error("The API could not analyze this schedule.");
      }

      const payload: AnalysisResponse = await response.json();
      setResult(payload);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while analyzing the schedule.";
      setError(message);
    }
  }

  const totalLoad = Number(values.estimated_task_hours) + Number(values.clinical_hours);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(360px,460px)_minmax(0,1fr)] xl:items-start">
      <div className="xl:sticky xl:top-6">
        <div className="card max-h-[calc(100vh-8.5rem)] overflow-hidden p-0 xl:flex xl:flex-col">
          <div className="border-b border-stone-200 bg-[linear-gradient(135deg,_rgba(255,255,255,0.96)_0%,_rgba(244,249,247,0.98)_42%,_rgba(248,242,233,0.98)_100%)] px-5 py-4 text-ink">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Planner Input</p>
                <h2 className="mt-2 text-xl font-semibold">Shape one week</h2>
                <p className="mt-1 max-w-md text-sm leading-6 text-slate-700">
                  Adjust the schedule like a control panel, then see how the week changes.
                </p>
              </div>
              <div className="rounded-[22px] border border-emerald-100 bg-white/75 px-4 py-3 text-right shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Live Total</p>
                <p className="mt-1 text-2xl font-semibold">{totalLoad}h</p>
              </div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-5 py-5 xl:flex-1 xl:overflow-y-auto">
            <div className="surface-soft p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Preset Week</p>
                  <p className="mt-1 text-sm text-stone-600">Start from a realistic workload pattern.</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        form.reset(preset.values);
                        setResult(null);
                        setError(null);
                      }}
                      className="rounded-full border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:bg-emerald-50"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="block">
                  <span className="text-sm font-medium text-ink">Week Name</span>
                  <input
                    type="text"
                    {...form.register("week_name")}
                    className="mt-2 h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-ink outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                  {form.formState.errors.week_name ? (
                    <p className="mt-2 text-xs text-rose-600">
                      {form.formState.errors.week_name.message as string}
                    </p>
                  ) : null}
                </label>
              </div>
            </div>

            <div className="surface-soft p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Workload</p>
                  <p className="mt-1 text-sm text-stone-600">Academic and task pressure across the week.</p>
                </div>
                <div className="rounded-2xl bg-orange-50 px-3 py-2 text-sm font-semibold text-stone-700">
                  {values.task_count} tasks
                </div>
              </div>

              <div className="surface-shell">
                <div className="grid gap-2">
                  {workloadFields.map((field) => (
                    <MetricControl key={field.name} form={form} field={field} />
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-mint p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Recovery</p>
                  <p className="mt-1 text-sm text-stone-600">Sleep, stress, and the amount of room left to breathe.</p>
                </div>
                <div className="rounded-2xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800">
                  {values.free_hours}h buffer
                </div>
              </div>

              <div className="surface-shell border-emerald-100/70">
                <div className="grid gap-2">
                  {recoveryFields.map((field) => (
                    <MetricControl key={field.name} form={form} field={field} />
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-shell grid gap-2 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Total Load</p>
                <p className="mt-1 text-xl font-semibold text-ink">{totalLoad}h</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Priority Pressure</p>
                <p className="mt-1 text-xl font-semibold text-ink">{values.high_priority_task_count}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Recovery Buffer</p>
                <p className="mt-1 text-xl font-semibold text-ink">{values.free_hours}h</p>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 xl:sticky xl:bottom-0"
            >
              {isSubmitting ? "Analyzing..." : "Analyze Burnout Risk"}
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-6 xl:max-h-[calc(100vh-8.5rem)] xl:overflow-y-auto xl:pr-1">
        <RiskPanel result={result} />
        <MetricChart insights={result?.insights ?? fallbackInsights} />
      </div>
    </div>
  );
}
