"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { type FieldPath, type UseFormReturn, useForm } from "react-hook-form";

import { MetricChart } from "@/components/metric-chart";
import { RiskPanel } from "@/components/risk-panel";
import { TrendPanel } from "@/components/trend-panel";
import { WhatIfPanel } from "@/components/what-if-panel";
import { analyzePlannerInput } from "@/lib/analyzer";
import { addSnapshot } from "@/lib/history";
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

type PanelKey = "risk" | "whatif" | "metric" | "trend";

const defaultPanelOrder: PanelKey[] = ["risk", "whatif", "metric", "trend"];

const panelLabelByKey: Record<PanelKey, string> = {
  risk: "Risk Summary",
  whatif: "What-if Simulator",
  metric: "Workload Snapshot",
  trend: "Risk Trend"
};

function formatValue(value: number, step: number) {
  return step < 1 ? value.toFixed(1) : String(Math.round(value));
}

function clampPercent(value: number, max: number) {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

const statStyleByStatus = {
  healthy: {
    dot: "bg-emerald-400",
    label: "text-emerald-800",
    bar: "from-emerald-500/80 to-emerald-300/30"
  },
  watch: {
    dot: "bg-amber-400",
    label: "text-amber-800",
    bar: "from-amber-500/80 to-amber-300/30"
  },
  risk: {
    dot: "bg-rose-400",
    label: "text-rose-800",
    bar: "from-rose-500/80 to-rose-300/30"
  }
} as const;

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
      className={`relative overflow-hidden rounded-[24px] border p-4 backdrop-blur-xl ${
        isRecovery
          ? "border-emerald-100/60 bg-[linear-gradient(135deg,_rgba(242,253,248,0.58)_0%,_rgba(224,250,238,0.18)_100%)]"
          : "border-white/60 bg-[linear-gradient(135deg,_rgba(255,255,255,0.62)_0%,_rgba(255,245,234,0.16)_100%)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{field.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{field.helper}</p>
        </div>
        <div
          className={`shrink-0 glass-pill ${isRecovery ? "glass-pill-mint" : "glass-pill-amber"}`}
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
          className="slider h-2 w-full cursor-pointer appearance-none rounded-full bg-white/30 shadow-inner"
        />
        <input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          {...form.register(field.name, { valueAsNumber: true })}
          className="glass-input h-11 w-20 px-3"
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
  const [backendResult, setBackendResult] = useState<AnalysisResponse | null>(null);
  const [backendInput, setBackendInput] = useState<PlannerFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [historyToken, setHistoryToken] = useState(0);
  const [analysisToken, setAnalysisToken] = useState(0);
  const [celebrateToken, setCelebrateToken] = useState(0);
  const [moderateToken, setModerateToken] = useState(0);
  const [highToken, setHighToken] = useState(0);
  const [panelOrder, setPanelOrder] = useState<PanelKey[]>(defaultPanelOrder);
  const [draggedPanel, setDraggedPanel] = useState<PanelKey | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioPrimedRef = useRef(false);

  const form = useForm<PlannerFormValues>({
    resolver: zodResolver(plannerSchema),
    defaultValues: defaultPlannerValues
  });

  const isSubmitting = form.formState.isSubmitting;
  const values = form.watch();
  const deferredValues = useDeferredValue(values);

  const localResult = useMemo(
    () => analyzePlannerInput(deferredValues),
    [
      deferredValues.week_name,
      deferredValues.task_count,
      deferredValues.high_priority_task_count,
      deferredValues.estimated_task_hours,
      deferredValues.exam_count,
      deferredValues.clinical_hours,
      deferredValues.average_sleep_hours,
      deferredValues.stress_level,
      deferredValues.free_hours
    ]
  );

  const displayResult = useMemo(() => {
    if (!backendResult || !backendInput) return localResult;
    const same =
      backendInput.week_name === values.week_name &&
      backendInput.task_count === deferredValues.task_count &&
      backendInput.high_priority_task_count === deferredValues.high_priority_task_count &&
      backendInput.estimated_task_hours === deferredValues.estimated_task_hours &&
      backendInput.exam_count === deferredValues.exam_count &&
      backendInput.clinical_hours === deferredValues.clinical_hours &&
      backendInput.average_sleep_hours === deferredValues.average_sleep_hours &&
      backendInput.stress_level === deferredValues.stress_level &&
      backendInput.free_hours === deferredValues.free_hours;
    return same ? backendResult : localResult;
  }, [backendResult, backendInput, deferredValues, localResult, values.week_name]);

  const fallbackInsights = useMemo<Insight[]>(
    () => [
      {
        label: "Task Load",
        value: deferredValues.task_count,
        status: deferredValues.task_count > 22 ? "risk" : deferredValues.task_count > 16 ? "watch" : "healthy"
      },
      {
        label: "Priority Tasks",
        value: deferredValues.high_priority_task_count,
        status:
          deferredValues.high_priority_task_count > 5
            ? "risk"
            : deferredValues.high_priority_task_count > 3
              ? "watch"
              : "healthy"
      },
      {
        label: "Work Hours",
        value: Number(deferredValues.estimated_task_hours) + Number(deferredValues.clinical_hours),
        status:
          Number(deferredValues.estimated_task_hours) + Number(deferredValues.clinical_hours) > 40
            ? "risk"
            : Number(deferredValues.estimated_task_hours) + Number(deferredValues.clinical_hours) > 28
              ? "watch"
              : "healthy"
      },
      {
        label: "Sleep",
        value: deferredValues.average_sleep_hours,
        status:
          deferredValues.average_sleep_hours < 6.5
            ? "risk"
            : deferredValues.average_sleep_hours < 7.5
              ? "watch"
              : "healthy"
      },
      {
        label: "Free Time",
        value: deferredValues.free_hours,
        status: deferredValues.free_hours < 10 ? "risk" : deferredValues.free_hours < 16 ? "watch" : "healthy"
      }
    ],
    [deferredValues]
  );

  const handleApplyWhatIf = useCallback(
    (nextValues: PlannerFormValues) => {
      form.reset(nextValues);
      setBackendResult(null);
      setBackendInput(null);
      setError(null);
    },
    [form]
  );

  const reorderPanels = useCallback((source: PanelKey, target: PanelKey) => {
    if (source === target) return;

    setPanelOrder((current) => {
      const sourceIndex = current.indexOf(source);
      const targetIndex = current.indexOf(target);

      if (sourceIndex === -1 || targetIndex === -1) {
        return current;
      }

      const next = [...current];
      next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, source);
      return next;
    });
  }, []);

  function renderPanel(panelKey: PanelKey) {
    if (panelKey === "risk") {
      return (
        <RiskPanel
          result={displayResult}
          celebrateToken={celebrateToken}
          moderateToken={moderateToken}
          highToken={highToken}
        />
      );
    }

    if (panelKey === "whatif") {
      return (
        <WhatIfPanel
          values={deferredValues}
          baselineScore={displayResult.risk_score}
          onApply={handleApplyWhatIf}
        />
      );
    }

    if (panelKey === "metric") {
      return <MetricChart insights={displayResult.insights ?? fallbackInsights} />;
    }

    return <TrendPanel refreshToken={historyToken} />;
  }

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
      setBackendInput(formValues);
      setBackendResult(payload);
      setAnalysisToken((value) => value + 1);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while analyzing the schedule.";
      setError(message);
    }
  }

  function primeCelebrationSound() {
    audioPrimedRef.current = true;

    if (audioContextRef.current) {
      void audioContextRef.current.resume().catch(() => {});
      return;
    }

    try {
      const context = new AudioContext();
      audioContextRef.current = context;
      void context.resume().catch(() => {});
    } catch {
      // ignore: sound is optional
    }
  }

  function playLowSound() {
    if (!audioPrimedRef.current) return;
    const context = audioContextRef.current;
    if (!context) return;

    try {
      const now = context.currentTime;
      const master = context.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);
      master.connect(context.destination);

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      notes.forEach((frequency, index) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, now + index * 0.07);
        gain.gain.setValueAtTime(0.0001, now + index * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.07 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.07 + 0.48);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + index * 0.07);
        osc.stop(now + index * 0.07 + 0.5);
      });
    } catch {
      // ignore: sound is optional
    }
  }

  function playModerateSound() {
    if (!audioPrimedRef.current) return;
    const context = audioContextRef.current;
    if (!context) return;

    try {
      const now = context.currentTime;
      const master = context.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      master.connect(context.destination);

      const notes = [659.25, 587.33, 523.25]; // E5 D5 C5
      notes.forEach((frequency, index) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(frequency, now + index * 0.09);
        gain.gain.setValueAtTime(0.0001, now + index * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.09, now + index * 0.09 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.28);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + index * 0.09);
        osc.stop(now + index * 0.09 + 0.3);
      });
    } catch {
      // ignore: sound is optional
    }
  }

  function playHighSound() {
    if (!audioPrimedRef.current) return;
    const context = audioContextRef.current;
    if (!context) return;

    try {
      const now = context.currentTime;
      const master = context.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
      master.connect(context.destination);

      const pattern = [
        { frequency: 392.0, start: 0.0, duration: 0.16 },
        { frequency: 392.0, start: 0.23, duration: 0.16 },
        { frequency: 311.13, start: 0.46, duration: 0.22 } // Eb4
      ];

      pattern.forEach((tone) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(tone.frequency, now + tone.start);
        gain.gain.setValueAtTime(0.0001, now + tone.start);
        gain.gain.exponentialRampToValueAtTime(0.1, now + tone.start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.start + tone.duration);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + tone.start);
        osc.stop(now + tone.start + tone.duration + 0.02);
      });
    } catch {
      // ignore: sound is optional
    }
  }

  useEffect(() => {
    if (!displayResult || analysisToken === 0) return;

    if (displayResult.risk_label === "Low") {
      setCelebrateToken((value) => value + 1);
      playLowSound();
      return;
    }

    if (displayResult.risk_label === "Moderate") {
      setModerateToken((value) => value + 1);
      playModerateSound();
      return;
    }

    setHighToken((value) => value + 1);
    playHighSound();
  }, [analysisToken]);

  const totalLoad = Number(values.estimated_task_hours) + Number(values.clinical_hours);
  const totalLoadStatus = totalLoad > 40 ? "risk" : totalLoad > 28 ? "watch" : "healthy";
  const pressureStatus =
    values.high_priority_task_count > 5 ? "risk" : values.high_priority_task_count > 3 ? "watch" : "healthy";
  const bufferStatus = values.free_hours < 10 ? "risk" : values.free_hours < 16 ? "watch" : "healthy";

  const liveTotalTitle = totalLoadStatus === "risk" ? "Overloaded" : totalLoadStatus === "watch" ? "Heavy week" : "Balanced";
  const liveTotalHint =
    totalLoadStatus === "risk"
      ? "Consider reducing study or clinical load this week."
      : totalLoadStatus === "watch"
        ? "Watch recovery time and protect sleep."
        : "This load looks manageable with current recovery.";

  const liveTotalTone =
    totalLoadStatus === "risk"
      ? "border-rose-200/70 bg-[linear-gradient(135deg,_rgba(255,245,245,0.82)_0%,_rgba(255,237,237,0.45)_100%)]"
      : totalLoadStatus === "watch"
        ? "border-amber-200/70 bg-[linear-gradient(135deg,_rgba(255,249,240,0.82)_0%,_rgba(255,240,214,0.45)_100%)]"
        : "border-emerald-200/70 bg-[linear-gradient(135deg,_rgba(242,255,250,0.82)_0%,_rgba(228,250,241,0.45)_100%)]";

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] xl:items-start 2xl:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)]">
      <div className="min-w-0">
        <div className="card overflow-hidden p-0">
          <div className="panel-header">
            <div className="absolute inset-0 glass-grain" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Planner Input</p>
                <h2 className="mt-2 text-xl font-semibold">Plan your week</h2>
                <p className="mt-1 max-w-md text-sm leading-6 text-slate-700">
                  Tune your schedule inputs and instantly see how your week shifts.
                </p>
              </div>
              <div className={`w-full rounded-[20px] border px-4 py-3 shadow-sm backdrop-blur-xl sm:w-auto sm:min-w-[206px] ${liveTotalTone}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-600">Live Total</p>
                  <span className={`h-2 w-2 rounded-full ${statStyleByStatus[totalLoadStatus].dot}`} />
                </div>
                <p className="mt-1 text-[2rem] font-semibold tabular-nums tracking-tight text-ink">
                  {totalLoad}
                  <span className="ml-1 text-sm font-semibold text-stone-600">h</span>
                </p>
                <p className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statStyleByStatus[totalLoadStatus].label}`}>
                  {liveTotalTitle}
                </p>
                <div className="mt-2 h-2 rounded-full bg-white/45 shadow-inner">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${statStyleByStatus[totalLoadStatus].bar}`}
                    style={{ width: `${clampPercent(totalLoad, 60)}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-600">{liveTotalHint}</p>
              </div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-6">
            <div className="surface-soft p-5">
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
                        setBackendResult(null);
                        setBackendInput(null);
                        setError(null);
                      }}
                      className="glass-button rounded-full px-3 py-2 text-sm font-semibold text-ink hover:border-emerald-200/70"
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
                    className="glass-input mt-2 h-11 w-full"
                  />
                  {form.formState.errors.week_name ? (
                    <p className="mt-2 text-xs text-rose-600">
                      {form.formState.errors.week_name.message as string}
                    </p>
                  ) : null}
                </label>
              </div>
            </div>

            <div className="surface-soft p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Workload</p>
                  <p className="mt-1 text-sm text-stone-600">Academic and task pressure across the week.</p>
                </div>
                <div className="glass-pill glass-pill-amber">
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

            <div className="surface-mint p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Recovery</p>
                  <p className="mt-1 text-sm text-stone-600">Sleep, stress, and the amount of room left to breathe.</p>
                </div>
                <div className="glass-pill glass-pill-mint">
                  {values.free_hours} buffer
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

            <div className="surface-shell rounded-[28px] border border-white/65 bg-[linear-gradient(135deg,_rgba(255,255,255,0.72)_0%,_rgba(249,247,242,0.38)_56%,_rgba(242,249,246,0.24)_100%)] p-5 shadow-[0_16px_38px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
              <div className="grid items-stretch gap-4 sm:grid-cols-3">
                <div className="glass-stat h-full">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-xs uppercase tracking-[0.18em] ${statStyleByStatus[totalLoadStatus].label}`}>
                      Total Load
                    </p>
                  </div>
                  <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-ink">
                    {totalLoad}
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-white/30">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out motion-reduce:transition-none ${statStyleByStatus[totalLoadStatus].bar}`}
                      style={{ width: `${clampPercent(totalLoad, 60)}%` }}
                    />
                  </div>
                </div>

                <div className="glass-stat h-full">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-xs uppercase tracking-[0.18em] ${statStyleByStatus[pressureStatus].label}`}>
                      Priority Pressure
                    </p>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-stone-600">tasks</span>
                  </div>
                  <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-ink">
                    {values.high_priority_task_count}
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-white/30">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out motion-reduce:transition-none ${statStyleByStatus[pressureStatus].bar}`}
                      style={{ width: `${clampPercent(values.high_priority_task_count, 12)}%` }}
                    />
                  </div>
                </div>

                <div className="glass-stat h-full">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-xs uppercase tracking-[0.18em] ${statStyleByStatus[bufferStatus].label}`}>
                      Recovery Buffer
                    </p>
                  </div>
                  <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-ink">
                    {values.free_hours}
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-white/30">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out motion-reduce:transition-none ${statStyleByStatus[bufferStatus].bar}`}
                      style={{ width: `${clampPercent(values.free_hours, 30)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 px-4 py-3 text-sm text-amber-900 backdrop-blur-xl">
                {error}
              </div>
            ) : null}

            {saveMessage ? (
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/35 px-4 py-3 text-sm text-emerald-900 backdrop-blur-xl">
                {saveMessage}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                addSnapshot(values, displayResult);
                setHistoryToken((value) => value + 1);
                setSaveMessage("Snapshot saved to your trend history.");
                window.setTimeout(() => setSaveMessage(null), 2200);
              }}
              className="glass-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-ink hover:border-emerald-200/70 active:translate-y-px"
            >
              Save week snapshot
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              onPointerDown={primeCelebrationSound}
              className="glass-button glass-button-ink inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 xl:sticky xl:bottom-0 active:translate-y-px"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  <span>Analyzing...</span>
                </>
              ) : (
                "Analyze Burnout Risk"
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="min-w-0 grid gap-5 lg:grid-cols-2 xl:pr-0">
        {panelOrder.map((panelKey) => {
          const spanClass = panelKey === "risk" || panelKey === "whatif" ? "xl:col-span-2" : "xl:col-span-1";

          return (
            <div
              key={panelKey}
              draggable
              onDragStart={(event) => {
                setDraggedPanel(panelKey);
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (!draggedPanel) return;
                reorderPanels(draggedPanel, panelKey);
                setDraggedPanel(null);
              }}
              onDragEnd={() => {
                setDraggedPanel(null);
              }}
              className={`min-w-0 ${spanClass} ${draggedPanel === panelKey ? "opacity-70" : ""}`}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {panelLabelByKey[panelKey]}
                </p>
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Drag to move</span>
              </div>
              {renderPanel(panelKey)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
