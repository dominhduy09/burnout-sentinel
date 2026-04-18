import pytest

from app.models import PlannerInput
from app.predictor import BurnoutPredictor


def test_predictor_returns_high_risk_for_overloaded_week() -> None:
    predictor = BurnoutPredictor()
    payload = PlannerInput(
        task_count=26,
        high_priority_task_count=7,
        estimated_task_hours=34,
        exam_count=3,
        clinical_hours=20,
        average_sleep_hours=5.8,
        stress_level=9,
        free_hours=5,
    )

    result = predictor.predict(payload)

    assert result.risk_label == "High"
    assert result.risk_score >= 70


def test_predictor_returns_low_risk_for_balanced_week() -> None:
    predictor = BurnoutPredictor()
    payload = PlannerInput(
        task_count=9,
        high_priority_task_count=2,
        estimated_task_hours=14,
        exam_count=0,
        clinical_hours=6,
        average_sleep_hours=8.1,
        stress_level=3,
        free_hours=22,
    )

    result = predictor.predict(payload)

    assert result.risk_label == "Low"
    assert result.risk_score < 40


def test_rejects_high_priority_above_task_count() -> None:
    with pytest.raises(ValueError):
        PlannerInput(
            task_count=3,
            high_priority_task_count=4,
            estimated_task_hours=6,
            exam_count=0,
            clinical_hours=2,
            average_sleep_hours=7.5,
            stress_level=4,
            free_hours=14,
        )


def test_week_name_is_trimmed() -> None:
    payload = PlannerInput(
        week_name="  Finals Week  ",
        task_count=10,
        high_priority_task_count=3,
        estimated_task_hours=12,
        exam_count=1,
        clinical_hours=6,
        average_sleep_hours=7.4,
        stress_level=5,
        free_hours=16,
    )

    assert payload.week_name == "Finals Week"


def test_week_name_cannot_be_blank() -> None:
    with pytest.raises(ValueError):
        PlannerInput(
            week_name="   ",
            task_count=10,
            high_priority_task_count=3,
            estimated_task_hours=12,
            exam_count=1,
            clinical_hours=6,
            average_sleep_hours=7.4,
            stress_level=5,
            free_hours=16,
        )
