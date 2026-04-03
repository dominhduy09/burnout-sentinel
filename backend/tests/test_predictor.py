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
