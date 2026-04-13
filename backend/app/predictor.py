from __future__ import annotations

from dataclasses import dataclass

from .models import Insight, PlannerInput, RiskLabel, ScoreBreakdownItem


@dataclass
class PredictionResult:
    risk_score: int
    risk_label: RiskLabel
    contributing_factors: list[str]
    insights: list[Insight]
    score_breakdown: list[ScoreBreakdownItem]


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def _ratio(value: float, minimum: float, maximum: float) -> float:
    if maximum <= minimum:
        return 0.0
    return _clamp((value - minimum) / (maximum - minimum), 0.0, 1.0)


class BurnoutPredictor:
    """
    MVP predictor that stays explainable for Expo demos.

    The shape mirrors a future ML-backed service so we can swap in a trained
    scikit-learn model later without changing the API contract.
    """

    def predict(self, payload: PlannerInput) -> PredictionResult:
        # -------------------------
        # 1) Build normalized signals
        # -------------------------
        # Demand-side pressures (0..100).
        task_pressure = _ratio(payload.task_count, 0.0, 24.0) * 100.0
        critical_pressure = _ratio(payload.high_priority_task_count, 0.0, 8.0) * 100.0
        load_pressure = _ratio(payload.academic_load_hours, 0.0, 42.0) * 100.0
        exam_pressure = _ratio(payload.exam_count, 0.0, 3.0) * 100.0
        clinical_pressure = _ratio(payload.clinical_hours, 0.0, 20.0) * 100.0

        # Recovery deficits (0..100) with a gentle nonlinearity so low sleep ramps faster.
        sleep_deficit_ratio = _ratio(8.0 - payload.average_sleep_hours, 0.0, 3.0)
        sleep_deficit = (sleep_deficit_ratio**1.7) * 100.0
        buffer_deficit_ratio = _ratio(16.0 - payload.free_hours, 0.0, 16.0)
        buffer_deficit = (buffer_deficit_ratio**1.3) * 100.0

        stress_signal = _ratio(payload.stress_level - 1.0, 0.0, 9.0) * 100.0

        # -------------------------
        # 2) Base risk (additive, explainable)
        # -------------------------
        demand_score = (
            (task_pressure * 0.20)
            + (critical_pressure * 0.20)
            + (load_pressure * 0.30)
            + (exam_pressure * 0.15)
            + (clinical_pressure * 0.15)
        )
        recovery_deficit_score = (sleep_deficit * 0.65) + (buffer_deficit * 0.35)

        # Base risk is intentionally linear: you can explain it to a judge in one sentence.
        demand_term = demand_score * 0.55
        recovery_term = recovery_deficit_score * 0.30
        stress_term = stress_signal * 0.15
        base_risk = _clamp(demand_term + recovery_term + stress_term, 0.0, 100.0)

        # -------------------------
        # 3) Multipliers (where "low sleep increases risk by X%" comes from)
        # -------------------------
        compression_ratio = _ratio(payload.task_count - 16.0, 0.0, 12.0)

        m_sleep = 1.0 + (0.22 * sleep_deficit_ratio)
        m_buffer = 1.0 + (0.15 * buffer_deficit_ratio)
        m_compression = 1.0 + (0.10 * compression_ratio)
        m_deadlines = 1.0 + (0.08 if payload.exam_count >= 2 else 0.0) + (0.06 if (payload.exam_count >= 2 and payload.high_priority_task_count >= 5) else 0.0)
        m_clinical = 1.0 + (0.08 * _ratio(payload.clinical_hours - 12.0, 0.0, 18.0))

        score_after_sleep = base_risk * m_sleep
        sleep_effect = score_after_sleep - base_risk

        score_after_buffer = score_after_sleep * m_buffer
        buffer_effect = score_after_buffer - score_after_sleep

        score_after_compression = score_after_buffer * m_compression
        compression_effect = score_after_compression - score_after_buffer

        score_after_deadlines = score_after_compression * m_deadlines
        deadlines_effect = score_after_deadlines - score_after_compression

        score_after_clinical = score_after_deadlines * m_clinical
        clinical_effect = score_after_clinical - score_after_deadlines

        risk_score = int(round(_clamp(score_after_clinical, 0.0, 100.0)))

        if risk_score >= 70:
            risk_label: RiskLabel = "High"
        elif risk_score >= 40:
            risk_label = "Moderate"
        else:
            risk_label = "Low"

        score_breakdown = self._build_breakdown(
            risk_score=risk_score,
            demand_term=demand_term,
            recovery_term=recovery_term,
            stress_term=stress_term,
            sleep_effect=sleep_effect,
            buffer_effect=buffer_effect,
            compression_effect=compression_effect,
            deadlines_effect=deadlines_effect,
            clinical_effect=clinical_effect,
            payload=payload,
            m_sleep=m_sleep,
            m_buffer=m_buffer,
            m_compression=m_compression,
            m_deadlines=m_deadlines,
            m_clinical=m_clinical,
        )

        contributing_factors = self._build_contributing_factors(payload, score_breakdown)

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
            score_breakdown=score_breakdown,
        )

    def _build_contributing_factors(
        self, payload: PlannerInput, breakdown: list[ScoreBreakdownItem]
    ) -> list[str]:
        drivers = [item for item in breakdown if item.direction in ("risk", "multiplier") and item.points >= 3.0]
        drivers = sorted(drivers, key=lambda item: item.points, reverse=True)[:4]

        factors = [item.detail for item in drivers]
        if not factors:
            factors.append("The current workload looks balanced overall.")

        if payload.average_sleep_hours < 6.5 and all("Sleep" not in f for f in factors):
            factors.append("Sleep is low enough to amplify workload stress.")

        return factors

    def _build_breakdown(
        self,
        *,
        risk_score: int,
        demand_term: float,
        recovery_term: float,
        stress_term: float,
        sleep_effect: float,
        buffer_effect: float,
        compression_effect: float,
        deadlines_effect: float,
        clinical_effect: float,
        payload: PlannerInput,
        m_sleep: float,
        m_buffer: float,
        m_compression: float,
        m_deadlines: float,
        m_clinical: float,
    ) -> list[ScoreBreakdownItem]:
        score = max(1, risk_score)

        def pct(points: float) -> float:
            return round(_clamp((abs(points) / score) * 100.0, 0.0, 100.0), 1)

        items: list[ScoreBreakdownItem] = [
            ScoreBreakdownItem(
                key="demand",
                label="Workload demand",
                points=round(demand_term, 1),
                direction="risk",
                percent_of_score=pct(demand_term),
                detail=(
                    "Hours, tasks, exams, and clinical load combine into a demand baseline."
                ),
            ),
            ScoreBreakdownItem(
                key="recovery",
                label="Recovery deficit",
                points=round(recovery_term, 1),
                direction="risk",
                percent_of_score=pct(recovery_term),
                detail=(
                    "Less sleep and less free time reduce the week’s recovery capacity."
                ),
            ),
            ScoreBreakdownItem(
                key="stress",
                label="Current stress signal",
                points=round(stress_term, 1),
                direction="risk",
                percent_of_score=pct(stress_term),
                detail="Self-reported stress raises the baseline risk for this week.",
            ),
            ScoreBreakdownItem(
                key="mult_sleep",
                label="Sleep amplifier",
                points=round(sleep_effect, 1),
                direction="multiplier",
                percent_of_score=pct(sleep_effect),
                detail=(
                    f"Avg sleep {payload.average_sleep_hours:.1f}h applies ~{round((m_sleep - 1.0) * 100)}% amplification."
                ),
            ),
            ScoreBreakdownItem(
                key="mult_buffer",
                label="Buffer-time amplifier",
                points=round(buffer_effect, 1),
                direction="multiplier",
                percent_of_score=pct(buffer_effect),
                detail=(
                    f"Open buffer {payload.free_hours:.1f}h applies ~{round((m_buffer - 1.0) * 100)}% amplification."
                ),
            ),
            ScoreBreakdownItem(
                key="mult_compression",
                label="Context-switching amplifier",
                points=round(compression_effect, 1),
                direction="multiplier",
                percent_of_score=pct(compression_effect),
                detail=(
                    f"High task count ({payload.task_count}) adds ~{round((m_compression - 1.0) * 100)}% decision fatigue."
                ),
            ),
            ScoreBreakdownItem(
                key="mult_deadlines",
                label="Deadline clustering amplifier",
                points=round(deadlines_effect, 1),
                direction="multiplier",
                percent_of_score=pct(deadlines_effect),
                detail=(
                    f"Exams/checkoffs ({payload.exam_count}) apply ~{round((m_deadlines - 1.0) * 100)}% deadline pressure."
                ),
            ),
            ScoreBreakdownItem(
                key="mult_clinical",
                label="Clinical intensity amplifier",
                points=round(clinical_effect, 1),
                direction="multiplier",
                percent_of_score=pct(clinical_effect),
                detail=(
                    f"Clinical hours ({payload.clinical_hours:.1f}h) apply ~{round((m_clinical - 1.0) * 100)}% fatigue overhead."
                ),
            ),
        ]

        # Drop tiny/noise items for readability.
        filtered = [item for item in items if abs(item.points) >= 0.5]
        return filtered

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
