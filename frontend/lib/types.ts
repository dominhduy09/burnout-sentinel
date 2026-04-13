import { z } from "zod";

export const plannerSchema = z.object({
  week_name: z.string().min(1, "Week name is required").max(60),
  task_count: z.coerce.number().int().min(0).max(60),
  high_priority_task_count: z.coerce.number().int().min(0).max(20),
  estimated_task_hours: z.coerce.number().min(0).max(100),
  exam_count: z.coerce.number().int().min(0).max(10),
  clinical_hours: z.coerce.number().min(0).max(60),
  average_sleep_hours: z.coerce.number().min(0).max(12),
  stress_level: z.coerce.number().int().min(1).max(10),
  free_hours: z.coerce.number().min(0).max(80)
});

export type PlannerFormValues = z.infer<typeof plannerSchema>;

export type Recommendation = {
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
};

export type Insight = {
  label: string;
  value: number;
  status: "healthy" | "watch" | "risk";
};

export type ScoreBreakdownItem = {
  key: string;
  label: string;
  points: number;
  direction: "risk" | "protective" | "multiplier";
  detail: string;
  percent_of_score: number;
};

export type AnalysisResponse = {
  risk_label: "Low" | "Moderate" | "High";
  risk_score: number;
  summary: string;
  contributing_factors: string[];
  insights: Insight[];
  score_breakdown: ScoreBreakdownItem[];
  recommendations: Recommendation[];
  analysis_source?: "backend" | "local";
};

export const defaultPlannerValues: PlannerFormValues = {
  week_name: "Clinical Week",
  task_count: 23,
  high_priority_task_count: 6,
  estimated_task_hours: 28,
  exam_count: 2,
  clinical_hours: 16,
  average_sleep_hours: 6.4,
  stress_level: 8,
  free_hours: 8
};
