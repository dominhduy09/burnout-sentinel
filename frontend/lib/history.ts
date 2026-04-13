import type { AnalysisResponse, PlannerFormValues } from "@/lib/types";

export type RiskSnapshot = {
  id: string;
  created_at: string;
  week_name: string;
  risk_score: number;
  risk_label: AnalysisResponse["risk_label"];
  inputs: PlannerFormValues;
};

const STORAGE_KEY = "burnout-sentinel:snapshots:v1";
const MAX_SNAPSHOTS = 12;

function safeParseSnapshots(raw: string | null): RiskSnapshot[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean) as RiskSnapshot[];
  } catch {
    return [];
  }
}

function getId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function loadSnapshots(): RiskSnapshot[] {
  if (typeof window === "undefined") return [];
  return safeParseSnapshots(window.localStorage.getItem(STORAGE_KEY));
}

export function clearSnapshots() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function addSnapshot(values: PlannerFormValues, result: AnalysisResponse): RiskSnapshot[] {
  if (typeof window === "undefined") return [];

  const existing = loadSnapshots();
  const createdAt = new Date().toISOString();
  const snapshot: RiskSnapshot = {
    id: getId(),
    created_at: createdAt,
    week_name: values.week_name,
    risk_score: result.risk_score,
    risk_label: result.risk_label,
    inputs: values
  };

  const next = [snapshot, ...existing].slice(0, MAX_SNAPSHOTS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

