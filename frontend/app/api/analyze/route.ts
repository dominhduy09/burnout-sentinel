import { NextResponse } from "next/server";

import { analyzePlannerInput } from "@/lib/analyzer";
import { plannerSchema } from "@/lib/types";

const BACKEND_URL = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = plannerSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid planner input.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const payload = await response.json();
    return NextResponse.json({
      ...payload,
      analysis_source: "backend"
    });
  } catch {
    const fallback = analyzePlannerInput(parsed.data);
    return NextResponse.json(fallback);
  }
}

