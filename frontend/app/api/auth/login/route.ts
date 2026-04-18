import { NextResponse } from "next/server";

type LoginPayload = {
  name?: string;
  email?: string;
};

const SESSION_COOKIE = "burnout_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required." }, { status: 400 });
    }

    const session = encodeURIComponent(
      JSON.stringify({
        name,
        email,
        loggedInAt: new Date().toISOString()
      })
    );

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: session,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Invalid login payload." }, { status: 400 });
  }
}
