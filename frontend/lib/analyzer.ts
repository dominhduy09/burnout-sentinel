import type { AnalysisResponse, Insight, PlannerFormValues, ScoreBreakdownItem } from "@/lib/types";

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function ratio(value: number, minimum: number, maximum: number) {
  if (maximum <= minimum) return 0;
  return clamp((value - minimum) / (maximum - minimum), 0, 1);
}

function buildInsight(
  label: string,
  value: number,
  healthyMax: number,
  warningMax: number,
  unit: string
): Insight {
  let status: Insight["status"] = "healthy";

  if (value > warningMax) {
    status = "risk";
  } else if (value > healthyMax) {
    status = "watch";
  }

  return {
    label,
    value: Number(value.toFixed(1)),
    status
  };
}

function buildInverseInsight(
  label: string,
  value: number,
  healthyMin: number,
  warningMin: number,
  unit: string
): Insight {
  let status: Insight["status"] = "healthy";

  if (value < warningMin) {
    status = "risk";
  } else if (value < healthyMin) {
    status = "watch";
  }

  return {
    label,
    value: Number(value.toFixed(1)),
    status
  };
}

export function analyzePlannerInput(payload: PlannerFormValues): AnalysisResponse {
  const academicLoadHours = payload.estimated_task_hours + payload.clinical_hours;

  const taskPressure = ratio(payload.task_count, 0, 24) * 100;
  const criticalPressure = ratio(payload.high_priority_task_count, 0, 8) * 100;
  const loadPressure = ratio(academicLoadHours, 0, 42) * 100;
  const examPressure = ratio(payload.exam_count, 0, 3) * 100;
  const clinicalPressure = ratio(payload.clinical_hours, 0, 20) * 100;

  const sleepDeficitRatio = ratio(8 - payload.average_sleep_hours, 0, 3);
  const sleepDeficit = Math.pow(sleepDeficitRatio, 1.7) * 100;
  const bufferDeficitRatio = ratio(16 - payload.free_hours, 0, 16);
  const bufferDeficit = Math.pow(bufferDeficitRatio, 1.3) * 100;
  const stressSignal = ratio(payload.stress_level - 1, 0, 9) * 100;

  const demandScore =
    taskPressure * 0.2 +
    criticalPressure * 0.2 +
    loadPressure * 0.3 +
    examPressure * 0.15 +
    clinicalPressure * 0.15;

  const recoveryDeficitScore = sleepDeficit * 0.65 + bufferDeficit * 0.35;

  const demandTerm = demandScore * 0.55;
  const recoveryTerm = recoveryDeficitScore * 0.3;
  const stressTerm = stressSignal * 0.15;
  const baseRisk = clamp(demandTerm + recoveryTerm + stressTerm, 0, 100);

  const compressionRatio = ratio(payload.task_count - 16, 0, 12);

  const mSleep = 1 + 0.22 * sleepDeficitRatio;
  const mBuffer = 1 + 0.15 * bufferDeficitRatio;
  const mCompression = 1 + 0.1 * compressionRatio;
  const mDeadlines =
    1 + (payload.exam_count >= 2 ? 0.08 : 0) + (payload.exam_count >= 2 && payload.high_priority_task_count >= 5 ? 0.06 : 0);
  const mClinical = 1 + 0.08 * ratio(payload.clinical_hours - 12, 0, 18);

  const scoreAfterSleep = baseRisk * mSleep;
  const sleepEffect = scoreAfterSleep - baseRisk;

  const scoreAfterBuffer = scoreAfterSleep * mBuffer;
  const bufferEffect = scoreAfterBuffer - scoreAfterSleep;

  const scoreAfterCompression = scoreAfterBuffer * mCompression;
  const compressionEffect = scoreAfterCompression - scoreAfterBuffer;

  const scoreAfterDeadlines = scoreAfterCompression * mDeadlines;
  const deadlinesEffect = scoreAfterDeadlines - scoreAfterCompression;

  const scoreAfterClinical = scoreAfterDeadlines * mClinical;
  const clinicalEffect = scoreAfterClinical - scoreAfterDeadlines;

  const riskScore = Math.round(clamp(scoreAfterClinical, 0, 100));

  const riskLabel: AnalysisResponse["risk_label"] =
    riskScore >= 70 ? "High" : riskScore >= 40 ? "Moderate" : "Low";

  const scoreForPercent = Math.max(1, riskScore);
  const percentOfScore = (points: number) => clamp((Math.abs(points) / scoreForPercent) * 100, 0, 100);

  const breakdownItems: ScoreBreakdownItem[] = [
    {
      key: "demand",
      label: "Workload demand",
      points: Number(demandTerm.toFixed(1)),
      direction: "risk",
      percent_of_score: Number(percentOfScore(demandTerm).toFixed(1)),
      detail: "Hours, tasks, exams, and clinical load combine into a demand baseline."
    },
    {
      key: "recovery",
      label: "Recovery deficit",
      points: Number(recoveryTerm.toFixed(1)),
      direction: "risk",
      percent_of_score: Number(percentOfScore(recoveryTerm).toFixed(1)),
      detail: "Less sleep and less free time reduce the week’s recovery capacity."
    },
    {
      key: "stress",
      label: "Current stress signal",
      points: Number(stressTerm.toFixed(1)),
      direction: "risk",
      percent_of_score: Number(percentOfScore(stressTerm).toFixed(1)),
      detail: "Self-reported stress raises the baseline risk for this week."
    },
    {
      key: "mult_sleep",
      label: "Sleep amplifier",
      points: Number(sleepEffect.toFixed(1)),
      direction: "multiplier",
      percent_of_score: Number(percentOfScore(sleepEffect).toFixed(1)),
      detail: `Avg sleep ${payload.average_sleep_hours.toFixed(1)}h applies ~${Math.round((mSleep - 1) * 100)}% amplification.`
    },
    {
      key: "mult_buffer",
      label: "Buffer-time amplifier",
      points: Number(bufferEffect.toFixed(1)),
      direction: "multiplier",
      percent_of_score: Number(percentOfScore(bufferEffect).toFixed(1)),
      detail: `Open buffer ${payload.free_hours.toFixed(1)}h applies ~${Math.round((mBuffer - 1) * 100)}% amplification.`
    },
    {
      key: "mult_compression",
      label: "Context-switching amplifier",
      points: Number(compressionEffect.toFixed(1)),
      direction: "multiplier",
      percent_of_score: Number(percentOfScore(compressionEffect).toFixed(1)),
      detail: `High task count (${payload.task_count}) adds ~${Math.round((mCompression - 1) * 100)}% decision fatigue.`
    },
    {
      key: "mult_deadlines",
      label: "Deadline clustering amplifier",
      points: Number(deadlinesEffect.toFixed(1)),
      direction: "multiplier",
      percent_of_score: Number(percentOfScore(deadlinesEffect).toFixed(1)),
      detail: `Exams/checkoffs (${payload.exam_count}) apply ~${Math.round((mDeadlines - 1) * 100)}% deadline pressure.`
    },
    {
      key: "mult_clinical",
      label: "Clinical intensity amplifier",
      points: Number(clinicalEffect.toFixed(1)),
      direction: "multiplier",
      percent_of_score: Number(percentOfScore(clinicalEffect).toFixed(1)),
      detail: `Clinical hours (${payload.clinical_hours.toFixed(1)}h) apply ~${Math.round((mClinical - 1) * 100)}% fatigue overhead.`
    }
  ];

  const breakdown = breakdownItems.filter((item) => Math.abs(item.points) >= 0.5);

  const contributingFactors: string[] = breakdown
    .filter((item) => (item.direction === "risk" || item.direction === "multiplier") && item.points >= 3)
    .sort((a, b) => b.points - a.points)
    .slice(0, 4)
    .map((item) => item.detail);

  if (!contributingFactors.length) contributingFactors.push("The current workload looks balanced overall.");
  if (payload.average_sleep_hours < 6.5 && !contributingFactors.some((item) => item.includes("sleep"))) {
    contributingFactors.push("Sleep is low enough to amplify workload stress.");
  }

  const recommendations: AnalysisResponse["recommendations"] = [];
  if (payload.task_count >= 20 || payload.high_priority_task_count >= 5) {
    recommendations.push({
      title: "Reduce decision fatigue",
      detail: "Group lower-stakes tasks together and identify the top 3 must-finish items for the week.",
      priority: "high"
    });
  }
  if (payload.exam_count >= 2) {
    recommendations.push({
      title: "Start exam prep earlier",
      detail: "Move review blocks earlier in the week so exam days are not carrying both studying and submission pressure.",
      priority: "high"
    });
  }
  if (payload.average_sleep_hours < 7) {
    recommendations.push({
      title: "Protect sleep before peak days",
      detail: "Block one earlier bedtime before your heaviest class or clinical day to reduce cognitive overload.",
      priority: "high"
    });
  }
  if (payload.clinical_hours >= 16) {
    recommendations.push({
      title: "Add recovery buffers around clinicals",
      detail: "Avoid placing your hardest assignments directly after long clinical hours. Reserve lighter tasks for those windows.",
      priority: "medium"
    });
  }
  if (payload.free_hours < 10) {
    recommendations.push({
      title: "Create buffer time",
      detail: "Leave at least two short open blocks this week so unexpected tasks do not push the whole schedule off track.",
      priority: "high"
    });
  }
  if (payload.stress_level >= 7) {
    recommendations.push({
      title: "Use support before stress spikes further",
      detail: "Check in with a classmate, mentor, or campus support resource this week instead of waiting for the schedule to get harder.",
      priority: "medium"
    });
  }
  if (!recommendations.length || riskScore < 40) {
    recommendations.push({
      title: "Keep the current balance",
      detail: "Your week looks manageable. Keep using consistent study blocks and protect the recovery time you already have.",
      priority: "low"
    });
  }

  const insights: Insight[] = [
    buildInsight("Task Load", payload.task_count, 16, 22, "tasks"),
    buildInsight("Priority Tasks", payload.high_priority_task_count, 3, 5, "tasks"),
    buildInsight("Work Hours", academicLoadHours, 28, 40, "hours"),
    buildInverseInsight("Sleep", payload.average_sleep_hours, 7.5, 6.5, "hours/night"),
    buildInverseInsight("Free Time", payload.free_hours, 16, 10, "hours/week")
  ];

  const summary =
    riskLabel === "High"
      ? "This schedule shows a high overload risk. The biggest opportunity is to reduce compression before stress and low recovery time start hurting performance."
      : riskLabel === "Moderate"
        ? "This week is manageable but trending heavy. Small planning changes now can prevent the load from turning into burnout."
        : "This week looks fairly balanced. Keep protecting sleep and free time so future deadlines do not pile up suddenly.";

  return {
    risk_label: riskLabel,
    risk_score: riskScore,
    summary,
    contributing_factors: contributingFactors,
    insights,
    score_breakdown: breakdown,
    recommendations: recommendations.slice(0, 4),
    analysis_source: "local"
  };
}
