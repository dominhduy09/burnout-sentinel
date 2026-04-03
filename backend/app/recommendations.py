from __future__ import annotations

from .models import PlannerInput, Recommendation


def build_recommendations(payload: PlannerInput, risk_score: int) -> list[Recommendation]:
    recommendations: list[Recommendation] = []

    if payload.task_count >= 20 or payload.high_priority_task_count >= 5:
        recommendations.append(
            Recommendation(
                title="Reduce decision fatigue",
                detail="Group low-stakes tasks together and identify the top 3 must-finish items for the week.",
                priority="high",
            )
        )

    if payload.exam_count >= 2:
        recommendations.append(
            Recommendation(
                title="Start exam prep earlier",
                detail="Move review blocks earlier in the week so exam days are not carrying both studying and submission pressure.",
                priority="high",
            )
        )

    if payload.average_sleep_hours < 7:
        recommendations.append(
            Recommendation(
                title="Protect sleep before peak days",
                detail="Block one earlier bedtime before your heaviest class or clinical day to reduce cognitive overload.",
                priority="high",
            )
        )

    if payload.clinical_hours >= 16:
        recommendations.append(
            Recommendation(
                title="Add recovery buffers around clinicals",
                detail="Avoid placing your hardest assignments directly after long clinical hours. Reserve lighter tasks for those windows.",
                priority="medium",
            )
        )

    if payload.free_hours < 10:
        recommendations.append(
            Recommendation(
                title="Create buffer time",
                detail="Leave at least two short open blocks this week so unexpected tasks do not push the whole schedule off track.",
                priority="high",
            )
        )

    if payload.stress_level >= 7:
        recommendations.append(
            Recommendation(
                title="Use support before stress spikes further",
                detail="Check in with a classmate, mentor, or campus support resource this week instead of waiting for the schedule to get harder.",
                priority="medium",
            )
        )

    if risk_score < 40:
        recommendations.append(
            Recommendation(
                title="Keep the current balance",
                detail="Your week looks manageable. Keep using consistent study blocks and protect the recovery time you already have.",
                priority="low",
            )
        )

    if not recommendations:
        recommendations.append(
            Recommendation(
                title="Maintain a simple weekly review",
                detail="Spend 10 minutes each Sunday checking upcoming tasks, sleep goals, and major deadlines so the next week stays realistic.",
                priority="low",
            )
        )

    return recommendations[:4]

