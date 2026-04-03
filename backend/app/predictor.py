from __future__ import annotations

from dataclasses import dataclass

from .models import Insight, PlannerInput, RiskLabel


@dataclass
class PredictionResult:
    risk_score: int
    risk_label: RiskLabel
    contributing_factors: list[str]
    insights: list[Insight]


class BurnoutPredictor:
    """
    MVP predictor that stays explainable for Expo demos.

    The shape mirrors a future ML-backed service so we can swap in a trained
    scikit-learn model later without changing the API contract.
    """

    def predict(self, payload: PlannerInput) -> PredictionResult:
        task_pressure = min(100.0, (payload.task_count / 24.0) * 100.0)
        priority_pressure = min(100.0, (payload.high_priority_task_count / 8.0) * 100.0)
        study_pressure = min(100.0, (payload.estimated_task_hours / 35.0) * 100.0)
        exam_pressure = min(100.0, (payload.exam_count / 3.0) * 100.0)
        clinical_pressure = min(100.0, (payload.clinical_hours / 18.0) * 100.0)
        sleep_penalty = max(0.0, ((8.0 - payload.average_sleep_hours) / 3.0) * 100.0)
        stress_signal = ((payload.stress_level - 1) / 9.0) * 100.0
        recovery_penalty = max(0.0, ((14.0 - payload.free_hours) / 14.0) * 100.0)

        weighted_score = (
            (task_pressure * 0.18)
            + (priority_pressure * 0.12)
            + (study_pressure * 0.16)
            + (exam_pressure * 0.12)
            + (clinical_pressure * 0.12)
            + (sleep_penalty * 0.14)
            + (stress_signal * 0.12)
            + (recovery_penalty * 0.04)
        )
        risk_score = max(0, min(100, round(weighted_score)))

        if risk_score >= 70:
            risk_label: RiskLabel = "High"
        elif risk_score >= 40:
            risk_label = "Moderate"
        else:
            risk_label = "Low"

        contributing_factors: list[str] = []
        if payload.task_count >= 20:
            contributing_factors.append("High task count is crowding the week.")
        if payload.high_priority_task_count >= 5:
            contributing_factors.append("Too many high-priority tasks are competing for attention.")
        if payload.estimated_task_hours >= 30:
            contributing_factors.append("Study and assignment hours are stacking up quickly.")
        if payload.exam_count >= 2:
            contributing_factors.append("Multiple exams create a concentrated stress spike.")
        if payload.clinical_hours >= 16:
            contributing_factors.append("Clinical hours reduce recovery time and scheduling flexibility.")
        if payload.average_sleep_hours < 7:
            contributing_factors.append("Sleep is below the recommended range for sustained focus.")
        if payload.stress_level >= 7:
            contributing_factors.append("Self-reported stress is already elevated.")
        if payload.free_hours < 10:
            contributing_factors.append("There is very little buffer time left in the week.")

        if not contributing_factors:
            contributing_factors.append("The current workload looks balanced overall.")

        insights = [
            self._build_insight(
                label="Task Load",
                value=payload.task_count,
                healthy_max=16,
                warning_max=22,
                unit="tasks",
            ),
            self._build_insight(
                label="Priority Tasks",
                value=payload.high_priority_task_count,
                healthy_max=3,
                warning_max=5,
                unit="tasks",
            ),
            self._build_insight(
                label="Work Hours",
                value=payload.academic_load_hours,
                healthy_max=28,
                warning_max=40,
                unit="hours",
            ),
            self._build_inverse_insight(
                label="Sleep",
                value=payload.average_sleep_hours,
                healthy_min=7.5,
                warning_min=6.5,
                unit="hours/night",
            ),
            self._build_inverse_insight(
                label="Free Time",
                value=payload.free_hours,
                healthy_min=16,
                warning_min=10,
                unit="hours/week",
            ),
        ]

        return PredictionResult(
            risk_score=risk_score,
            risk_label=risk_label,
            contributing_factors=contributing_factors,
            insights=insights,
        )

    def _build_insight(
        self,
        *,
        label: str,
        value: float,
        healthy_max: float,
        warning_max: float,
        unit: str,
    ) -> Insight:
        if value <= healthy_max:
            status = "healthy"
        elif value <= warning_max:
            status = "watch"
        else:
            status = "risk"

        return Insight(
            label=label,
            value=round(value, 1),
            status=status,
        )

    def _build_inverse_insight(
        self,
        *,
        label: str,
        value: float,
        healthy_min: float,
        warning_min: float,
        unit: str,
    ) -> Insight:
        if value >= healthy_min:
            status = "healthy"
        elif value >= warning_min:
            status = "watch"
        else:
            status = "risk"

        return Insight(
            label=label,
            value=round(value, 1),
            status=status,
        )
