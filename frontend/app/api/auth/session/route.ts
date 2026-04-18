import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "burnout_session";

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return NextResponse.json({ loggedIn: false, user: null });
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as { name?: string; email?: string };
    if (!parsed?.name || !parsed?.email) {
      return NextResponse.json({ loggedIn: false, user: null });
    }

    return NextResponse.json({
      loggedIn: true,
      user: {
        name: parsed.name,
        email: parsed.email
      }
    });
  } catch {
    return NextResponse.json({ loggedIn: false, user: null });
  }
}
