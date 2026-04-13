from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, computed_field


RiskLabel = Literal["Low", "Moderate", "High"]
Priority = Literal["high", "medium", "low"]
BreakdownDirection = Literal["risk", "protective", "multiplier"]


class PlannerInput(BaseModel):
    week_name: str = Field(default="This Week", min_length=1, max_length=60)
    task_count: int = Field(ge=0, le=60)
    high_priority_task_count: int = Field(ge=0, le=20)
    estimated_task_hours: float = Field(ge=0, le=100)
    exam_count: int = Field(ge=0, le=10)
    clinical_hours: float = Field(ge=0, le=60)
    average_sleep_hours: float = Field(ge=0, le=12)
    stress_level: int = Field(ge=1, le=10)
    free_hours: float = Field(ge=0, le=80)

    @computed_field
    @property
    def academic_load_hours(self) -> float:
        return round(self.estimated_task_hours + self.clinical_hours, 1)


class Recommendation(BaseModel):
    title: str
    detail: str
    priority: Priority


class Insight(BaseModel):
    label: str
    value: float
    status: Literal["healthy", "watch", "risk"]


class ScoreBreakdownItem(BaseModel):
    key: str
    label: str
    points: float
    direction: BreakdownDirection
    detail: str
    percent_of_score: float = Field(ge=0, le=100)


class AnalysisResponse(BaseModel):
    risk_label: RiskLabel
    risk_score: int = Field(ge=0, le=100)
    summary: str
    contributing_factors: list[str]
    insights: list[Insight]
    score_breakdown: list[ScoreBreakdownItem]
    recommendations: list[Recommendation]


class HealthResponse(BaseModel):
    status: Literal["ok"]
