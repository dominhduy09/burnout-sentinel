import { analyzePlannerInput } from "@/lib/analyzer";
import type { PlannerFormValues } from "@/lib/types";

export type WhatIfChange = {
  field: Exclude<keyof PlannerFormValues, "week_name">;
  delta: number;
  label: string;
};

export type WhatIfSuggestion = {
  title: string;
  rationale: string;
  changes: WhatIfChange[];
  beforeScore: number;
  afterScore: number;
  deltaScore: number;
  afterValues: PlannerFormValues;
};

const bounds: Record<Exclude<keyof PlannerFormValues, "week_name">, { min: number; max: number; step: number }> =
  {
    task_count: { min: 0, max: 60, step: 1 },
    high_priority_task_count: { min: 0, max: 20, step: 1 },
    estimated_task_hours: { min: 0, max: 100, step: 0.5 },
    exam_count: { min: 0, max: 10, step: 1 },
    clinical_hours: { min: 0, max: 60, step: 0.5 },
    average_sleep_hours: { min: 0, max: 12, step: 0.1 },
    stress_level: { min: 1, max: 10, step: 1 },
    free_hours: { min: 0, max: 80, step: 0.5 }
  };

function clampToStep(value: number, min: number, max: number, step: number) {
  const clamped = Math.max(min, Math.min(max, value));
  if (step === 1) return Math.round(clamped);
  const rounded = Math.round(clamped / step) * step;
  return Number(rounded.toFixed(step < 1 ? 1 : 0));
}

function applyChanges(base: PlannerFormValues, changes: WhatIfChange[]): PlannerFormValues {
  const next: PlannerFormValues = { ...base };

  for (const change of changes) {
    const bound = bounds[change.field];
    const currentValue = Number(next[change.field]);
    const updated = clampToStep(currentValue + change.delta, bound.min, bound.max, bound.step);
    (next[change.field] as number) = updated;
  }

  // Keep integers coherent.
  if (next.high_priority_task_count > next.task_count) {
    next.high_priority_task_count = next.task_count;
  }
  if (next.exam_count > next.task_count) {
    next.exam_count = Math.min(next.exam_count, next.task_count);
  }

  return next;
}

type Candidate = {
  title: string;
  rationale: string;
  changes: WhatIfChange[];
  cost: number;
};

export function buildWhatIfSuggestions(values: PlannerFormValues): WhatIfSuggestion[] {
  const baseline = analyzePlannerInput(values);
  const beforeScore = baseline.risk_score;

  const candidates: Candidate[] = [
    {
      title: "Sleep first",
      rationale: "Sleep has an outsized impact because it amplifies workload stress.",
      changes: [{ field: "average_sleep_hours", delta: 1.0, label: "+1.0h sleep/night" }],
      cost: 1.4
    },
    {
      title: "Add buffer time",
      rationale: "A few extra open hours creates slack so the week stops feeling reactive.",
      changes: [{ field: "free_hours", delta: 4.0, label: "+4h buffer/week" }],
      cost: 1.4
    },
    {
      title: "Reduce task switching",
      rationale: "Fewer total tasks reduces context switching and decision fatigue.",
      changes: [{ field: "task_count", delta: -2, label: "-2 tasks" }],
      cost: 1.2
    },
    {
      title: "Cut critical load",
      rationale: "Too many must-finish items increases pressure even if total hours stay the same.",
      changes: [{ field: "high_priority_task_count", delta: -1, label: "-1 critical task" }],
      cost: 1.1
    },
    {
      title: "Reduce study hours",
      rationale: "Trim or split work so the week’s total load drops below the overload zone.",
      changes: [{ field: "estimated_task_hours", delta: -4, label: "-4 study hours" }],
      cost: 1.3
    },
    {
      title: "Reset stress ramp",
      rationale: "If you can add recovery (walk, support, counseling), even a small stress drop helps.",
      changes: [{ field: "stress_level", delta: -1, label: "-1 stress level" }],
      cost: 1.0
    }
  ];

  // Add 2-action bundles (the “reduce 2 tasks + sleep +1h” hackathon moment).
  const bundles: Candidate[] = [
    {
      title: "Sleep + reduce switching",
      rationale: "Better sleep + fewer tasks reduces both baseline load and amplification.",
      changes: [
        { field: "average_sleep_hours", delta: 1.0, label: "+1.0h sleep/night" },
        { field: "task_count", delta: -2, label: "-2 tasks" }
      ],
      cost: 2.2
    },
    {
      title: "Buffer + cut criticals",
      rationale: "More buffer + fewer critical items reduces last-minute pressure.",
      changes: [
        { field: "free_hours", delta: 4.0, label: "+4h buffer/week" },
        { field: "high_priority_task_count", delta: -1, label: "-1 critical task" }
      ],
      cost: 2.2
    },
    {
      title: "Trim hours + add buffer",
      rationale: "Lower total work hours while creating slack so the week can absorb surprises.",
      changes: [
        { field: "estimated_task_hours", delta: -3, label: "-3 study hours" },
        { field: "free_hours", delta: 3.0, label: "+3h buffer/week" }
      ],
      cost: 2.4
    }
  ];

  const evaluated = [...candidates, ...bundles]
    .map((candidate) => {
      const afterValues = applyChanges(values, candidate.changes);
      const afterScore = analyzePlannerInput(afterValues).risk_score;
      const deltaScore = beforeScore - afterScore;
      return {
        candidate,
        afterValues,
        afterScore,
        deltaScore
      };
    })
    .filter((entry) => entry.deltaScore >= 4)
    .sort((a, b) => b.deltaScore / a.candidate.cost - a.deltaScore / b.candidate.cost)
    .slice(0, 4);

  return evaluated.map((entry) => ({
    title: entry.candidate.title,
    rationale: entry.candidate.rationale,
    changes: entry.candidate.changes,
    beforeScore,
    afterScore: entry.afterScore,
    deltaScore: entry.deltaScore,
    afterValues: entry.afterValues
  }));
}

