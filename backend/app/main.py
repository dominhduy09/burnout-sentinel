from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import AnalysisResponse, HealthResponse, PlannerInput
from .predictor import BurnoutPredictor
from .recommendations import build_recommendations

app = FastAPI(
    title="Burnout Sentinel API",
    version="0.2.1",
    description="API for estimating student overload risk and returning planning guidance.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = BurnoutPredictor()


@app.get("/health", response_model=HealthResponse)
def healthcheck() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/api/v1/analyze", response_model=AnalysisResponse)
def analyze_schedule(payload: PlannerInput) -> AnalysisResponse:
    prediction = predictor.predict(payload)
    recommendations = build_recommendations(payload, prediction.risk_score)

    if prediction.risk_label == "High":
        summary = (
            "This schedule shows a high overload risk. The biggest opportunity is to reduce compression "
            "before stress and low recovery time start hurting performance."
        )
    elif prediction.risk_label == "Moderate":
        summary = (
            "This week is manageable but trending heavy. Small planning changes now can prevent the load "
            "from turning into burnout."
        )
    else:
        summary = (
            "This week looks fairly balanced. Keep protecting sleep and free time so future deadlines do "
            "not pile up suddenly."
        )

    return AnalysisResponse(
        risk_label=prediction.risk_label,
        risk_score=prediction.risk_score,
        summary=summary,
        contributing_factors=prediction.contributing_factors,
        insights=prediction.insights,
        recommendations=recommendations,
    )
