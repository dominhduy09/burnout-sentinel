import type { AnalysisResponse, Insight, PlannerFormValues } from "@/lib/types";

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
  const taskPressure = Math.min(100, (payload.task_count / 24) * 100);
  const priorityPressure = Math.min(100, (payload.high_priority_task_count / 8) * 100);
  const studyPressure = Math.min(100, (payload.estimated_task_hours / 35) * 100);
  const examPressure = Math.min(100, (payload.exam_count / 3) * 100);
  const clinicalPressure = Math.min(100, (payload.clinical_hours / 18) * 100);
  const sleepPenalty = Math.max(0, ((8 - payload.average_sleep_hours) / 3) * 100);
  const stressSignal = ((payload.stress_level - 1) / 9) * 100;
  const recoveryPenalty = Math.max(0, ((14 - payload.free_hours) / 14) * 100);

  const riskScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        taskPressure * 0.18 +
          priorityPressure * 0.12 +
          studyPressure * 0.16 +
          examPressure * 0.12 +
          clinicalPressure * 0.12 +
          sleepPenalty * 0.14 +
          stressSignal * 0.12 +
          recoveryPenalty * 0.04
      )
    )
  );

  const riskLabel: AnalysisResponse["risk_label"] =
    riskScore >= 70 ? "High" : riskScore >= 40 ? "Moderate" : "Low";

  const contributingFactors: string[] = [];
  if (payload.task_count >= 20) {
    contributingFactors.push("High task count is crowding the week.");
  }
  if (payload.high_priority_task_count >= 5) {
    contributingFactors.push("Too many high-priority tasks are competing for attention.");
  }
  if (payload.estimated_task_hours >= 30) {
    contributingFactors.push("Study and assignment hours are stacking up quickly.");
  }
  if (payload.exam_count >= 2) {
    contributingFactors.push("Multiple exams create a concentrated stress spike.");
  }
  if (payload.clinical_hours >= 16) {
    contributingFactors.push("Clinical hours reduce recovery time and scheduling flexibility.");
  }
  if (payload.average_sleep_hours < 7) {
    contributingFactors.push("Sleep is below the recommended range for sustained focus.");
  }
  if (payload.stress_level >= 7) {
    contributingFactors.push("Self-reported stress is already elevated.");
  }
  if (payload.free_hours < 10) {
    contributingFactors.push("There is very little buffer time left in the week.");
  }
  if (!contributingFactors.length) {
    contributingFactors.push("The current workload looks balanced overall.");
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
    buildInsight("Work Hours", payload.estimated_task_hours + payload.clinical_hours, 28, 40, "hours"),
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
    recommendations: recommendations.slice(0, 4),
    analysis_source: "local"
  };
}
